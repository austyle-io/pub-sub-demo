#!/usr/bin/env python3
"""Update project progress tracking for austdx migration - Simple version"""

import json
from datetime import datetime
from pathlib import Path

class ProgressTracker:
    def __init__(self, progress_file: Path = Path('.agent/current/progress.json')):
        self.progress_file = progress_file
        self.progress_data = self._load_progress()

    def _load_progress(self):
        """Load existing progress or create new"""
        if self.progress_file.exists():
            with open(self.progress_file, 'r') as f:
                return json.load(f)
        return self._create_initial_progress()

    def _create_initial_progress(self):
        """Create initial progress structure"""
        return {
            'metadata': {
                'project': 'austdx',
                'last_updated': datetime.utcnow().isoformat() + 'Z',
                'format_version': '1.0',
                'migration_start': datetime.utcnow().strftime('%Y-%m-%d'),
                'package_manager': 'pnpm'
            },
            'metrics': {
                'overall_completion': 0,
                'phase': 'migration-planning',
                'health': 'green',
                'blockers': []
            },
            'components': {
                'existing': {
                    'cursor_rules': 100,
                    'documentation': 90,
                    'testing': 95,
                    'logging': 100,
                    'pnpm_scripts': 100
                },
                'to_migrate': {
                    'agent_system': 0,
                    'script_reorganization': 0,
                    'makefile_integration': 0,
                    'quality_gates': 0,
                    'custom_agents': 0
                }
            },
            'tasks': {
                'completed': [],
                'in_progress': [],
                'pending': [
                    'Create agent system directories',
                    'Implement agent tools',
                    'Reorganize scripts',
                    'Create Makefile',
                    'Update documentation'
                ]
            }
        }

    def check_component_status(self):
        """Check actual component completion status"""
        status = {}

        # Check agent system
        agent_dirs = ['.agent/current', '.agent/history', '.agent/tools', '.agent/templates']
        agent_completion = sum(Path(d).exists() for d in agent_dirs) * 25
        status['agent_system'] = agent_completion

        # Check script reorganization
        script_categories = ['development', 'documentation', 'git-version', 'setup',
                           'security', 'utilities', 'config', 'ide-extensions']
        scripts_dir = Path('scripts')
        if scripts_dir.exists():
            reorganized = sum((scripts_dir / cat).exists() for cat in script_categories)
            status['script_reorganization'] = int((reorganized / len(script_categories)) * 100)
        else:
            status['script_reorganization'] = 0

        # Check Makefile
        status['makefile_integration'] = 100 if Path('Makefile').exists() else 0

        # Check quality gates
        quality_files = ['.pre-commit-config.yaml', '.github/workflows/quality.yml']
        quality_completion = sum(Path(f).exists() for f in quality_files) * 50
        status['quality_gates'] = quality_completion

        # Check custom agents
        modes_file = Path('.cursor/modes.json')
        if modes_file.exists():
            with open(modes_file, 'r') as f:
                modes = json.load(f)
                if len(modes.get('modes', [])) >= 4:
                    status['custom_agents'] = 100
                else:
                    status['custom_agents'] = len(modes.get('modes', [])) * 25
        else:
            status['custom_agents'] = 0

        return status

    def update_progress(self):
        """Update progress based on current state"""
        # Update component status
        current_status = self.check_component_status()
        for component, completion in current_status.items():
            self.progress_data['components']['to_migrate'][component] = completion

        # Calculate overall completion
        all_components = {**self.progress_data['components']['existing'],
                         **self.progress_data['components']['to_migrate']}
        total_completion = sum(all_components.values()) / len(all_components)
        self.progress_data['metrics']['overall_completion'] = round(total_completion, 1)

        # Update phase based on completion
        if total_completion < 25:
            self.progress_data['metrics']['phase'] = 'migration-planning'
        elif total_completion < 50:
            self.progress_data['metrics']['phase'] = 'migration-foundation'
        elif total_completion < 75:
            self.progress_data['metrics']['phase'] = 'migration-integration'
        elif total_completion < 95:
            self.progress_data['metrics']['phase'] = 'migration-optimization'
        else:
            self.progress_data['metrics']['phase'] = 'migration-complete'

        # Update timestamp
        self.progress_data['metadata']['last_updated'] = datetime.utcnow().isoformat() + 'Z'

        # Save progress
        self.save_progress()
        self.display_progress()

    def save_progress(self):
        """Save progress to file"""
        self.progress_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress_data, f, indent=2)

    def display_progress(self):
        """Display progress summary"""
        print(f"\n🚀 AuStdX Migration Progress")
        print(f"{'=' * 50}")
        print(f"Overall Completion: {self.progress_data['metrics']['overall_completion']}%")
        print(f"Current Phase: {self.progress_data['metrics']['phase']}")
        print(f"Health Status: {self.progress_data['metrics']['health']}")
        print(f"\nComponent Status:")
        print(f"{'-' * 50}")

        for category, components in self.progress_data['components'].items():
            print(f"\n{category.replace('_', ' ').title()}:")
            for component, completion in components.items():
                status_bar = self._create_progress_bar(completion)
                print(f"  {component.replace('_', ' ').title()}: {status_bar} {completion}%")

    def _create_progress_bar(self, percentage, width=20):
        """Create visual progress bar"""
        filled = int(width * percentage / 100)
        bar = '█' * filled + '░' * (width - filled)
        return f"[{bar}]"

if __name__ == "__main__":
    tracker = ProgressTracker()
    tracker.update_progress()
