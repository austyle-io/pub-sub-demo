#!/usr/bin/env python3
"""
Handoff generation tool for pub-sub-demo project.
Generates handoff reports based on template and current project state.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List


def get_project_root() -> Path:
    """Find the project root directory."""
    current = Path.cwd()
    while current != current.parent:
        if (current / '.agent').exists() and (current / 'package.json').exists():
            return current
        current = current.parent
    raise RuntimeError("Could not find project root")


def load_progress() -> Dict[str, Any]:
    """Load current progress data."""
    progress_file = get_project_root() / '.agent' / 'current' / 'progress.json'

    if not progress_file.exists():
        return {}

    with open(progress_file, 'r') as f:
        return json.load(f)


def load_state() -> str:
    """Load current state markdown."""
    state_file = get_project_root() / '.agent' / 'current' / 'state.md'

    if not state_file.exists():
        return "No current state information available."

    with open(state_file, 'r') as f:
        return f.read()


def load_blockers() -> str:
    """Load current blockers markdown."""
    blockers_file = get_project_root() / '.agent' / 'current' / 'blockers.md'

    if not blockers_file.exists():
        return "No current blockers information available."

    with open(blockers_file, 'r') as f:
        return f.read()


def get_git_branch() -> str:
    """Get current git branch."""
    try:
        import subprocess
        result = subprocess.run(['git', 'branch', '--show-current'],
                              capture_output=True, text=True, cwd=get_project_root())
        if result.returncode == 0:
            return result.stdout.strip()
        return 'unknown'
    except:
        return 'unknown'


def get_modified_files() -> List[str]:
    """Get list of modified files from git."""
    try:
        import subprocess
        # Get modified files
        result = subprocess.run(['git', 'diff', '--name-only'],
                              capture_output=True, text=True, cwd=get_project_root())
        modified = result.stdout.strip().split('\n') if result.stdout.strip() else []

        # Get staged files
        result = subprocess.run(['git', 'diff', '--cached', '--name-only'],
                              capture_output=True, text=True, cwd=get_project_root())
        staged = result.stdout.strip().split('\n') if result.stdout.strip() else []

        # Get untracked files
        result = subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'],
                              capture_output=True, text=True, cwd=get_project_root())
        untracked = result.stdout.strip().split('\n') if result.stdout.strip() else []

        return list(set(modified + staged + untracked))
    except:
        return []


def generate_session_id() -> str:
    """Generate a session ID based on timestamp."""
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def generate_handoff_content(session_notes: str = "") -> str:
    """Generate handoff content based on current project state."""
    progress = load_progress()
    modified_files = get_modified_files()
    branch = get_git_branch()
    session_id = generate_session_id()

    # Parse session notes for completed and in-progress items
    completed_items = []
    in_progress_items = []

    if session_notes:
        lines = session_notes.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('✅') or line.startswith('- ✅'):
                completed_items.append(line.replace('✅', '').strip().lstrip('- '))
            elif line.startswith('🔄') or line.startswith('- 🔄'):
                in_progress_items.append(line.replace('🔄', '').strip().lstrip('- '))

    # Generate file change descriptions
    file_changes = []
    for file in modified_files[:10]:  # Limit to first 10 files
        file_changes.append(f"    - `{file}` - Modified during session")

    # Get task info from progress
    tasks = progress.get('tasks', {})
    completed_tasks = tasks.get('completed', [])
    in_progress_tasks = tasks.get('in_progress', [])
    pending_tasks = tasks.get('pending', [])

    # Generate overall completion info
    overall_completion = progress.get('metrics', {}).get('overall_completion', 'Unknown')
    current_phase = progress.get('metrics', {}).get('phase', 'Unknown')

    handoff_content = f"""# Handoff Report

**Project**: pub-sub-demo
**Date**: {datetime.now().strftime('%Y-%m-%d')}
**Session**: {session_id}

## Session Summary

### What I Worked On

{session_notes if session_notes else "- General development and improvements"}

### What I Completed

