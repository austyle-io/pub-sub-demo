#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { readdirSync } = require('fs');

/**
 * Migration script to convert existing markdown documentation to Nextra format
 */

const LEGACY_DOCS_PATH = path.join(__dirname, '../../docs');
const NEXTRA_PAGES_PATH = path.join(__dirname, '../pages');

// Mapping of old paths to new structure
const PATH_MAPPING = {
  '01_getting-started': 'getting-started',
  '02_architecture': 'architecture',
  '03_development': 'development',
  '04_testing': 'testing',
  '05_deployment': 'deployment',
  '99_appendix': 'appendix',
};

// Files to skip
const SKIP_FILES = [
  'documentation-system-implementation.md', // Internal planning doc
];

async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
}

function transformMarkdownContent(content, filePath) {
  // Add Nextra-specific frontmatter if missing
  if (!content.startsWith('---')) {
    const title = extractTitle(content);
    const frontmatter = `---
title: "${title}"
description: "${title}"
---

`;
    content = frontmatter + content;
  }

  // Transform relative links to work with Nextra routing
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, link) => {
    if (link.startsWith('http') || link.startsWith('#')) {
      return match;
    }

    // Convert relative paths
    let newLink = link
      .replace(/\.md$/, '')
      .replace(/^\.\//g, '')
      .replace(/^\.\.\//, '/');

    // Apply path mapping
    Object.entries(PATH_MAPPING).forEach(([old, newPath]) => {
      if (newLink.includes(old)) {
        newLink = newLink.replace(old, newPath);
      }
    });

    return `[${text}](${newLink})`;
  });

  return content;
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : 'Untitled';
}

async function migrateFile(sourcePath, targetPath) {
  try {
    const content = await fs.readFile(sourcePath, 'utf-8');
    const transformedContent = transformMarkdownContent(content, sourcePath);

    await ensureDirectory(path.dirname(targetPath));
    await fs.writeFile(targetPath, transformedContent);

    console.log(
      `✅ Migrated: ${path.relative(LEGACY_DOCS_PATH, sourcePath)} → ${path.relative(NEXTRA_PAGES_PATH, targetPath)}`,
    );
  } catch (error) {
    console.error(`❌ Error migrating ${sourcePath}:`, error);
  }
}

async function createMetaFile(directory, files) {
  const metaContent = {};

  // Sort files to ensure consistent order
  const sortedFiles = files.sort();

  sortedFiles.forEach((file) => {
    const name = path.basename(file, path.extname(file));

    // Skip index files in meta
    if (name === 'index') return;

    const title = name
      .replace(/-/g, ' ')
      .replace(/^\d+_/, '')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    metaContent[name] = title;
  });

  const metaPath = path.join(directory, '_meta.js');
  await fs.writeFile(
    metaPath,
    `export default ${JSON.stringify(metaContent, null, 2)}`,
  );
  console.log(
    `✅ Created meta file: ${path.relative(NEXTRA_PAGES_PATH, metaPath)}`,
  );
}

async function getAllMarkdownFiles(dir, fileList = []) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

async function migrate() {
  console.log('🚀 Starting documentation migration...\n');

  // Get all markdown files from legacy docs
  const markdownFiles = await getAllMarkdownFiles(LEGACY_DOCS_PATH);

  // Group files by directory
  const filesByDirectory = {};

  for (const filePath of markdownFiles) {
    const relativePath = path.relative(LEGACY_DOCS_PATH, filePath);
    const fileName = path.basename(filePath);

    if (SKIP_FILES.includes(fileName)) {
      console.log(`⏭️  Skipping: ${relativePath}`);
      continue;
    }

    // Determine target path
    let targetRelativePath = relativePath;

    // Apply path mapping
    Object.entries(PATH_MAPPING).forEach(([old, newPath]) => {
      if (relativePath.startsWith(old)) {
        targetRelativePath = relativePath.replace(old, newPath);
      }
    });

    // Convert 00_INDEX.md files to index.mdx
    if (fileName === '00_INDEX.md') {
      targetRelativePath = targetRelativePath.replace(
        '00_INDEX.md',
        'index.mdx',
      );
    } else {
      // Convert .md to .mdx
      targetRelativePath = targetRelativePath.replace(/\.md$/, '.mdx');
    }

    const targetPath = path.join(NEXTRA_PAGES_PATH, targetRelativePath);
    const targetDir = path.dirname(targetPath);

    // Track files for meta generation
    if (!filesByDirectory[targetDir]) {
      filesByDirectory[targetDir] = [];
    }
    filesByDirectory[targetDir].push(path.basename(targetPath));

    // Migrate the file
    await migrateFile(filePath, targetPath);
  }

  // Create _meta.js files for each directory
  console.log('\n📝 Creating navigation meta files...\n');

  for (const [directory, files] of Object.entries(filesByDirectory)) {
    await createMetaFile(directory, files);
  }

  console.log('\n✨ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Run "make docs-dev" to preview the documentation');
  console.log('2. Review and adjust the generated content');
  console.log('3. Customize components and styling as needed');
}

// Run migration
migrate().catch(console.error);
