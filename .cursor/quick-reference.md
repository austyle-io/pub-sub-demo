# Quick Reference: Cursor + Agent System (Pub-Sub Demo)

## 🚀 Start Working

```bash
make up          # See progress (85.0%)
code .           # Open in Cursor
```

## 📝 During Development

| Task            | Command                           | When                      |
| --------------- | --------------------------------- | ------------------------- |
| Check state     | `cat .agent/current/state.md`     | Before major changes      |
| Update progress | `make up`                         | After completing features |
| Log blocker     | Edit `.agent/current/blockers.md` | Immediately               |
| Run tests       | `make test`                       | Before commits            |
| Lint code       | `make lint`                       | Before commits            |

## 🤝 End Session

```bash
make ho "Completed auth module, fixed tests"  # Generate handoff
```

## 🔧 Agent Tools

- Progress: `.agent/tools/update-progress.py`
- Handoff: `.agent/tools/generate-handoff.py`
- Both tools can be run directly or via Makefile

## 🔍 AI Assistant Modes

Available specialized modes in Cursor:

1. **Pub-Sub Demo Assistant** - General development
2. **ShareDB Expert** - Real-time collaboration features
3. **TypeScript Enforcer** - Strict typing and best practices
4. **Security Specialist** - Input validation and auth
5. **Testing Expert** - Comprehensive test coverage
6. **Agent Workflow** - Progress tracking and handoffs

## 🚫 Never Do This

- ❌ Use npm (always pnpm)
- ❌ console.log (use structured logging)
- ❌ any types (use unknown + guards)
- ❌ interfaces (use type declarations)
- ❌ Skip handoffs

## 📁 Key Files

- `.cursorrules` - Main config for AI assistants
- `.cursor/rules/` - All coding rules and patterns
- `.agent/current/` - Live project state
- `.cursor/modes.json` - AI assistant modes

## 💡 Pro Tips for Collaborative Editing

- Use `make dev` to start both frontend and backend
- Check ShareDB connection health regularly
- Monitor WebSocket connections for performance
- Validate all ShareDB operations before applying
- Test real-time synchronization with multiple users

## 📊 Current Status

- Overall: 85.0% complete
- Phase: development-stabilization
- Health: Green ✅

## ⚡ Quick Commands

```bash
make up              # Update progress
make ho              # Generate handoff
make test            # Run all tests
make dev             # Start development servers
make lint            # Run linting
make test-e2e        # Run E2E tests
```

## 🚨 Critical Rules for Pub-Sub Demo

1. **ALWAYS use pnpm** (never npm)
2. **NO console.log** (use structured logging)
3. **NO any types** (use unknown + type guards)
4. **NO interfaces** (use type declarations)
5. **VALIDATE ShareDB operations** before applying
6. **SANITIZE user input** for XSS prevention
7. **USE JWT validation** for all protected routes

## 📁 Project Structure

- `apps/client/` - React frontend with real-time editing
- `apps/server/` - Node.js backend with ShareDB
- `packages/shared/` - Shared types and utilities
- `.agent/current/` - Agent system state tracking
- `.cursor/rules/` - Comprehensive coding standards

## 🔐 Security Context

- JWT authentication for all operations
- Input validation with Zod schemas
- ShareDB operation validation required
- XSS prevention with HTML sanitization
- Rate limiting for sensitive endpoints

## 📈 Performance Monitoring

- Monitor ShareDB operation latency
- Track WebSocket connection health
- Measure document synchronization speed
- Profile real-time collaboration performance

## 🆘 Help

- Onboarding: Check `docs/` directory
- Agent Integration: `.agent/current/state.md`
- Rules: `.cursor/rules/index.md`
- Makefile help: `make help`

## 🎯 Development Focus Areas

1. **Real-time Collaboration** - ShareDB optimization
2. **Type Safety** - Runtime validation patterns
3. **Security** - Input validation and sanitization
4. **Testing** - Comprehensive coverage including E2E
5. **Performance** - WebSocket and document sync optimization
