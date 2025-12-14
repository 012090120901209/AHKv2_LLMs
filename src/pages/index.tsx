import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import HomepageFeatures from '../components/HomepageFeatures';
import styles from './index.module.css';

export default function Home(): JSX.Element {
  return (
    <Layout
      title="AHK v2 LLMs"
      description="A Docusaurus-style home for AutoHotkey v2 benchmarking prompts"
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <p className={styles.superTitle}>AutoHotkey v2 • LLM Experiments</p>
          <h1 className="hero__title">Build, document, and test your coding agents</h1>
          <p className="hero__subtitle">
            This site behaves like Docusaurus so you can continuously add markdown-driven docs and
            blog posts that cover every AutoHotkey v2 scenario you care about.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              Explore the Docs
            </Link>
            <Link className="button button--lg button--success margin-left--sm" to="/blog">
              Read the test suite blog
            </Link>
          </div>
        </div>
      </header>
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
