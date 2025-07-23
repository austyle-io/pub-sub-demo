#!/usr/bin/env python3
"""
Progress tracking tool for pub-sub-demo project.
Updates .agent/current/progress.json with current completion status.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional


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
        # Create default progress structure
        return {
            "components": {
                "frontend": {
                    "react_app": 95,
                    "authentication": 90,
                    "document_editor": 85,
                    "real_time_sync": 80,
                    "ui_components": 90
                },
                "backend": {
                    "sharedb_integration": 85,
                    "jwt_auth": 90,
                    "websocket_handling": 80,
                    "api_routes": 85,
                    "middleware": 90
                },
                "shared": {
                    "type_definitions": 90,
                    "validation_schemas": 85,
                    "auth_utilities": 90,
                    "logging": 80
                },
                "infrastructure": {
                    "testing_setup": 85,
                    "ci_cd_pipeline": 70,
                    "docker_config": 80,
                    "documentation": 85
                }
            },
            "metadata": {
                "format_version": "1.0",
                "last_updated": datetime.now().isoformat() + "Z",
                "project_start": "2025-01-01",
                "package_manager": "pnpm",
                "project": "pub-sub-demo"
            },
            "metrics": {
                "blockers": [],
                "health": "green",
                "overall_completion": 85.0,
                "phase": "development-stabilization"
            },
            "tasks": {
                "completed": [
                    "Basic React app setup",
                    "ShareDB integration",
                    "JWT authentication",
                    "WebSocket connections",
                    "Basic document editing"
                ],
                "in_progress": [
                    "Agent system setup",
                    "Comprehensive testing",
                    "Security hardening"
                ],
                "pending": [
                    "Performance optimization",
                    "Production deployment",
                    "Monitoring setup"
                ]
            }
        }

    with open(progress_file, 'r') as f:
        return json.load(f)


def calculate_overall_completion(components: Dict[str, Dict[str, int]]) -> float:
    """Calculate overall completion percentage."""
    total_score = 0
    total_components = 0

    for category in components.values():
        for score in category.values():
            total_score += score
            total_components += 1

    if total_components == 0:
        return 0.0

    return round(total_score / total_components, 1)


def update_component(progress: Dict[str, Any], category: str, component: str, value: int) -> bool:
    """Update a specific component's progress."""
    if category not in progress["components"]:
        print(f"Error: Category '{category}' not found")
        print(f"Available categories: {', '.join(progress['components'].keys())}")
        return False

    if component not in progress["components"][category]:
        print(f"Error: Component '{component}' not found in category '{category}'")
        print(f"Available components: {', '.join(progress['components'][category].keys())}")
        return False

    if not 0 <= value <= 100:
        print("Error: Progress value must be between 0 and 100")
        return False

    old_value = progress["components"][category][component]
    progress["components"][category][component] = value

    # Recalculate overall completion
    progress["metrics"]["overall_completion"] = calculate_overall_completion(progress["components"])

    # Update metadata
    progress["metadata"]["last_updated"] = datetime.now().isoformat() + "Z"

    print(f"Updated {category}.{component}: {old_value}% → {value}%")
    print(f"Overall completion: {progress['metrics']['overall_completion']}%")

    return True


def add_task(progress: Dict[str, Any], task: str, status: str = "pending") -> bool:
    """Add a new task to the progress tracking."""
    valid_statuses = ["completed", "in_progress", "pending"]

    if status not in valid_statuses:
        print(f"Error: Status must be one of: {', '.join(valid_statuses)}")
        return False

    # Remove task from other status lists first
    for task_status in valid_statuses:
        if task in progress["tasks"][task_status]:
            progress["tasks"][task_status].remove(task)

    # Add to the specified status
    if task not in progress["tasks"][status]:
        progress["tasks"][status].append(task)
        print(f"Added task '{task}' with status '{status}'")
    else:
        print(f"Task '{task}' already exists with status '{status}'")

    progress["metadata"]["last_updated"] = datetime.now().isoformat() + "Z"
    return True


def save_progress(progress: Dict[str, Any]) -> None:
    """Save progress data to file."""
    progress_file = get_project_root() / '.agent' / 'current' / 'progress.json'
    progress_file.parent.mkdir(parents=True, exist_ok=True)

    with open(progress_file, 'w') as f:
        json.dump(progress, f, indent=4)

    print(f"Progress saved to {progress_file}")


def display_progress(progress: Dict[str, Any]) -> None:
    """Display current progress in a readable format."""
    print(f"\nPub-Sub Demo Progress Report")
    print(f"Overall Completion: {progress['metrics']['overall_completion']}%")
    print(f"Current Phase: {progress['metrics']['phase']}")
    print(f"Health Status: {progress['metrics']['health']}")
    print(f"Last Updated: {progress['metadata']['last_updated']}")

    print(f"\nComponent Progress:")
    for category, components in progress["components"].items():
        print(f"\n{category.title()}:")
        for component, score in components.items():
            bar_length = 20
            filled_length = int(score * bar_length // 100)
            bar = "█" * filled_length + "░" * (bar_length - filled_length)
            print(f"  {component}: {score:3d}% [{bar}]")

    print(f"\nTasks:")
    for status, tasks in progress["tasks"].items():
        if tasks:
            print(f"\n{status.title().replace('_', ' ')}:")
            for task in tasks:
                status_icon = {"completed": "✅", "in_progress": "🔄", "pending": "⏳"}
                print(f"  {status_icon.get(status, '•')} {task}")


def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) < 2:
        progress = load_progress()
        display_progress(progress)
        return

    command = sys.argv[1]

    try:
        progress = load_progress()

        if command == "show" or command == "display":
            display_progress(progress)

        elif command == "update" and len(sys.argv) == 5:
            category, component, value = sys.argv[2], sys.argv[3], int(sys.argv[4])
            if update_component(progress, category, component, value):
                save_progress(progress)

        elif command == "task" and len(sys.argv) >= 4:
            task_name = sys.argv[2]
            task_status = sys.argv[3] if len(sys.argv) > 3 else "pending"
            if add_task(progress, task_name, task_status):
                save_progress(progress)

        elif command == "phase" and len(sys.argv) == 3:
            new_phase = sys.argv[2]
            old_phase = progress["metrics"]["phase"]
            progress["metrics"]["phase"] = new_phase
            progress["metadata"]["last_updated"] = datetime.now().isoformat() + "Z"
            print(f"Updated phase: {old_phase} → {new_phase}")
            save_progress(progress)

        else:
            print("Usage:")
            print("  python3 update-progress.py                                    # Show current progress")
            print("  python3 update-progress.py update <category> <component> <value>  # Update component")
            print("  python3 update-progress.py task <task_name> <status>          # Add/update task")
            print("  python3 update-progress.py phase <phase_name>                 # Update project phase")
            print("")
            print("Examples:")
            print("  python3 update-progress.py update frontend document_editor 90")
            print("  python3 update-progress.py task 'Implement real-time cursors' in_progress")
            print("  python3 update-progress.py phase production-ready")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
