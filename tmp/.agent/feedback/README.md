# Migration Feedback Collection

This directory collects team feedback on the austdx migration.

## How to Submit Feedback

### Option 1: Direct File

Create a file named `feedback-[your-name]-[date].md` in this directory.

### Option 2: Anonymous

Create a file named `feedback-anon-[timestamp].md`.

### Option 3: Use the Template

Copy `feedback-template.md` and fill it out.

## Feedback Categories

- **positive/** - What's working well
- **issues/** - Problems encountered
- **suggestions/** - Improvement ideas
- **training/** - Training needs

## Quick Feedback Command

```bash
# Create feedback file
echo "Your feedback here" > .agent/feedback/feedback-$(date +%Y%m%d-%H%M%S).md
```

## Review Schedule

Feedback is reviewed:

- Daily during migration
- Weekly thereafter
- All feedback gets a response within 48 hours
