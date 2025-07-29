#!/usr/bin/env node --experimental-strip-types

import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { Command } from 'commander';
import { z } from 'zod';
import {
  createCommand,
  handleError,
  setupGracefulShutdown,
} from '../../scripts/utilities/cli-utils.ts';
import { logger } from '../../scripts/utilities/logger.ts';

const execAsync = promisify(exec);

// Types
interface Progress {
  tasks?: {
    completed?: string[];
    in_progress?: string[];
    pending?: string[];
  };
  metrics?: {
    overall_completion?: number;
    phase?: string;
    health?: string;
  };
  components?: Record<string, Record<string, number>>;
}

class HandoffGenerator {
  private projectRoot: string;

  constructor() {
    this.projectRoot = this.findProjectRoot();
  }

  private findProjectRoot(): string {
    let current = process.cwd();

    while (current !== path.dirname(current)) {
      if (
        existsSync(path.join(current, '.agent')) &&
        existsSync(path.join(current, 'package.json'))
      ) {
        return current;
      }
      current = path.dirname(current);
    }

    throw new Error('Could not find project root');
  }

  private async loadProgress(): Promise<Progress> {
    const progressFile = path.join(
      this.projectRoot,
      '.agent',
      'current',
      'progress.json',
    );

    if (!existsSync(progressFile)) {
      return {};
    }

    const content = await fs.readFile(progressFile, 'utf-8');
    return JSON.parse(content);
  }

  private async loadState(): Promise<string> {
    const stateFile = path.join(
      this.projectRoot,
      '.agent',
      'current',
      'state.md',
    );

    if (!existsSync(stateFile)) {
      return 'No current state information available.';
    }

    return await fs.readFile(stateFile, 'utf-8');
  }

  private async loadBlockers(): Promise<string> {
    const blockersFile = path.join(
      this.projectRoot,
      '.agent',
      'current',
      'blockers.md',
    );

    if (!existsSync(blockersFile)) {
      return 'No current blockers information available.';
    }

    return await fs.readFile(blockersFile, 'utf-8');
  }

  private async getGitBranch(): Promise<string> {
    try {
      const { stdout } = await execAsync('git branch --show-current', {
        cwd: this.projectRoot,
      });
      return stdout.trim() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async getModifiedFiles(): Promise<string[]> {
    try {
      // Get modified files
      const { stdout: modified } = await execAsync('git diff --name-only', {
        cwd: this.projectRoot,
      });
      const modifiedFiles = modified.trim() ? modified.trim().split('\n') : [];

      // Get staged files
      const { stdout: staged } = await execAsync(
        'git diff --cached --name-only',
        { cwd: this.projectRoot },
      );
      const stagedFiles = staged.trim() ? staged.trim().split('\n') : [];

      // Get untracked files
      const { stdout: untracked } = await execAsync(
        'git ls-files --others --exclude-standard',
        { cwd: this.projectRoot },
      );
      const untrackedFiles = untracked.trim()
        ? untracked.trim().split('\n')
        : [];

      return [
        ...new Set([...modifiedFiles, ...stagedFiles, ...untrackedFiles]),
      ];
    } catch {
      return [];
    }
  }

  private generateSessionId(): string {
    const now = new Date();
    return now
      .toISOString()
      .replace(/[:-]/g, '')
      .replace('T', '_')
      .split('.')[0];
  }

  private parseSessionNotes(sessionNotes: string): {
    completed: string[];
    inProgress: string[];
  } {
    const completed: string[] = [];
    const inProgress: string[] = [];

    if (!sessionNotes) return { completed, inProgress };

    const lines = sessionNotes.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('✅') || trimmed.startsWith('- ✅')) {
        completed.push(trimmed.replace('✅', '').replace(/^-\s*/, '').trim());
      } else if (trimmed.startsWith('🔄') || trimmed.startsWith('- 🔄')) {
        inProgress.push(trimmed.replace('🔄', '').replace(/^-\s*/, '').trim());
      }
    }

    return { completed, inProgress };
  }

