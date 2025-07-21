# Agent System Integration Guide

## For AI Assistants

### Starting a Session

```bash
# 1. Check current state
make up

# 2. Review blockers
cat .agent/current/blockers.md

# 3. Check recent handoffs
ls -la .agent/history/handoffs/
```

### During Work

- Update progress after major changes: `python3 .agent/tools/update-progress-simple.py`
- Log blockers immediately in `.agent/current/blockers.md`
- Use agent tools directly when Make commands aren't sufficient

### Ending a Session

```bash
# Generate comprehensive handoff
make ho "Completed X, Y, Z. Next: A, B, C"

# Update state if needed
echo "Current focus: Component refactoring" >> .agent/current/state.md
```

## Agent Tools Reference

### Progress Tracking

- **Tool**: `.agent/tools/update-progress-simple.py`
- **Purpose**: Updates `.agent/current/progress.json`
- **When**: After completing migration tasks
- **Current Status**: 93.5% complete

### Handoff Generation

- **Tool**: `.agent/tools/generate-handoff-simple.py`
- **Purpose**: Creates timestamped handoffs in `.agent/history/handoffs/`
- **When**: End of each work session
- **Latest**: Check `.agent/history/handoffs/` for most recent

### Metrics Dashboard

- **Tool**: `.agent/tools/generate-metrics.py`
- **Purpose**: Creates `.agent/current/metrics.md`
- **When**: Daily or after major milestones
- **View**: `make metrics` to generate, then `cat .agent/current/metrics.md`

### State Validation

- **Tool**: `.agent/tools/validate-state.py`
- **Purpose**: Validates project consistency
- **When**: Before major commits or handoffs
- **Command**: `make validate-state`

## Workflow Examples

### Example 1: Starting a Feature

```bash
# Start of session
make up                                    # Check progress
cat .agent/current/blockers.md           # Review blockers

# Work on feature
# ... make changes ...

# Mid-session update
echo "- Working on user auth module" >> .agent/current/state.md
python3 .agent/tools/update-progress-simple.py

# End of session
make ho "Implemented user auth module, 80% complete"
```

### Example 2: Resolving a Blocker

```bash
# Found a blocker
echo "- Jest configuration conflict with Vitest" >> .agent/current/blockers.md

# After resolution
# Edit .agent/current/blockers.md, move blocker to "Resolved" section
make ho "Resolved Jest/Vitest conflict by updating config"
```

### Example 3: Team Collaboration

```bash
# Check team feedback
ls -la .agent/feedback/

# Add your own feedback
cat > .agent/feedback/feedback-ai-$(date +%Y%m%d).md << EOF
# AI Assistant Feedback

**Date**: $(date)
**Type**: AI Integration

## Observations
- Agent system working well
- Make commands save time
- Progress tracking helpful

## Suggestions
- Add more Make shortcuts
- Create agent troubleshooting guide
EOF

# Generate metrics for team
make metrics
```

## Key Integration Points

### 1. Progress Tracking

- **File**: `.agent/current/progress.json`
- **Format**: JSON with component percentages
- **Updates**: Automatic via `make up`

### 2. State Management

- **File**: `.agent/current/state.md`
- **Format**: Markdown with current focus
- **Updates**: Manual additions

### 3. Blocker Tracking

- **File**: `.agent/current/blockers.md`
- **Format**: Markdown list
- **Sections**: Active, Resolved, Potential

### 4. Metrics Dashboard

- **File**: `.agent/current/metrics.md`
- **Format**: Markdown with visualizations
- **Generation**: `make metrics`

## Best Practices

1. **Always start with `make up`** - Know current state
2. **Update blockers immediately** - Don't wait
3. **Generate handoffs religiously** - Even for short sessions
4. **Use Make commands first** - Fall back to Python tools only when needed
5. **Check feedback regularly** - Team input matters

## Troubleshooting

### Python Tools Not Working

```bash
# Check Python version
python3 --version  # Should be 3.6+

# Make tools executable
make setup-migration

# Run directly
cd .agent/tools && python3 update-progress-simple.py
```

### Make Commands Not Found

```bash
# Ensure you're in project root
pwd  # Should show .../austdx

# Check Makefile exists
ls -la Makefile

# Use long form if shortcuts fail
make update-progress  # Instead of 'make up'
```

### Progress Not Updating

1. Check JSON syntax: `python3 -m json.tool .agent/current/progress.json`
2. Verify file permissions: `ls -la .agent/current/`
3. Run validation: `make validate-state`

## Remember

The agent system is your **collaborative memory**. Use it to:

- Track what's been done (progress)
- Know what's blocking (blockers)
- Share context (handoffs)
- Measure success (metrics)

Integration isn't optional - it's how we maintain 93.5% completion and keep moving forward!