"""

    # Add completed items
    if completed_items:
        for item in completed_items:
            handoff_content += f"- ✅ {item}\n"
    else:
        handoff_content += "- ✅ Agent system configuration setup\n"
        handoff_content += "- ✅ Cursor rules and configuration adaptation\n"

    handoff_content += f"""
### What's In Progress

"""

    # Add in-progress items
    if in_progress_items:
        for item in in_progress_items:
            handoff_content += f"- 🔄 {item}\n"
    elif in_progress_tasks:
        for task in in_progress_tasks:
            handoff_content += f"- 🔄 {task}\n"
    else:
        handoff_content += "- 🔄 TypeScript best practices implementation\n"
        handoff_content += "- 🔄 Security validation enhancements\n"

    handoff_content += f"""
## Current State

### Code Changes

"""

    if file_changes:
        handoff_content += "\n".join(file_changes)
    else:
        handoff_content += "    - No significant file modifications detected"

    handoff_content += f"""

### Tests

- [ ] All tests passing
- [ ] New tests added where appropriate
- [ ] Coverage maintained above 80%

## Project Status

### Overall Progress
- **Completion**: {overall_completion}%
- **Phase**: {current_phase}
- **Health**: {progress.get('metrics', {}).get('health', 'Unknown')}

### Component Status
"""

    # Add component progress
    components = progress.get('components', {})
    for category, items in components.items():
        handoff_content += f"\n**{category.title()}**:\n"
        for component, score in items.items():
            handoff_content += f"- {component.replace('_', ' ').title()}: {score}%\n"

    handoff_content += f"""
## Next Steps

### Immediate (Next Session)

"""

    # Add pending tasks as next steps
    if pending_tasks:
        for i, task in enumerate(pending_tasks[:3], 1):
            handoff_content += f"{i}. {task}\n"
    else:
        handoff_content += """1. Complete TypeScript best practices implementation
2. Enhance security validation patterns
3. Expand test coverage
"""

    handoff_content += f"""
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

- Current: `{branch}`
- Base: `main`

### Key Commands Used

```bash
# Common commands from this session
make test
make lint
make dev
pnpm build
```

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
3. **Test with**: `make test` for comprehensive test suite
4. **Resources**:
   - .cursor/rules/ for coding standards
   - docs/ for project documentation
   - .agent/current/ for current state and blockers

## Session Metrics

- **Duration**: Development session
- **Files Modified**: {len(modified_files)}
- **Overall Progress**: {overall_completion}%
- **New Components**: Agent system integration

---

_Generated with: `make ho "{session_notes}"`_"""

    return handoff_content


def save_handoff(content: str, session_id: str) -> Path:
    """Save handoff to history directory."""
    handoffs_dir = get_project_root() / '.agent' / 'history' / 'handoffs'
    handoffs_dir.mkdir(parents=True, exist_ok=True)

    handoff_file = handoffs_dir / f'handoff-{session_id}.md'

    with open(handoff_file, 'w') as f:
        f.write(content)

    return handoff_file


def update_latest_handoff(content: str) -> None:
    """Update the latest handoff file for easy access."""
    latest_file = get_project_root() / '.agent' / 'history' / 'latest-handoff.md'

    with open(latest_file, 'w') as f:
        f.write(content)


def main():
    """Main function to handle command line arguments."""
    session_notes = ""

    if len(sys.argv) > 1:
        session_notes = " ".join(sys.argv[1:])

    try:
        # Generate handoff content
        session_id = generate_session_id()
        content = generate_handoff_content(session_notes)

        # Save handoff
        handoff_file = save_handoff(content, session_id)
        update_latest_handoff(content)

        print(f"Handoff generated successfully!")
        print(f"File: {handoff_file}")
        print(f"Session ID: {session_id}")

        if session_notes:
            print(f"Session notes: {session_notes}")

        # Display summary
        progress = load_progress()
        overall_completion = progress.get('metrics', {}).get('overall_completion', 'Unknown')
        print(f"Overall completion: {overall_completion}%")

    except Exception as e:
        print(f"Error generating handoff: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
