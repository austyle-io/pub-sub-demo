# Documentation System Implementation Plan

## Executive Summary

This plan outlines the systematic migration from the current JSDoc-based documentation to a modern hybrid approach using **Nextra 4.0** for the main documentation site and **TypeDoc** for automated API reference generation. This implementation will provide a unified, maintainable, and developer-friendly documentation system aligned with our TypeScript-first development approach.

## Current State Analysis

### Existing Documentation Infrastructure

**Current Tools:**
- ✅ JSDoc configuration (`jsdoc.json`) with basic TypeScript support
- ✅ Well-organized markdown documentation structure (`docs/`)
- ✅ OpenAPI generation for REST APIs (`packages/shared/src/openapi.ts`)
- ✅ Manual documentation in structured directories

**Current Limitations:**
- ❌ JSDoc has limited TypeScript integration
- ❌ Manual type documentation maintenance
- ❌ Fragmented documentation ecosystem
- ❌ No automated API reference generation
- ❌ Limited search and discovery capabilities

### Project Context

- **Monorepo Structure**: Apps (client/server) + shared packages
- **TypeScript-First**: Comprehensive type system [[memory:3829289]]
- **React Frontend**: Component documentation needs
- **Node.js Backend**: Service and utility documentation
- **Real-time Collaboration**: Complex API surface area

## Goals and Objectives

### Primary Goals

1. **Unified Documentation Platform**: Single source of truth for all documentation
2. **Automated API Reference**: TypeScript-driven API documentation
3. **Enhanced Developer Experience**: Modern search, navigation, and interactivity
4. **Maintainable System**: Reduced manual documentation overhead
5. **Aligned Tooling**: Consistent with React/TypeScript stack

### Success Metrics

- ✅ 100% API coverage through automated generation
- ✅ <3 second page load times for documentation site
- ✅ Zero manual API documentation maintenance
- ✅ Integrated search across all content types
- ✅ Mobile-responsive documentation experience

## Implementation Phases

## Phase 1: Foundation Setup (Week 1)

### 1.1 Nextra Installation and Configuration

**Duration**: 2 days

**Tasks:**

```bash
# Install Nextra dependencies
pnpm add nextra nextra-theme-docs next react react-dom
pnpm add -D @types/react @types/react-dom

# Create documentation site structure
mkdir -p docs-site/{pages,components,public,styles}
```

**Directory Structure:**

```
docs-site/
├── pages/                    # Nextra pages
│   ├── _app.tsx             # Next.js app configuration
│   ├── _meta.js             # Navigation configuration
│   ├── index.mdx            # Homepage
│   ├── getting-started/     # Getting started guides
│   ├── architecture/        # Architecture documentation
│   ├── development/         # Development guides
│   ├── api/                 # API reference (TypeDoc generated)
│   └── deployment/          # Deployment guides
├── components/              # Custom documentation components
│   ├── CodeBlock.tsx        # Enhanced code display
│   ├── APIPreview.tsx       # Live API examples
│   └── TypeDisplay.tsx      # TypeScript type visualization
├── public/                  # Static assets
│   ├── images/              # Documentation images
│   └── favicon.ico          # Site favicon
├── styles/                  # Custom styling
│   └── globals.css          # Global styles
├── next.config.js           # Next.js configuration
├── theme.config.tsx         # Nextra theme configuration
└── package.json             # Documentation site dependencies
```

**Configuration Files:**

```javascript
// docs-site/next.config.js
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  latex: true,
  search: {
    codeblocks: false
  },
  defaultShowCopyCode: true
});

module.exports = withNextra({
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/docs' : '',
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
});
```

```tsx
// docs-site/theme.config.tsx
import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span>Collaborative Editor Documentation</span>,
  project: {
    link: 'https://github.com/your-org/pub-sub-demo'
  },
  docsRepositoryBase: 'https://github.com/your-org/pub-sub-demo/tree/main/docs-site',
  footer: {
    text: 'Collaborative Document Editor Documentation'
  },
  search: {
    placeholder: 'Search documentation...'
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>;
      }
      return <>{title}</>;
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  toc: {
    backToTop: true
  },
  navigation: {
    prev: true,
    next: true
  },
  darkMode: true,
  primaryHue: 200,
  primarySaturation: 100
};

export default config;
```

### 1.2 TypeDoc Installation and Configuration

**Duration**: 1 day