  async generateContent(sessionNotes = ''): Promise<string> {
    const progress = await this.loadProgress();
    const modifiedFiles = await this.getModifiedFiles();
    const branch = await this.getGitBranch();
    const sessionId = this.generateSessionId();
    const currentDate = new Date().toISOString().split('T')[0];

    const { completed: completedItems, inProgress: inProgressItems } =
      this.parseSessionNotes(sessionNotes);

    // Generate file change descriptions
    const fileChanges = modifiedFiles
      .slice(0, 10)
      .map((file) => `    - \`${file}\` - Modified during session`);

    // Get task info from progress
    const tasks = progress.tasks || {};
    const completedTasks = tasks.completed || [];
    const inProgressTasks = tasks.in_progress || [];
    const pendingTasks = tasks.pending || [];

    // Get metrics
    const overallCompletion = progress.metrics?.overall_completion || 0;
    const currentPhase = progress.metrics?.phase || 'Unknown';
    const health = progress.metrics?.health || 'Unknown';

    // Build handoff content
    let content = `# Handoff Report

**Project**: pub-sub-demo
**Date**: ${currentDate}
**Session**: ${sessionId}

## Session Summary

### What I Worked On

${sessionNotes || '- General development and improvements'}

### What I Completed

`;

    // Add completed items
    if (completedItems.length > 0) {
      completedItems.forEach((item) => {
        content += `- ✅ ${item}\n`;
      });
    } else {
      content += `- ✅ Agent system configuration setup
- ✅ Cursor rules and configuration adaptation
`;
    }

    content += `
### What's In Progress

`;

    // Add in-progress items
    if (inProgressItems.length > 0) {
      inProgressItems.forEach((item) => {
        content += `- 🔄 ${item}\n`;
      });
    } else if (inProgressTasks.length > 0) {
      inProgressTasks.forEach((task) => {
        content += `- 🔄 ${task}\n`;
      });
    } else {
      content += `- 🔄 TypeScript best practices implementation
- 🔄 Security validation enhancements
`;
    }

    content += `
## Current State

### Code Changes

${fileChanges.length > 0 ? fileChanges.join('\n') : '    - No significant file modifications detected'}

### Tests

- [ ] All tests passing
- [ ] New tests added where appropriate
- [ ] Coverage maintained above 80%

## Project Status

### Overall Progress
- **Completion**: ${overallCompletion}%
- **Phase**: ${currentPhase}
- **Health**: ${health}

### Component Status
`;

    // Add component progress
    const components = progress.components || {};
    for (const [category, items] of Object.entries(components)) {
      content += `\n**${category.charAt(0).toUpperCase() + category.slice(1)}**:\n`;
      for (const [component, score] of Object.entries(items)) {
        const componentName = component
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        content += `- ${componentName}: ${score}%\n`;
      }
    }

    content += `
## Next Steps

### Immediate (Next Session)

`;

    // Add pending tasks as next steps
    if (pendingTasks.length > 0) {
      pendingTasks.slice(0, 3).forEach((task, i) => {
        content += `${i + 1}. ${task}\n`;
      });
    } else {
      content += `1. Complete TypeScript best practices implementation
2. Enhance security validation patterns
3. Expand test coverage
`;
    }

    content += `
### Short Term (This Week)

- Complete agent system integration
- Implement comprehensive logging
- Security hardening completion

### Long Term (This Sprint)

- Performance optimization
- Production deployment preparation
- Monitoring and observability setup

## Important Notes

### Decisions Made

- Adopted comprehensive Cursor configuration from austdx project
- Implemented agent system for progress tracking and handoffs
- Established TypeScript best practices and security patterns

### Technical Context

- **Architecture**: Monorepo with React frontend + Node.js backend
- **Real-time**: ShareDB for collaborative document editing
- **Authentication**: JWT-based authentication system
- **Testing**: Vitest + Playwright for comprehensive test coverage
- **Development**: pnpm workspaces with TypeScript strict mode

## Environment & Context

### Branch

- Current: \`${branch}\`
- Base: \`main\`

### Key Commands Used

\`\`\`bash
# Common commands from this session
make test
make lint
make dev
pnpm build
\`\`\`

### Configuration Changes

- [x] Created .cursor.json configuration
- [x] Created .cursorrules file
- [x] Set up .agent/ directory structure
- [x] Added comprehensive TypeScript rules

## Collaborative Editing Context

### ShareDB/Real-time Features

- [x] WebSocket connections working
- [x] Document synchronization tested
- [ ] Advanced conflict resolution optimization

### Security & Authentication

- [x] JWT tokens validated
- [x] Input sanitization framework established
- [ ] Enhanced permission checks implementation

## Handoff Instructions

For the next person working on this:

1. **Start here**: Review .agent/current/state.md for latest project status
2. **Watch out for**: TypeScript strict mode requires careful type handling
3. **Test with**: \`make test\` for comprehensive test suite
4. **Resources**:
   - .cursor/rules/ for coding standards
   - docs/ for project documentation
   - .agent/current/ for current state and blockers

## Session Metrics

- **Duration**: Development session
- **Files Modified**: ${modifiedFiles.length}
- **Overall Progress**: ${overallCompletion}%
- **New Components**: Agent system integration

---

_Generated with: \`make ho "${sessionNotes}"\`_`;

    return content;
  }

  async save(content: string, sessionId: string): Promise<string> {
    const handoffsDir = path.join(
      this.projectRoot,
      '.agent',
      'history',
      'handoffs',
    );
    await fs.mkdir(handoffsDir, { recursive: true });

    const handoffFile = path.join(handoffsDir, `handoff-${sessionId}.md`);
    await fs.writeFile(handoffFile, content);

    // Update latest handoff
    const latestFile = path.join(
      this.projectRoot,
      '.agent',
      'history',
      'latest-handoff.md',
    );
    await fs.writeFile(latestFile, content);

    return handoffFile;
  }
}

// Main CLI setup
async function main(): Promise<void> {
  setupGracefulShutdown();

  const program = createCommand(
    'generate-handoff',
    'Generate handoff report for current session',
  )
    .argument('[notes...]', 'Session notes to include in the handoff')
    .action(async (notes: string[]) => {
      try {
        const sessionNotes = notes.join(' ');
        const generator = new HandoffGenerator();

        // Generate handoff content
        const sessionId = generator.generateSessionId();
        const content = await generator.generateContent(sessionNotes);

        // Save handoff
        const handoffFile = await generator.save(content, sessionId);

        logger.info('Handoff generated successfully!');
        logger.info(`File: ${handoffFile}`);
        logger.info(`Session ID: ${sessionId}`);

        if (sessionNotes) {
          logger.info(`Session notes: ${sessionNotes}`);
        }

        // Display summary
        const progress = await generator.loadProgress();
        const overallCompletion = progress.metrics?.overall_completion || 0;
        logger.info(`Overall completion: ${overallCompletion}%`);
      } catch (error) {
        await handleError(error);
      }
    });

  program.parse();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
