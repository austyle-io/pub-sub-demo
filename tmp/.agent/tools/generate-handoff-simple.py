#!/usr/bin/env python3
"""Generate handoff report for austdx migration sessions - Simple version"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

class HandoffGenerator:
    def __init__(self):
        self.agent_dir = Path('.agent')
        self.handoff_dir = self.agent_dir / 'history' / 'handoffs'
        self.current_dir = self.agent_dir / 'current'

    def generate_handoff(self, session_notes: Optional[str] = None) -> Path:
        """Generate comprehensive handoff report"""
        # Load current state
        progress = self._load_current_progress()
        state = self._load_current_state()
        blockers = self._load_blockers()

        # Create handoff document
        timestamp = datetime.utcnow()
        handoff_filename = f"handoff-{timestamp.strftime('%Y%m%d-%H%M%S')}.md"
        handoff_path = self.handoff_dir / handoff_filename

        # Ensure directory exists
        self.handoff_dir.mkdir(parents=True, exist_ok=True)

        # Generate handoff content
        content = self._generate_handoff_content(
            timestamp, progress, state, blockers, session_notes
        )

        # Save handoff
        with open(handoff_path, 'w') as f:
            f.write(content)

        print(f"✅ Handoff generated: {handoff_path}")
        return handoff_path

    def _load_current_progress(self) -> Dict[str, Any]:
        """Load current progress data"""
        progress_file = self.current_dir / 'progress.json'
        if progress_file.exists():
            with open(progress_file, 'r') as f:
                return json.load(f)
        return {}

    def _load_current_state(self) -> str:
        """Load current state notes"""
        state_file = self.current_dir / 'state.md'
        if state_file.exists():
            return state_file.read_text()
        return "No state notes available"

    def _load_blockers(self) -> List[str]:
        """Load current blockers"""
        blockers_file = self.current_dir / 'blockers.md'
        if blockers_file.exists():
            content = blockers_file.read_text()
            # Extract blockers from markdown list
            blockers = []
            for line in content.split('\n'):
                if line.strip().startswith('- '):
                    blockers.append(line.strip()[2:])
            return blockers
        return []

    def _generate_handoff_content(
        self,
        timestamp: datetime,
        progress: Dict[str, Any],
        state: str,
        blockers: List[str],
        session_notes: Optional[str]
    ) -> str:
        """Generate formatted handoff content"""

        content = f"""# Agent Handoff Report

**Project**: austdx
**Generated**: {timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}
**Session ID**: {timestamp.strftime('%Y%m%d-%H%M%S')}

## Progress Summary

**Overall Completion**: {progress.get('metrics', {}).get('overall_completion', 0)}%
**Current Phase**: {progress.get('metrics', {}).get('phase', 'unknown')}
**Health Status**: {progress.get('metrics', {}).get('health', 'unknown')}

### Component Status

#### Existing Components (Pre-Migration)
"""
        # Add existing components
        existing = progress.get('components', {}).get('existing', {})
        for component, completion in existing.items():
            content += f"- **{component.replace('_', ' ').title()}**: {completion}%\n"

        content += "\n#### Migration Components\n"

        # Add migration components
        to_migrate = progress.get('components', {}).get('to_migrate', {})
        for component, completion in to_migrate.items():
            status_emoji = "✅" if completion == 100 else "🔄" if completion > 0 else "⏳"
            content += f"- {status_emoji} **{component.replace('_', ' ').title()}**: {completion}%\n"

        # Add current state
        content += f"\n## Current State\n\n{state}\n"

        # Add blockers
        if blockers:
            content += "\n## Active Blockers\n\n"
            for blocker in blockers:
                content += f"- 🚧 {blocker}\n"
        else:
            content += "\n## Active Blockers\n\nNo blockers reported.\n"

        # Add completed tasks
        completed_tasks = progress.get('tasks', {}).get('completed', [])
        if completed_tasks:
            content += "\n## Completed This Session\n\n"
            for task in completed_tasks[-5:]:  # Last 5 completed tasks
                content += f"- ✅ {task}\n"

        # Add session notes
        if session_notes:
            content += f"\n## Session Notes\n\n{session_notes}\n"

        # Add next steps
        pending_tasks = progress.get('tasks', {}).get('pending', [])
        if pending_tasks:
            content += "\n## Next Steps\n\n"
            for i, task in enumerate(pending_tasks[:5], 1):
                content += f"{i}. {task}\n"

        # Add recommendations
        content += self._generate_recommendations(progress)

        # Add technical context
        content += "\n## Technical Context\n\n"
        content += "- **Package Manager**: pnpm (NOT npm)\n"
        content += "- **Testing**: Vitest + QuickPickle (BDD) + Playwright (E2E)\n"
        content += "- **Logging**: Pino structured logging (no console.log)\n"
        content += "- **Linting**: Biome (JS/TS) + Prettier (CSS)\n"
        content += "- **Rules**: 34 coding standards in .cursor/rules/\n"

        return content

    def _generate_recommendations(self, progress: Dict[str, Any]) -> str:
        """Generate context-aware recommendations"""
        recommendations = "\n## Recommendations\n\n"

        overall_completion = progress.get('metrics', {}).get('overall_completion', 0)

        if overall_completion < 25:
            recommendations += "- Focus on completing the agent system setup first\n"
            recommendations += "- Ensure all team members are aware of the migration\n"
            recommendations += "- Create backup branch before making changes\n"
        elif overall_completion < 50:
            recommendations += "- Begin script reorganization while team adapts to agent system\n"
            recommendations += "- Start documenting migration decisions\n"
            recommendations += "- Schedule team training session\n"
        elif overall_completion < 75:
            recommendations += "- Focus on Makefile integration and testing\n"
            recommendations += "- Gather team feedback on new workflows\n"
            recommendations += "- Update CI/CD pipelines\n"
        else:
            recommendations += "- Complete final testing and validation\n"
            recommendations += "- Document lessons learned\n"
            recommendations += "- Plan celebration for successful migration! 🎉\n"

        return recommendations

if __name__ == "__main__":
    import sys

    generator = HandoffGenerator()

    # Check if session notes provided
    session_notes = None
    if len(sys.argv) > 1:
        session_notes = ' '.join(sys.argv[1:])

    generator.generate_handoff(session_notes)
