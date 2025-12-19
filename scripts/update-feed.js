#!/usr/bin/env node
/**
 * update-feed.js - Fetch and cache AHK v2 repositories from GitHub
 *
 * This script fetches AutoHotkey v2 repositories from GitHub's API
 * and stores them locally for faster loading and offline support.
 *
 * Usage:
 *   node scripts/update-feed.js
 *
 * Environment Variables:
 *   GITHUB_TOKEN - Optional. GitHub personal access token for higher rate limits
 *   FEED_LIMIT   - Optional. Number of repos to fetch (default: 100)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  outputPath: path.join(__dirname, '..', 'data', 'ahk-scripts-feed.json'),
  limit: parseInt(process.env.FEED_LIMIT || '100', 10),
  queries: [
    'autohotkey v2 language:AutoHotkey',
    '"autohotkey 2" language:AutoHotkey',
    'ahk v2 language:AutoHotkey',
    'topic:autohotkey-v2'
  ],
  apiBase: 'api.github.com'
};

/**
 * Make an HTTPS request to GitHub API
 */
function fetchFromGitHub(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: CONFIG.apiBase,
      path: endpoint,
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AHKv2-LLMs-Update-Script'
      }
    };

    // Add auth token if available
    if (process.env.GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else if (res.statusCode === 403) {
          reject(new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN for higher limits.'));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Search repositories with a given query
 */
async function searchRepos(query, perPage = 30) {
  const encodedQuery = encodeURIComponent(query);
  const endpoint = `/search/repositories?q=${encodedQuery}&sort=updated&order=desc&per_page=${perPage}`;

  console.log(`  Searching: ${query}`);
  const result = await fetchFromGitHub(endpoint);
  return result.items || [];
}

/**
 * Extract relevant fields from repository data
 */
function normalizeRepo(repo) {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    html_url: repo.html_url,
    description: repo.description || '',
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    language: repo.language || 'AutoHotkey',
    topics: repo.topics || [],
    updated_at: repo.updated_at,
    created_at: repo.created_at,
    pushed_at: repo.pushed_at,
    owner: {
      login: repo.owner.login,
      avatar_url: repo.owner.avatar_url,
      html_url: repo.owner.html_url
    },
    default_branch: repo.default_branch,
    open_issues_count: repo.open_issues_count,
    license: repo.license ? repo.license.spdx_id : null,
    is_archived: repo.archived,
    is_fork: repo.fork
  };
}

/**
 * Deduplicate repos by ID
 */
function deduplicateRepos(repos) {
  const seen = new Set();
  return repos.filter(repo => {
    if (seen.has(repo.id)) return false;
    seen.add(repo.id);
    return true;
  });
}

/**
 * Sort repos by update time (newest first)
 */
function sortByUpdated(repos) {
  return repos.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

/**
 * Main update function
 */
async function updateFeed() {
  console.log('AHK v2 Feed Updater');
  console.log('===================\n');

  const startTime = Date.now();
  let allRepos = [];

  // Fetch from multiple queries
  console.log('Fetching repositories...');
  for (const query of CONFIG.queries) {
    try {
      const repos = await searchRepos(query, 30);
      allRepos.push(...repos.map(normalizeRepo));

      // Rate limit protection - wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  Error with query "${query}": ${error.message}`);
    }
  }

  // Process results
  console.log('\nProcessing results...');
  allRepos = deduplicateRepos(allRepos);
  allRepos = sortByUpdated(allRepos);

  // Limit to configured max
  if (allRepos.length > CONFIG.limit) {
    allRepos = allRepos.slice(0, CONFIG.limit);
  }

  // Create feed data structure
  const feedData = {
    metadata: {
      updated_at: new Date().toISOString(),
      total_count: allRepos.length,
      version: '1.0.0',
      source: 'GitHub API',
      queries_used: CONFIG.queries
    },
    repositories: allRepos
  };

  // Ensure output directory exists
  const outputDir = path.dirname(CONFIG.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to file
  fs.writeFileSync(CONFIG.outputPath, JSON.stringify(feedData, null, 2));

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n===================');
  console.log('Update Complete!');
  console.log(`  Repositories: ${allRepos.length}`);
  console.log(`  Output: ${CONFIG.outputPath}`);
  console.log(`  Time: ${elapsed}s`);
  console.log('===================\n');

  return feedData;
}

/**
 * Get current rate limit status
 */
async function checkRateLimit() {
  try {
    const result = await fetchFromGitHub('/rate_limit');
    const { limit, remaining, reset } = result.rate;
    const resetDate = new Date(reset * 1000).toLocaleTimeString();
    console.log(`Rate Limit: ${remaining}/${limit} (resets at ${resetDate})`);
    return result.rate;
  } catch (error) {
    console.error('Could not check rate limit:', error.message);
    return null;
  }
}

// Run if called directly
if (require.main === module) {
  (async () => {
    try {
      await checkRateLimit();
      console.log('');
      await updateFeed();
    } catch (error) {
      console.error('Fatal error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { updateFeed, checkRateLimit, searchRepos };