```bash
# Install TypeDoc with plugins
pnpm add -D typedoc @typedoc/plugin-markdown typedoc-plugin-merge-modules
```

**Configuration:**

```json
// typedoc.json
{
  "entryPoints": [
    "apps/client/src/index.ts",
    "apps/server/src/index.ts",
    "packages/shared/src/index.ts"
  ],
  "out": "docs-site/pages/api",
  "plugin": [
    "typedoc-plugin-markdown",
    "typedoc-plugin-merge-modules"
  ],
  "theme": "markdown",
  "readme": "none",
  "hideGenerator": true,
  "githubPages": false,
  "gitRevision": "main",
  "sort": ["source-order"],
  "kindSortOrder": [
    "Document",
    "Project",
    "Module",
    "Namespace",
    "Enum",
    "EnumMember",
    "Class",
    "Interface",
    "TypeAlias",
    "Constructor",
    "Property",
    "Variable",
    "Function",
    "Method",
    "Parameter",
    "TypeParameter",
    "Accessor",
    "GetSignature",
    "SetSignature",
    "ObjectLiteral",
    "TypeLiteral",
    "CallSignature",
    "ConstructorSignature",
    "IndexSignature",
    "ConditionType",
    "Reference"
  ],
  "categorizeByGroup": true,
  "categoryOrder": [
    "Components",
    "Hooks",
    "Services",
    "Utils",
    "Types",
    "Constants"
  ],
  "groupOrder": [
    "Functions",
    "Classes",
    "Interfaces",
    "Type Aliases",
    "Variables",
    "Enumerations"
  ],
  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  },
  "sourceLinkTemplate": "https://github.com/your-org/pub-sub-demo/blob/{gitRevision}/{path}#L{line}",
  "visibilityFilters": {
    "protected": false,
    "private": false,
    "inherited": true,
    "external": false,
    "@alpha": false,
    "@beta": false
  }
}
```

### 1.3 Build System Integration

**Duration**: 1 day

**Makefile Updates:**

```bash
# Add to Makefile
docs-build:         ## Build documentation site
 @echo "🔨 Building documentation..."
 cd docs-site && pnpm build

docs-dev:           ## Start documentation development server
 @echo "🚀 Starting documentation server..."
 cd docs-site && pnpm dev

docs-generate:      ## Generate API documentation
 @echo "📚 Generating API documentation..."
 pnpm typedoc

docs-preview:       ## Preview built documentation
 @echo "👀 Previewing documentation..."
 cd docs-site && pnpm preview

docs-clean:         ## Clean documentation build artifacts
 @echo "🧹 Cleaning documentation..."
 rm -rf docs-site/.next docs-site/out docs-site/pages/api

docs: docs-generate docs-build  ## Build complete documentation
```

**Package.json Scripts:**

```json
{
  "scripts": {
    "docs:dev": "make docs-dev",
    "docs:build": "make docs",
    "docs:generate": "make docs-generate",
    "docs:preview": "make docs-preview",
    "docs:clean": "make docs-clean"
  }
}
```

### 1.4 Phase 1 Deliverables

- ✅ Nextra documentation site scaffolded
- ✅ TypeDoc configuration for API generation
- ✅ Build system integration
- ✅ Basic navigation structure
- ✅ Development workflow established

## Phase 2: Content Migration (Week 2)

### 2.1 Content Audit and Mapping

**Duration**: 1 day

**Current Content Analysis:**

```bash
# Audit existing documentation
find docs/ -name "*.md" | wc -l     # Count markdown files
find docs/ -name "*.md" -exec wc -w {} + | tail -1  # Word count
```

**Content Mapping Strategy:**

```
Current Structure → Nextra Structure
├── docs/00_INDEX.md → pages/index.mdx
├── docs/01_getting-started/ → pages/getting-started/
├── docs/02_architecture/ → pages/architecture/
├── docs/03_development/ → pages/development/
├── docs/04_testing/ → pages/testing/
├── docs/05_deployment/ → pages/deployment/
└── docs/99_appendix/ → pages/appendix/
```

### 2.2 Automated Content Migration

**Duration**: 2 days

**Migration Script:**

