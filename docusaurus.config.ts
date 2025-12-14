import {Config} from '@docusaurus/types';
import {Preset} from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AHK v2 LLMs',
  tagline: 'Docusaurus-inspired knowledge hub for AHK v2 model testing',
  favicon: 'img/ahk-logo.png',
  url: 'https://example.com',
  baseUrl: '/',
  organizationName: 'ahk-community',
  projectName: 'ahkv2-llms',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl: undefined,
        },
        blog: {
          showReadingTime: true,
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All posts',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/ahk-logo.png',
    navbar: {
      title: 'AHK v2 LLMs',
      logo: {
        alt: 'AHK logo',
        src: 'img/ahk-logo.png',
        width: 40,
        height: 40,
      },
      items: [
        {type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Docs'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/012090120901209/AHKv2_LLMs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/012090120901209/AHKv2_LLMs',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Docs',
              to: '/docs/intro',
            },
            {
              label: 'Blog',
              to: '/blog',
            },
          ],
        },
      ],
      copyright: `Built with Docusaurus.`,
    },
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
      additionalLanguages: ['autohotkey'],
    },
  },
};

export default config;
