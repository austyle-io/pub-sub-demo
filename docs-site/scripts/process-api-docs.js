#!/usr/bin/env node

const fs = require('node:fs').promises;
const path = require('node:path');

/**
 * Post-process TypeDoc generated markdown files for Nextra
 */

const API_DOCS_PATH = path.join(__dirname, '../pages/api');

async function getAllFiles(dir, fileList = []) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await getAllFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function transformApiMarkdown(content, filePath) {
  const fileName = path.basename(filePath, '.md');

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : fileName;

  // Add frontmatter
  if (!content.startsWith('---')) {
    const frontmatter = `---
title: "${title}"
description: "API documentation for ${title}"
---

`;
    content = frontmatter + content;
  }

  // Transform TypeDoc specific markdown
  content = content
    // Fix module links
    .replace(/\[modules\/([^\]]+)\]\(modules\/([^)]+)\)/g, '[$1]($2)')
    // Fix relative links
    .replace(/\]\((?!http|#|\/)(.*?)\.md\)/g, ']($1)')
    // Clean up extra escaping
    .replace(/\\_/g, '_');

  return content;
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const transformedContent = transformApiMarkdown(content, filePath);

    // Rename to .mdx
    const newPath = filePath.replace(/\.md$/, '.mdx');
    await fs.writeFile(newPath, transformedContent);

    // Remove original .md file
    await fs.unlink(filePath);

    console.log(`✅ Processed: ${path.relative(API_DOCS_PATH, filePath)}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

async function createApiMeta() {
  // Create main API meta
  const mainMeta = {
    README: 'Overview',
    apps: 'Applications',
    packages: 'Packages',
  };

  await fs.writeFile(
    path.join(API_DOCS_PATH, '_meta.js'),
    `export default ${JSON.stringify(mainMeta, null, 2)}`,
  );

  console.log('✅ Created API meta file');
}

async function processApiDocs() {
  console.log('🚀 Processing API documentation...\n');

  const markdownFiles = await getAllFiles(API_DOCS_PATH);

  // Process all markdown files
  for (const file of markdownFiles) {
    await processFile(file);
  }

  // Create meta files
  await createApiMeta();

  console.log('\n✨ API documentation processing complete!');
}

// Run processing
processApiDocs().catch(console.error);
