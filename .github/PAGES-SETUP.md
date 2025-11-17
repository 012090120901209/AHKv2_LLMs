# GitHub Pages Setup Instructions

## Issue
The Chirpy theme is not supported by the default GitHub Pages build process. This repository is configured to use GitHub Actions for building and deploying.

## Solution
You need to change the GitHub Pages source setting to use GitHub Actions:

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Build and deployment**, find the **Source** dropdown
4. Change from "Deploy from a branch" to **GitHub Actions**
5. Save the changes

## What This Does
- Disables the default GitHub Pages build process (which doesn't support Chirpy)
- Enables the custom GitHub Actions workflow at `.github/workflows/pages-deploy.yml`
- The workflow will automatically build and deploy your site whenever you push to main

## Verification
After changing the setting:
1. Go to the **Actions** tab in your repository
2. You should see the "Deploy Jekyll with Chirpy to GitHub Pages" workflow running
3. Once it completes successfully, your site will be live at https://012090120901209.github.io/AHKv2_LLMs

## Files Already Configured
- ✅ `.github/workflows/pages-deploy.yml` - GitHub Actions workflow
- ✅ `Gemfile` - Jekyll and Chirpy dependencies
- ✅ `_config.yml` - Site configuration with Chirpy theme
