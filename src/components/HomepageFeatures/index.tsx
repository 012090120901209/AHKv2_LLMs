import clsx from 'clsx';
import React from 'react';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Markdown-first authoring',
    description: (
      <>
        Drop markdown files into the <code>blog/</code> or <code>docs/</code> folders and they
        instantly become navigable routes, just like a Docusaurus site.
      </>
    ),
  },
  {
    title: 'Purpose-built test prompts',
    description: (
      <>
        Reference curated AutoHotkey v2 prompts that stress different capabilities of coding agents,
        from GUI building to reference-counted timers.
      </>
    ),
  },
  {
    title: 'Ready for collaboration',
    description: (
      <>
        Share ideas, refine desired outputs, and document learnings to continuously improve your LLM
        workflows.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
