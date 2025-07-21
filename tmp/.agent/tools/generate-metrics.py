#!/usr/bin/env python3
"""Generate migration metrics dashboard for austdx"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

class MetricsDashboard:
    def __init__(self):
        self.agent_dir = Path('.agent')
        self.metrics_file = self.agent_dir / 'current' / 'metrics.md'

    def collect_metrics(self) -> Dict[str, Any]:
        """Collect various metrics about the migration"""
        metrics = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'progress': self._load_progress(),
            'adoption': self._calculate_adoption(),
            'file_stats': self._collect_file_stats(),
            'command_usage': self._estimate_command_usage(),
            'health_indicators': self._calculate_health()
        }
        return metrics

    def _load_progress(self) -> Dict[str, Any]:
        """Load progress data"""
        progress_file = self.agent_dir / 'current' / 'progress.json'
        if progress_file.exists():
            with open(progress_file, 'r') as f:
                data = json.load(f)
                return {
                    'overall': data.get('metrics', {}).get('overall_completion', 0),
                    'phase': data.get('metrics', {}).get('phase', 'unknown'),
                    'components': data.get('components', {})
                }
        return {}

    def _calculate_adoption(self) -> Dict[str, int]:
        """Calculate adoption metrics"""
        adoption = {
            'makefile_exists': 100 if Path('Makefile').exists() else 0,
            'agent_tools': len(list(Path('.agent/tools').glob('*.py'))) * 20,
            'documentation': len(list(Path('docs/04_migration').glob('*.md'))) * 25,
            'scripts_organized': len(list(Path('scripts').glob('*/*.sh'))) * 10,
            'custom_agents': 100 if Path('.cursor/modes.json').exists() else 0
        }
        return adoption

    def _collect_file_stats(self) -> Dict[str, int]:
        """Collect file statistics"""
        return {
            'migration_files': len(list(self.agent_dir.rglob('*'))),
            'handoff_reports': len(list((self.agent_dir / 'history' / 'handoffs').glob('*.md'))),
            'feedback_files': len(list((self.agent_dir / 'feedback').glob('*.md'))) if (self.agent_dir / 'feedback').exists() else 0,
            'script_wrappers': len(list(Path('scripts').rglob('*.sh'))),
            'documentation_pages': len(list(Path('docs/04_migration').glob('*.md'))) if Path('docs/04_migration').exists() else 0
        }

    def _estimate_command_usage(self) -> Dict[str, str]:
        """Estimate command usage (would need real telemetry in production)"""
        return {
            'make_commands': 'Available',
            'agent_system': 'Active',
            'pre_commit': 'Configured' if Path('.pre-commit-config.yaml').exists() else 'Not configured',
            'ci_cd': 'Integrated' if Path('.github/workflows/migration-quality.yml').exists() else 'Not integrated'
        }

    def _calculate_health(self) -> Dict[str, Any]:
        """Calculate health indicators"""
        progress = self._load_progress()
        return {
            'overall_health': progress.get('overall', 0) >= 90,
            'blockers_exist': Path('.agent/current/blockers.md').exists(),
            'recent_activity': self._check_recent_activity(),
            'documentation_complete': Path('docs/04_migration').exists() and len(list(Path('docs/04_migration').glob('*.md'))) >= 3
        }

    def _check_recent_activity(self) -> bool:
        """Check if there's been recent activity"""
        progress_file = self.agent_dir / 'current' / 'progress.json'
        if progress_file.exists():
            # Check if file was modified in last 24 hours
            mtime = progress_file.stat().st_mtime
            return (datetime.utcnow().timestamp() - mtime) < 86400
        return False

    def generate_dashboard(self):
        """Generate the metrics dashboard"""
        metrics = self.collect_metrics()

        dashboard = f"""# Migration Metrics Dashboard

**Generated**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

## 📊 Progress Overview

**Overall Completion**: {metrics['progress'].get('overall', 0)}%
**Current Phase**: {metrics['progress'].get('phase', 'Unknown')}

### Component Progress
"""

        # Add component progress
        for category, components in metrics['progress'].get('components', {}).items():
            dashboard += f"\n#### {category.replace('_', ' ').title()}\n"
            for component, value in components.items():
                bar = self._create_progress_bar(value)
                dashboard += f"- {component.replace('_', ' ').title()}: {bar} {value}%\n"

        # Add adoption metrics
        dashboard += "\n## 🎯 Adoption Metrics\n\n"
        total_adoption = sum(metrics['adoption'].values()) / len(metrics['adoption']) if metrics['adoption'] else 0
        dashboard += f"**Overall Adoption**: {total_adoption:.1f}%\n\n"

        for metric, value in metrics['adoption'].items():
            dashboard += f"- {metric.replace('_', ' ').title()}: {value}%\n"

        # Add file statistics
        dashboard += "\n## 📁 File Statistics\n\n"
        for stat, count in metrics['file_stats'].items():
            dashboard += f"- {stat.replace('_', ' ').title()}: {count}\n"

        # Add command usage
        dashboard += "\n## 💻 Feature Status\n\n"
        for feature, status in metrics['command_usage'].items():
            dashboard += f"- {feature.replace('_', ' ').title()}: {status}\n"

        # Add health indicators
        dashboard += "\n## 🏥 Health Indicators\n\n"
        for indicator, value in metrics['health_indicators'].items():
            status = "✅" if value else "⚠️"
            dashboard += f"- {indicator.replace('_', ' ').title()}: {status}\n"

        # Add recommendations
        dashboard += self._generate_recommendations(metrics)

        # Save dashboard
        self.metrics_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.metrics_file, 'w') as f:
            f.write(dashboard)

        print(f"📊 Metrics dashboard generated: {self.metrics_file}")
        return self.metrics_file

    def _create_progress_bar(self, percentage: int, width: int = 20) -> str:
        """Create visual progress bar"""
        filled = int(width * percentage / 100)
        bar = '█' * filled + '░' * (width - filled)
        return f"[{bar}]"

    def _generate_recommendations(self, metrics: Dict[str, Any]) -> str:
        """Generate recommendations based on metrics"""
        recommendations = "\n## 💡 Recommendations\n\n"

        overall = metrics['progress'].get('overall', 0)

        if overall < 95:
            recommendations += "- Complete remaining migration components\n"

        if metrics['file_stats']['feedback_files'] == 0:
            recommendations += "- Encourage team to submit feedback\n"

        if not metrics['health_indicators']['recent_activity']:
            recommendations += "- Check on migration progress - no recent updates\n"

        if metrics['file_stats']['handoff_reports'] < 3:
            recommendations += "- Generate more handoff reports for better continuity\n"

        if overall >= 95:
            recommendations += "- 🎉 Migration nearly complete! Plan celebration\n"
            recommendations += "- Conduct final validation\n"
            recommendations += "- Archive migration artifacts\n"

        return recommendations

if __name__ == "__main__":
    dashboard = MetricsDashboard()
    dashboard.generate_dashboard()