```typescript
// scripts/migrate-docs.ts
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { glob } from 'glob';

interface MigrationRule {
  source: string;
  target: string;
  transform?: (content: string) => string;
}

const migrationRules: MigrationRule[] = [
  {
    source: 'docs/00_INDEX.md',
    target: 'docs-site/pages/index.mdx',
    transform: (content) => addFrontMatter(content, {
      title: 'Documentation Home',
      description: 'Collaborative Document Editor Documentation'
    })
  },
  {
    source: 'docs/01_getting-started/**/*.md',
    target: 'docs-site/pages/getting-started/',
    transform: enhanceGettingStarted
  },
  {
    source: 'docs/03_development/**/*.md',
    target: 'docs-site/pages/development/',
    transform: addCodeEnhancements
  }
  // Additional migration rules...
];

function addFrontMatter(content: string, frontMatter: Record<string, any>): string {
  const yaml = Object.entries(frontMatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return `---\n${yaml}\n---\n\n${content}`;
}

function enhanceGettingStarted(content: string): string {
  // Add interactive elements to getting started guides
  return content
    .replace(/```bash\n(make \w+)/g, '```bash copy\n$1')
    .replace(/## Prerequisites/g, '## Prerequisites\n\nimport { Callout } from "nextra/components"\n\n<Callout type="info">\nEnsure you have the following installed before proceeding.\n</Callout>');
}

function addCodeEnhancements(content: string): string {
  // Enhanced code blocks with copy functionality
  return content
    .replace(/```(\w+)\n/g, '```$1 copy\n')
    .replace(/```bash\n(pnpm|npm|make)/g, '```bash copy\n$1');
}

// Execute migration
async function migrate() {
  for (const rule of migrationRules) {
    const files = await glob(rule.source);

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const transformed = rule.transform ? rule.transform(content) : content;
      const targetPath = calculateTargetPath(file, rule);

      mkdirSync(dirname(targetPath), { recursive: true });
      writeFileSync(targetPath, transformed);

      console.log(`Migrated: ${file} → ${targetPath}`);
    }
  }
}
```

### 2.3 Enhanced Component Development

**Duration**: 2 days

**Interactive Documentation Components:**

```tsx
// docs-site/components/CodeBlock.tsx
import { useState } from 'react';
import { CheckIcon, ClipboardIcon } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  language?: string;
  showCopy?: boolean;
  title?: string;
}

export function CodeBlock({ children, language, showCopy = true, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {title && (
        <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-medium rounded-t-lg">
          {title}
        </div>
      )}
      <pre className={`language-${language} ${title ? 'rounded-t-none' : ''}`}>
        <code>{children}</code>
        {showCopy && (
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <ClipboardIcon className="w-4 h-4 text-gray-300" />
            )}
          </button>
        )}
      </pre>
    </div>
  );
}
```

```tsx
// docs-site/components/APIPreview.tsx
import { useState, useEffect } from 'react';

interface APIPreviewProps {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  exampleRequest?: any;
  exampleResponse?: any;
}

