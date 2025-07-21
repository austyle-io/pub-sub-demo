#!/usr/bin/env python3
# mypy: strict
"""Validate project state for austdx migration"""

import json
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple, Any

class StateValidator:
    def __init__(self):
        self.project_root = Path.cwd()
        self.validation_results: Dict[str, Dict[str, Any]] = {}
        self.has_errors = False

    def validate_all(self) -> bool:
        """Run all validation checks"""
        print("🔍 Validating austdx project state...\n")

        self.validate_package_manager()
        self.validate_cursor_rules()
        self.validate_dependencies()
        self.validate_scripts()
        self.validate_agent_system()
        self.validate_documentation()
        self.validate_testing()

        self.display_results()
        return not self.has_errors

    def validate_package_manager(self):
        """Ensure pnpm is used, not npm"""
        results = {
            'status': 'pass',
            'issues': [],
            'checks': []
        }

        # Check for pnpm-lock.yaml
        if (self.project_root / 'pnpm-lock.yaml').exists():
            results['checks'].append('✓ pnpm-lock.yaml exists')
        else:
            results['status'] = 'fail'
            results['issues'].append('Missing pnpm-lock.yaml')
            self.has_errors = True

        # Check for npm artifacts
        npm_artifacts = ['package-lock.json', 'npm-shrinkwrap.json']
        for artifact in npm_artifacts:
            if (self.project_root / artifact).exists():
                results['status'] = 'fail'
                results['issues'].append(f'Found npm artifact: {artifact}')
                self.has_errors = True
            else:
                results['checks'].append(f'✓ No {artifact} found')

        # Check package.json for pnpm
        package_json_path = self.project_root / 'package.json'
        if package_json_path.exists():
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
                if 'packageManager' in package_data:
                    if 'pnpm' in package_data['packageManager']:
                        results['checks'].append('✓ packageManager specifies pnpm')
                    else:
                        results['status'] = 'warn'
                        results['issues'].append('packageManager does not specify pnpm')

        self.validation_results['package_manager'] = results

    def validate_cursor_rules(self):
        """Validate .cursor/rules/ directory"""
        results = {
            'status': 'pass',
            'issues': [],
            'checks': []
        }

        cursor_rules_dir = self.project_root / '.cursor' / 'rules'
        if cursor_rules_dir.exists():
            rule_files = list(cursor_rules_dir.glob('**/*.mdc'))
            if len(rule_files) >= 34:
                results['checks'].append(f'✓ Found {len(rule_files)} rule files (expected 34+)')
            else:
                results['status'] = 'warn'
                results['issues'].append(f'Found only {len(rule_files)} rule files (expected 34)')
        else:
            results['status'] = 'fail'
            results['issues'].append('.cursor/rules/ directory not found')
            self.has_errors = True

        self.validation_results['cursor_rules'] = results

    def validate_dependencies(self):
        """Check for required dependencies"""
        results = {
            'status': 'pass',
            'issues': [],
            'checks': []
        }

        package_json_path = self.project_root / 'package.json'
        if package_json_path.exists():
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
                deps = {**package_data.get('dependencies', {}),
                       **package_data.get('devDependencies', {})}

                required_deps = [
                    ('vitest', 'Testing framework'),
                    ('pino', 'Logging framework'),
                    ('@tanstack/react-start', 'SSR framework'),
                    ('drizzle-orm', 'ORM'),
                    ('tailwindcss', 'CSS framework')
                ]

                for dep, desc in required_deps:
                    if dep in deps:
                        results['checks'].append(f'✓ {desc} ({dep}) found')
                    else:
                        results['status'] = 'warn'
                        results['issues'].append(f'Missing {desc} ({dep})')

        self.validation_results['dependencies'] = results

    def validate_scripts(self):
        """Validate pnpm scripts exist"""
        results = {
            'status': 'pass',
            'issues': [],
            'checks': []
        }

        package_json_path = self.project_root / 'package.json'
        if package_json_path.exists():
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
                scripts = package_data.get('scripts', {})

                required_scripts = [
                    'dev', 'build', 'preview', 'test', 'lint',
                    'type-check', 'format', 'test:safe', 'lint:safe'
                ]

                for script in required_scripts:
                    if script in scripts:
                        results['checks'].append(f'✓ Script "{script}" exists')
                    else:
                        results['status'] = 'warn'
                        results['issues'].append(f'Missing script: {script}')

        self.validation_results['scripts'] = results

    def validate_agent_system(self):
        """Validate agent system setup"""
        results = {
            'status': 'pass',
            'issues': [],
            'checks': []
        }

        agent_dirs = [
            '.agent/current',
            '.agent/history',
            '.agent/tools',
            '.agent/templates'
        ]

        for dir_path in agent_dirs:
            if (self.project_root / dir_path).exists():
                results['checks'].append(f'✓ {dir_path} exists')
            else:
                results['status'] = 'fail'
                results['issues'].append(f'Missing {dir_path}')

        # Check for agent tools
        tools = ['update-progress.py', 'generate-handoff.py', 'validate-state.py']
        tools_dir = self.project_root / '.agent' / 'tools'

        for tool in tools:
            tool_path = tools_dir / tool
            if tool_path.exists():
                results['checks'].append(f'✓ Tool {tool} exists')
                # Check if executable
                if tool_path.stat().st_mode & 0o111:
                    results['checks'].append(f'✓ Tool {tool} is executable')
                else:
                    results['status'] = 'warn'
                    results['issues'].append(f'Tool {tool} is not executable')
            else:
                results['status'] = 'warn'
                results['issues'].append(f'Missing tool: {tool}')

        self.validation_results['agent_system'] = results

    def validate_documentation(self):
        """Check documentation structure"""
        results = {
            'status': 'pass',
            'issues': [],
            'checks': []
        }

        docs_dir = self.project_root / 'docs'
        if docs_dir.exists():
            results['checks'].append('✓ docs/ directory exists')

            # Check for key documentation sections
            key_sections = [
                '00_INDEX.md',
                '01_getting-started',
                '02_architecture',
                '03_development'
            ]

            for section in key_sections:
                if (docs_dir / section).exists():
                    results['checks'].append(f'✓ {section} exists')
                else:
                    results['status'] = 'warn'
                    results['issues'].append(f'Missing documentation: {section}')
        else:
            results['status'] = 'fail'
            results['issues'].append('docs/ directory not found')

        self.validation_results['documentation'] = results

    def validate_testing(self):
        """Validate testing setup"""
        results = {
            'status': 'pass',
            'issues': [],
            'checks': []
        }

        # Check test directories
        test_dirs = ['test', 'e2e']
        for test_dir in test_dirs:
            if (self.project_root / test_dir).exists():
                results['checks'].append(f'✓ {test_dir}/ directory exists')
            else:
                results['status'] = 'warn'
                results['issues'].append(f'Missing {test_dir}/ directory')

        # Check test configs
        test_configs = [
            'vitest.config.ts',
            'playwright.config.ts',
            'vitest.bdd.config.ts'
        ]

        for config in test_configs:
            if (self.project_root / config).exists():
                results['checks'].append(f'✓ {config} exists')
            else:
                results['status'] = 'warn'
                results['issues'].append(f'Missing {config}')

        self.validation_results['testing'] = results

    def display_results(self):
        """Display validation results"""
        print("\n📊 Validation Results")
        print("=" * 60)

        for category, results in self.validation_results.items():
            status_emoji = {
                'pass': '✅',
                'warn': '⚠️ ',
                'fail': '❌'
            }[results['status']]

            print(f"\n{status_emoji} {category.replace('_', ' ').title()}")

            # Show checks
            for check in results['checks']:
                print(f"  {check}")

            # Show issues
            if results['issues']:
                print("  Issues:")
                for issue in results['issues']:
                    print(f"    - {issue}")

        # Summary
        print("\n" + "=" * 60)
        if self.has_errors:
            print("❌ Validation FAILED - Critical issues found")
        else:
            warnings = sum(1 for r in self.validation_results.values() if r['status'] == 'warn')
            if warnings:
                print(f"⚠️  Validation PASSED with {warnings} warning(s)")
            else:
                print("✅ Validation PASSED - All checks successful!")

if __name__ == "__main__":
    validator = StateValidator()
    success = validator.validate_all()
    exit(0 if success else 1)
