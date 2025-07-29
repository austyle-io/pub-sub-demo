# Cursor Prompts for ShareDB Collaborative Editor

This directory contains specialized prompts for developing and maintaining the ShareDB collaborative editing system. These prompts are adapted from enterprise patterns and incorporate lessons learned from this project.

## Directory Structure

- **`analysis/`** - Analytical prompts for evaluating code and architecture
- **`architecture/`** - System design and architectural decision prompts
- **`chains/`** - Multi-step workflow chains for complex features
- **`development/`** - Component and feature development prompts
- **`documentation/`** - Documentation generation prompts
- **`onboarding/`** - AI assistant onboarding and context setting
- **`personas/`** - Specialized AI personas for different roles
- **`refactoring/`** - Code refactoring and optimization prompts
- **`testing/`** - Test creation and testing strategy prompts

## Quick Start

### Most Common Workflows

1. **Creating a New Real-time Component**
   ```bash
   cursor @development/_realtime-component
   ```

2. **Architecture Review**
   ```bash
   cursor @architect-sharedb
   ```

3. **Code Review**
   ```bash
   cursor @mentor-sharedb
   ```

4. **Complete Feature Development**
   ```bash
   ./chains/run.sh websocket-feature "user presence indicator"
   ```

## Key Concepts

### ShareDB Patterns
- Document operations (OT - Operational Transformation)
- WebSocket authentication and lifecycle
- Conflict resolution strategies
- Permission models

### Project-Specific Context
- JWT-based WebSocket authentication
- Document structure: `create.data` vs `data` field
- User acceptance testing focus
- No unit test coverage requirements

### Coding Standards
- TypeScript with strict type safety
- Zod validation for external data
- No React.FC, always explicit types
- Lookup objects over switch statements
- Branded types for domain identifiers

## Prompt Naming Convention

- `_filename.mdp` - Markdown prompts for interactive use
- `@persona-name` - AI persona prompts
- `.yaml` - Chain configuration files
- `.sh` - Executable scripts

## Tips for Effective Use

1. **Provide Context**: Always include relevant file paths and specific requirements
2. **Use Personas**: Different personas excel at different tasks
3. **Chain Complex Tasks**: Use chains for multi-step features
4. **Review Output**: AI suggestions should align with project patterns

## Extending Prompts

To add new prompts:
1. Follow the existing naming convention
2. Include project-specific patterns from CLAUDE.md
3. Reference the cursor rules for code standards
4. Test with real scenarios before committing

## Related Resources

- `/CLAUDE.md` - Project memory and lessons learned
- `/.cursor/rules/` - Coding standards and patterns
- `/docs/` - Project documentation
- `/plans/` - Development plans and architecture decisions