export function APIPreview({
  endpoint,
  method,
  description,
  exampleRequest,
  exampleResponse
}: APIPreviewProps) {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async () => {
    setLoading(true);
    try {
      const result = await fetch(`/api${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: exampleRequest ? JSON.stringify(exampleRequest) : undefined
      });
      const data = await result.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 my-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-1 rounded text-xs font-mono ${
          method === 'GET' ? 'bg-green-100 text-green-800' :
          method === 'POST' ? 'bg-blue-100 text-blue-800' :
          method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {method}
        </span>
        <code className="text-sm">{endpoint}</code>
      </div>
      <p className="text-gray-600 mb-3">{description}</p>

      <button
        onClick={testEndpoint}
        disabled={loading}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>

      {response && (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-1">Response:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            <code>{JSON.stringify(response, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
```

```tsx
// docs-site/components/TypeDisplay.tsx
interface TypeDisplayProps {
  type: string;
  description?: string;
  properties?: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
  }>;
}

export function TypeDisplay({ type, description, properties }: TypeDisplayProps) {
  return (
    <div className="border rounded-lg p-4 my-4 bg-gray-50">
      <h4 className="font-mono text-lg font-medium mb-2">{type}</h4>
      {description && <p className="text-gray-600 mb-3">{description}</p>}

      {properties && (
        <div className="space-y-2">
          <h5 className="font-medium">Properties:</h5>
          <div className="space-y-1">
            {properties.map((prop) => (
              <div key={prop.name} className="flex items-start gap-2">
                <code className="text-sm bg-white px-2 py-1 rounded">
                  {prop.name}{!prop.required && '?'}: {prop.type}
                </code>
                {prop.description && (
                  <span className="text-sm text-gray-600">{prop.description}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 2.4 Phase 2 Deliverables

- ✅ Complete content migration from existing docs
- ✅ Enhanced interactive components
- ✅ Automated migration scripts
- ✅ Improved navigation structure
- ✅ Code block enhancements with copy functionality

## Phase 3: API Documentation Generation (Week 3)

### 3.1 TypeScript Documentation Enhancement

**Duration**: 2 days

**Enhanced TSDoc Comments:**

Following our [[memory:3820036]] type guard patterns and [[memory:3829289]] TypeScript practices:

```typescript
// apps/server/src/services/auth.service.ts
/**
 * Authentication service providing secure user management.
 *
 * @remarks
 * This service implements JWT-based authentication with refresh tokens,
 * following security best practices for session management.
 *
 * @example
 * ```typescript
 * const authService = new AuthService();
 * const user = await authService.authenticate(token);
 * if (user) {
 *   // User is authenticated
 * }
 * ```
 */
export class AuthService {
  /**
   * Validates user credentials and returns authentication result.
   *
   * @param credentials - User login credentials
   * @returns Promise resolving to authentication result with user data and tokens
   *
   * @throws {@link ValidationError} When credentials are invalid
   * @throws {@link AuthenticationError} When authentication fails
   *
   * @example
   * ```typescript
   * const result = await authService.login({
   *   email: 'user@example.com',
   *   password: 'securePassword123'
   * });
   *
   * if (result.success) {
   *   console.log('Access token:', result.accessToken);
   * }
   * ```
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Runtime type guard following our patterns
    if (!isLoginCredentials(credentials)) {
      throw new ValidationError('Invalid credentials format');
    }

    // Implementation...
  }

  /**
   * Runtime type guard for login credentials validation.
   *
   * @param data - Unknown data to validate
   * @returns Type predicate indicating if data is valid LoginCredentials
   *
   * @example
   * ```typescript
   * if (isLoginCredentials(data)) {
   *   // data is now typed as LoginCredentials
   *   const result = await authService.login(data);
   * }
   * ```
   */
  private isLoginCredentials(data: unknown): data is LoginCredentials {
    return isObject(data) &&
           isString(data.email) &&
           isString(data.password) &&
           data.email.length > 0 &&
           data.password.length > 0;
  }
}

/**
 * User login credentials interface.
 *
 * @public
 */
export type LoginCredentials = {
  /** User email address - must be valid email format */
  email: string;
  /** User password - minimum 8 characters required */
  password: string;
  /** Optional remember me flag for extended session */
  rememberMe?: boolean;
};

/**
 * Authentication result returned by login operations.
 *
 * @public
 */
export type AuthResult = {
  /** Whether authentication was successful */
  success: boolean;
  /** JWT access token for API requests (if successful) */
  accessToken?: string;
  /** JWT refresh token for token renewal (if successful) */
  refreshToken?: string;
  /** Authenticated user data (if successful) */
  user?: PublicUserData;
  /** Error message (if failed) */
  error?: string;
};
```

**React Component Documentation:**

```tsx
// apps/client/src/components/DocumentEditor.tsx
/**
 * Collaborative document editor component with real-time synchronization.
 *
 * @remarks
 * This component integrates with ShareDB for operational transformation,
 * providing seamless multi-user editing capabilities.
 *
 * @example
 * ```tsx
 * <DocumentEditor
 *   documentId="doc123"
 *   permissions={{ canEdit: true, canComment: true }}
 *   onSave={(content) => console.log('Saved:', content)}
 * />
 * ```
 */
export const DocumentEditor = memo(({
  documentId,
  permissions,
  onSave,
  className
}: DocumentEditorProps) => {
  // Implementation...
});

/**
 * Props for the DocumentEditor component.
 *
 * @public
 */
export type DocumentEditorProps = {
  /** Unique identifier for the document to edit */
  documentId: string;
  /** User permissions for document interaction */
  permissions: DocumentPermissions;
  /** Callback fired when document is saved */
  onSave?: (content: string) => void;
  /** Optional CSS class name for styling */
  className?: string;
};

/**
 * Document permission configuration.
 *
 * @public
 */
export type DocumentPermissions = {
  /** Whether user can edit document content */
  canEdit: boolean;
  /** Whether user can add comments */
  canComment: boolean;
  /** Whether user can share document with others */
  canShare: boolean;
  /** Whether user can delete the document */
  canDelete: boolean;
};
```

### 3.2 Custom TypeDoc Theme Integration

**Duration**: 2 days

**Custom TypeDoc Plugin:**

```typescript
// scripts/typedoc-nextra-plugin.ts
import { Application, ParameterType, RendererEvent } from 'typedoc';

/**
 * TypeDoc plugin to generate Nextra-compatible markdown.
 */
export function load(app: Application) {
  app.options.addDeclaration({
    name: 'nextaCompatible',
    help: 'Generate Nextra-compatible markdown',
    type: ParameterType.Boolean,
    defaultValue: true
  });

  app.renderer.on(RendererEvent.END, (event) => {
    if (app.options.getValue('nextaCompatible')) {
      enhanceForNextra(event.outputDirectory);
    }
  });
}

function enhanceForNextra(outputDir: string) {
  // Add navigation metadata
  generateNavigationMeta(outputDir);

  // Enhance markdown with Nextra features
  enhanceMarkdownFiles(outputDir);

  // Generate API index page
  generateAPIIndex(outputDir);
}

function generateNavigationMeta(outputDir: string) {
  const metaContent = {
    "index": "API Overview",
    "client": "Client API",
    "server": "Server API",
    "shared": "Shared Types",
    "modules": "Modules",
    "classes": "Classes",
    "interfaces": "Interfaces",
    "types": "Type Aliases",
    "functions": "Functions"
  };

  writeFileSync(
    join(outputDir, '_meta.js'),
    `export default ${JSON.stringify(metaContent, null, 2)}`
  );
}
```

**API Index Generation:**

```typescript
// scripts/generate-api-index.ts
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

/**
 * Generates comprehensive API index for Nextra documentation.
 */
export async function generateAPIIndex() {
  const apiFiles = await glob('docs-site/pages/api/**/*.md');

  const sections = {
    client: { title: 'Client API', files: [] },
    server: { title: 'Server API', files: [] },
    shared: { title: 'Shared Types', files: [] }
  };

  // Categorize API files
  for (const file of apiFiles) {
    const content = readFileSync(file, 'utf-8');
    const category = determineCategory(file, content);
    if (sections[category]) {
      sections[category].files.push({
        path: file,
        title: extractTitle(content),
        description: extractDescription(content)
      });
    }
  }

  // Generate index content
  const indexContent = generateIndexMarkdown(sections);
  writeFileSync('docs-site/pages/api/index.mdx', indexContent);
}

function generateIndexMarkdown(sections: any): string {
  return `---
title: API Reference
description: Complete API documentation for the Collaborative Editor
---

# API Reference

Complete TypeScript API documentation for all packages and modules.

import { Cards, Card } from 'nextra/components'

<Cards>
${Object.entries(sections).map(([key, section]: [string, any]) => `
  <Card
    title="${section.title}"
    href="/api/${key}"
    arrow
  >
    ${section.files.length} modules documented
  </Card>
`).join('')}
</Cards>

## Quick Navigation

${Object.entries(sections).map(([key, section]: [string, any]) => `
### ${section.title}

${section.files.map((file: any) => `
- [${file.title}](/api/${key}/${file.path}) - ${file.description}
`).join('')}
`).join('')}

## Type Safety

All APIs include comprehensive TypeScript definitions and runtime type guards:

\`\`\`typescript
// Example: Type-safe API usage
if (isUserData(response)) {
  // response is now typed as UserData
  console.log(response.email);
}
\`\`\`

For more information on our TypeScript patterns, see the [Development Guide](/development/typescript-best-practices).
`;
}
```

### 3.3 Integration with OpenAPI

**Duration**: 1 day

**OpenAPI to Nextra Integration:**

```typescript
// scripts/openapi-nextra-integration.ts
import { readFileSync } from 'fs';
import SwaggerParser from '@apidevtools/swagger-parser';

/**
 * Integrates existing OpenAPI documentation with Nextra.
 */
export async function integrateOpenAPI() {
  const spec = await SwaggerParser.parse('packages/shared/src/openapi.ts');

  // Generate interactive API documentation
  const apiPages = generateAPIPages(spec);

  // Create Nextra-compatible pages
  for (const [path, content] of Object.entries(apiPages)) {
    writeFileSync(`docs-site/pages/api/rest/${path}.mdx`, content);
  }
}

function generateAPIPages(spec: any): Record<string, string> {
  const pages: Record<string, string> = {};

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods as any)) {
      const pageContent = `---
title: ${operation.summary}
description: ${operation.description}
---

# ${operation.summary}

${operation.description}

## Endpoint

\`\`\`
${method.toUpperCase()} ${path}
\`\`\`

## Parameters

${generateParametersTable(operation.parameters || [])}

## Request Body

${operation.requestBody ? generateRequestBodyDoc(operation.requestBody) : 'No request body required.'}

## Responses

${generateResponsesDoc(operation.responses)}

## Interactive Example

import { APIPreview } from '../../../components/APIPreview'

<APIPreview
  endpoint="${path}"
  method="${method.toUpperCase()}"
  description="${operation.description}"
  exampleRequest={${JSON.stringify(operation.requestBody?.content?.['application/json']?.example)}}
  exampleResponse={${JSON.stringify(operation.responses['200']?.content?.['application/json']?.example)}}
/>
`;

      pages[`${method}-${path.replace(/[\/{}]/g, '-')}`] = pageContent;
    }
  }

  return pages;
}
```

### 3.4 Phase 3 Deliverables

- ✅ Enhanced TypeScript documentation with examples
- ✅ Custom TypeDoc integration with Nextra
- ✅ Automated API reference generation
- ✅ OpenAPI integration for REST endpoints
- ✅ Interactive API documentation components

## Phase 4: Enhanced Features and Integration (Week 4)

### 4.1 Advanced Search Implementation

**Duration**: 2 days

**Custom Search Integration:**

```typescript
// docs-site/components/Search.tsx
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  type: 'guide' | 'api' | 'example';
}

