import type { DocsThemeConfig } from 'nextra-theme-docs';
import React from 'react';

const config: DocsThemeConfig = {
  logo: <span>Collab Edit Docs</span>,
  project: {
    link: 'https://github.com/austyle-io/pub-sub-demo',
  },
  docsRepositoryBase:
    'https://github.com/austyle-io/pub-sub-demo/tree/main/docs-site',
  footer: {
    text: `Collaborative Document Editing Demo ${new Date().getFullYear()}`,
  },
  // Search configuration
  search: {
    emptyResult: (
      <div className="nx-mt-4 nx-flex nx-justify-center nx-text-gray-400 nx-text-sm">
        No results found.
      </div>
    ),
    placeholder: 'Search documentation...',
  },
  // Theme configuration
  primaryHue: 210,
  darkMode: true,
  // Sidebar configuration
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  // Table of contents
  toc: {
    backToTop: true,
    float: true,
  },
  // Edit link
  editLink: {
    text: 'Edit this page on GitHub →',
  },
  // Feedback
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback',
  },
  // Navigation
  navigation: true,
  // Page title
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Collab Edit Docs',
    };
  },
  // Head tags
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Collab Edit Documentation" />
      <meta
        property="og:description"
        content="Documentation for the Collaborative Document Editing Demo"
      />
    </>
  ),
  // Banner
  banner: {
    key: 'nextra-4',
    text: '🎉 Welcome to the new documentation system powered by Nextra 4.0!',
  },
};
