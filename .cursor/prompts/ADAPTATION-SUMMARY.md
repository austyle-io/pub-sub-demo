# Cursor Prompts Adaptation Summary

## Overview

Successfully adapted cursor prompts from the austdx project to the pub-sub-demo ShareDB project. The prompts have been customized to focus on real-time collaboration, ShareDB patterns, and the specific lessons learned from this project.

## What Was Adapted

### 1. **Personas** (`personas/`)
- **`_architect-sharedb.mdp`**: System architect specializing in ShareDB and real-time systems
- **`_mentor-sharedb.mdp`**: Patient mentor for teaching ShareDB concepts and reviewing code

### 2. **Development** (`development/`)
- **`_realtime-component.mdp`**: Template for creating ShareDB-integrated React components with proper hooks, error handling, and cleanup

### 3. **Testing** (`testing/`)
- **`_integration-test-create.mdp`**: Comprehensive integration test templates for WebSocket connections, concurrent editing, permissions, and performance

### 4. **Architecture** (`architecture/`)
- **`_enterprise-context.mdp`**: Enterprise-scale ShareDB architecture patterns, scaling strategies, and decision frameworks

### 5. **Analysis** (`analysis/`)
- **`skeptical-analyst.mdp`**: Evidence-driven analysis for distributed systems with ShareDB-specific scrutiny

### 6. **Documentation** (`documentation/`)
- **`_docs.mdp`**: Documentation generation for ShareDB features
- **`_index.mdp`**: Documentation index structure and standards

### 7. **Refactoring** (`refactoring/`)
- **`_refactor.mdp`**: Systematic refactoring patterns for ShareDB implementations

### 8. **Onboarding** (`onboarding/`)
- **`_ai-onboarding.mdp`**: Quick onboarding guide for AI assistants working with the project

### 9. **Chains** (`chains/`)
- **`_websocket-feature.yaml`**: Multi-step workflow for implementing complete real-time features
- **`run.sh`**: Executable script to run prompt chains

## Key Adaptations Made

### 1. **ShareDB-Specific Focus**
All prompts now focus on:
- Operational Transformation (OT) concepts
- WebSocket lifecycle management
- Document subscription patterns
- Real-time conflict resolution

### 2. **Project Lessons Integrated**
Incorporated specific lessons from CLAUDE.md:
- Document structure quirks (`create.data` vs `data`)
- WebSocket authentication via query parameters
- Backend connection user context requirements
- Permission checking at operation level

### 3. **Coding Standards Alignment**
All prompts enforce:
- No React.FC usage
- Type declarations over interfaces
- Zod validation for external data
- Lookup objects over switch statements
- User acceptance testing focus

### 4. **Real-time Patterns**
Added specific patterns for:
- Operation batching
- Optimistic UI updates
- Connection status indicators
- Memory leak prevention
- Multi-user testing scenarios

## How to Use

### Quick Access Commands
```bash
# For architecture questions
cursor @architect-sharedb

# For code reviews
cursor @mentor-sharedb

# For creating new components
cursor @development/_realtime-component

# For running feature workflows
./chains/run.sh websocket-feature "feature-name"
```

### Common Workflows

1. **New Real-time Feature**
   - Start with `@architect-sharedb` for design
   - Use `development/_realtime-component.mdp` for implementation
   - Create tests with `testing/_integration-test-create.mdp`
   - Review with `@mentor-sharedb`

2. **Debugging ShareDB Issues**
   - Use `analysis/skeptical-analyst.mdp` for root cause analysis
   - Check `onboarding/_ai-onboarding.mdp` for common pitfalls

3. **Documentation**
   - Generate with `documentation/_docs.mdp`
   - Organize with `documentation/_index.mdp`

## Benefits

1. **Consistency**: All AI assistants follow the same patterns
2. **Efficiency**: Templates reduce boilerplate and errors
3. **Knowledge Transfer**: Lessons learned are embedded in prompts
4. **Quality**: Built-in best practices and error prevention
5. **Scalability**: Easy to extend with new prompts

## Next Steps

1. **Test the prompts** with real feature development
2. **Refine based on usage** and feedback
3. **Add more chains** for common workflows
4. **Create prompt library** for specific ShareDB patterns
5. **Document prompt creation** guidelines

The prompt system is now ready to accelerate ShareDB feature development while maintaining high quality and consistency.