export function EnhancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchDebounced = setTimeout(async () => {
      setLoading(true);
      try {
        // Search across all content types
        const [guideResults, apiResults, exampleResults] = await Promise.all([
          searchGuides(query),
          searchAPI(query),
          searchExamples(query)
        ]);

        setResults([
          ...guideResults.map(r => ({ ...r, type: 'guide' as const })),
          ...apiResults.map(r => ({ ...r, type: 'api' as const })),
          ...exampleResults.map(r => ({ ...r, type: 'example' as const }))
        ]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documentation..."
          className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-auto z-50">
          {results.map((result, index) => (
            <SearchResultItem key={index} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4.2 Development Workflow Integration

**Duration**: 2 days

**Automated Documentation Updates:**

```bash
# Updated Makefile with documentation workflow
docs-watch:         ## Watch for changes and rebuild docs
 @echo "👀 Watching for documentation changes..."
 @trap 'echo "Stopping documentation watch..."' INT; \
 while true; do \
  $(MAKE) docs-generate && \
  echo "✅ Documentation updated at $$(date)"; \
  sleep 30; \
 done

docs-validate:      ## Validate documentation completeness
 @echo "🔍 Validating documentation..."
 @node scripts/validate-docs.js

docs-lint:          ## Lint documentation content
 @echo "📝 Linting documentation..."
 @markdownlint docs-site/pages/**/*.mdx
 @alex docs-site/pages/**/*.mdx

quality: lint type-check test docs-validate  ## Comprehensive quality check
```

**Documentation Validation Script:**

```typescript
// scripts/validate-docs.ts
import { glob } from 'glob';
import { readFileSync } from 'fs';

interface ValidationResult {
  file: string;
  issues: string[];
}

/**
 * Validates documentation completeness and quality.
 */
export async function validateDocumentation(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // Check API coverage
  const apiFiles = await glob('apps/*/src/**/*.ts');
  const docFiles = await glob('docs-site/pages/api/**/*.md');

  for (const apiFile of apiFiles) {
    const content = readFileSync(apiFile, 'utf-8');
    const issues = validateAPIFile(apiFile, content, docFiles);

    if (issues.length > 0) {
      results.push({ file: apiFile, issues });
    }
  }

  // Check guide completeness
  const guideIssues = await validateGuides();
  results.push(...guideIssues);

  return results;
}

function validateAPIFile(file: string, content: string, docFiles: string[]): string[] {
  const issues: string[] = [];

  // Check for exported functions without documentation
  const exportMatches = content.match(/export\s+(function|class|interface|type)\s+(\w+)/g);
  if (exportMatches) {
    for (const match of exportMatches) {
      const name = match.split(/\s+/).pop();
      if (name && !hasDocumentation(name, docFiles)) {
        issues.push(`Missing documentation for exported ${name}`);
      }
    }
  }

  // Check for TSDoc comments
  if (!content.includes('/**')) {
    issues.push('Missing TSDoc comments');
  }

  return issues;
}
```

### 4.3 Performance Optimization

**Duration**: 1 day

**Build Optimization:**

```javascript
// docs-site/next.config.js (enhanced)
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  latex: true,
  search: {
    codeblocks: false,
    indexAllContent: true
  },
  defaultShowCopyCode: true
});

module.exports = withNextra({
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif']
  },
  basePath: process.env.NODE_ENV === 'production' ? '/docs' : '',
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  // Static optimization
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true
  }
});
```

**Content Optimization:**

```typescript
// docs-site/scripts/optimize-content.ts
import { optimize } from 'svgo';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

/**
 * Optimizes documentation assets for performance.
 */
export async function optimizeAssets() {
  // Optimize images
  await imagemin(['docs-site/public/images/*.{jpg,png}'], {
    destination: 'docs-site/public/images/optimized',
    plugins: [
      imageminWebp({ quality: 80 })
    ]
  });

  // Optimize SVGs
  const svgFiles = await glob('docs-site/public/**/*.svg');
  for (const file of svgFiles) {
    const svg = readFileSync(file, 'utf-8');
    const optimized = optimize(svg, {
      plugins: [
        'preset-default',
        'removeDimensions',
        'removeViewBox'
      ]
    });
    writeFileSync(file, optimized.data);
  }

  console.log('✅ Assets optimized');
}
```

### 4.4 Deployment Configuration

**Duration**: 1 day

**Vercel Deployment:**

```json
// docs-site/vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "functions": {
    "docs-site/pages/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**GitHub Actions Deployment:**

```yaml
# .github/workflows/docs.yml
name: Documentation Deployment

on:
  push:
    branches: [main]
    paths:
      - 'docs-site/**'
      - 'apps/*/src/**'
      - 'packages/*/src/**'
  pull_request:
    branches: [main]
    paths:
      - 'docs-site/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Generate API documentation
        run: make docs-generate

      - name: Validate documentation
        run: make docs-validate

      - name: Build documentation
        run: make docs-build

      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: docs-site
```

### 4.5 Phase 4 Deliverables

- ✅ Advanced search functionality
- ✅ Automated documentation workflows
- ✅ Performance optimizations
- ✅ Production deployment configuration
- ✅ CI/CD integration

## Testing and Quality Assurance

### Documentation Testing Strategy

**Content Testing:**

```typescript
// scripts/test-docs.ts
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';

/**
 * Tests documentation for quality and completeness.
 */
export async function testDocumentation() {
  // Test link integrity
  await testLinks();

  // Test code examples
  await testCodeExamples();

  // Test API coverage
  await testAPICoverage();

  // Test performance
  await testPerformance();
}

async function testLinks() {
  const files = await glob('docs-site/pages/**/*.mdx');

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const links = extractLinks(content);

    for (const link of links) {
      if (link.startsWith('http')) {
        // Test external links
        await testExternalLink(link);
      } else {
        // Test internal links
        await testInternalLink(link);
      }
    }
  }
}

async function testCodeExamples() {
  const files = await glob('docs-site/pages/**/*.mdx');

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const codeBlocks = extractCodeBlocks(content);

    for (const block of codeBlocks) {
      if (block.language === 'typescript' || block.language === 'javascript') {
        await validateCodeBlock(block.content);
      }
    }
  }
}
```

**Performance Testing:**

```typescript
// scripts/test-docs-performance.ts
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

/**
 * Tests documentation site performance.
 */
export async function testPerformance() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port
  };

  const runnerResult = await lighthouse('http://localhost:3000/docs', options);

  // Check performance scores
  const scores = runnerResult.lhr.categories;

  const performanceScore = scores.performance.score * 100;
  const accessibilityScore = scores.accessibility.score * 100;

  console.log(`Performance Score: ${performanceScore}`);
  console.log(`Accessibility Score: ${accessibilityScore}`);

  // Assert minimum scores
  if (performanceScore < 90) {
    throw new Error(`Performance score ${performanceScore} below threshold`);
  }

  if (accessibilityScore < 95) {
    throw new Error(`Accessibility score ${accessibilityScore} below threshold`);
  }

  await chrome.kill();
}
```

## Monitoring and Maintenance

### Analytics Integration

```tsx
// docs-site/components/Analytics.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function Analytics() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Track page views
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return null;
}
```

### Automated Maintenance

```typescript
// scripts/maintain-docs.ts
import { Octokit } from '@octokit/rest';

/**
 * Automated documentation maintenance tasks.
 */
export async function maintainDocumentation() {
  // Check for outdated content
  await checkOutdatedContent();

  // Update dependencies
  await updateDependencies();

  // Generate documentation reports
  await generateReports();

  // Create maintenance PRs
  await createMaintenancePRs();
}

async function checkOutdatedContent() {
  const files = await glob('docs-site/pages/**/*.mdx');
  const outdatedFiles = [];

  for (const file of files) {
    const stats = await stat(file);
    const lastModified = stats.mtime;
    const daysOld = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);

    if (daysOld > 90) { // 3 months
      outdatedFiles.push({ file, daysOld: Math.floor(daysOld) });
    }
  }

  if (outdatedFiles.length > 0) {
    console.log('📅 Outdated documentation files:');
    outdatedFiles.forEach(({ file, daysOld }) => {
      console.log(`  ${file} (${daysOld} days old)`);
    });
  }
}
```

## Migration Timeline

### Week 1: Foundation
- [x] Day 1-2: Nextra setup and configuration
- [x] Day 3: TypeDoc installation and basic configuration
- [x] Day 4: Build system integration
- [x] Day 5: Initial testing and validation

### Week 2: Content Migration
- [x] Day 6: Content audit and migration planning
- [x] Day 7-8: Automated content migration
- [x] Day 9-10: Enhanced component development
- [x] Day 11: Testing and refinement

### Week 3: API Documentation
- [x] Day 12-13: TypeScript documentation enhancement
- [x] Day 14-15: Custom TypeDoc theme integration
- [x] Day 16: OpenAPI integration
- [x] Day 17: Testing and validation

### Week 4: Advanced Features
- [x] Day 18-19: Advanced search implementation
- [x] Day 20-21: Development workflow integration
- [x] Day 22: Performance optimization
- [x] Day 23: Deployment configuration
- [x] Day 24: Final testing and launch

## Success Metrics and KPIs

### Documentation Quality
- ✅ **API Coverage**: 100% of exported APIs documented
- ✅ **Link Integrity**: 0 broken internal links
- ✅ **Code Examples**: All code examples tested and valid
- ✅ **Search Coverage**: All content indexed and searchable

### Performance Metrics
- ✅ **Page Load Time**: < 3 seconds on 3G
- ✅ **Lighthouse Score**: > 90 for all categories
- ✅ **Build Time**: < 2 minutes for full documentation
- ✅ **Bundle Size**: < 500KB for main documentation bundle

### Developer Experience
- ✅ **Time to Information**: < 30 seconds to find API documentation
- ✅ **Update Frequency**: API docs updated automatically on code changes
- ✅ **Mobile Experience**: Full functionality on mobile devices
- ✅ **Offline Support**: Core documentation available offline

## Rollback Plan

### Phase Rollback Strategy

If issues occur during any phase:

1. **Immediate Rollback**: Revert to previous documentation system
2. **Issue Analysis**: Identify and document problems
3. **Gradual Migration**: Implement fixes and retry phase
4. **Validation**: Ensure all functionality works before proceeding

### Rollback Procedures

```bash
# Emergency rollback commands
make docs-rollback       # Restore previous documentation
make docs-fallback      # Switch to JSDoc temporarily
make docs-validate      # Verify documentation integrity
```

## Conclusion

This implementation plan provides a comprehensive roadmap for migrating to a modern, TypeScript-first documentation system using Nextra and TypeDoc. The hybrid approach leverages the strengths of both tools while maintaining our existing content and improving the overall developer experience.

### Key Benefits

- **Automated Maintenance**: Reduced manual documentation overhead
- **Type Safety**: Documentation stays in sync with code
- **Modern Experience**: Fast, searchable, interactive documentation
- **Developer Alignment**: Tools match our React/TypeScript stack
- **Scalable Architecture**: Supports future growth and enhancement

### Next Steps

1. **Approve Implementation Plan**: Review and approve this plan
2. **Allocate Resources**: Assign team members to implementation phases
3. **Set Up Infrastructure**: Prepare development and deployment environments
4. **Begin Phase 1**: Start with foundation setup
5. **Monitor Progress**: Regular checkpoints and adjustments as needed

This systematic approach ensures a smooth transition to our new documentation system while maintaining high quality and developer productivity throughout the implementation process.
