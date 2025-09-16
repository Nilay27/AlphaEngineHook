## Quick Reference

- **Package Manager**: Use `bun` (not npm)
- **Ports**: Frontend `3000`, Backend `3001`
- **Database**: PostgreSQL `alphaengine` on localhost:5432
- **Project Type**: AlphaEngine (clean slate from LearnLedger boilerplate)

## Key Commands

- **Database**: `bun run db:push` (apply schema changes)
- **Debug Setup**: `chrome-debug start && chrome-monitor start`
- **Log Analysis**: `cd backend && node scripts/collect-logs.js`
- **Playwright MCP**: `claude mcp add playwright -s local -- npx @playwright/mcp@latest --cdp-endpoint http://localhost:9222 --user-data-dir=$HOME/chrome-debug-profile`

## Documentation References

- **Debugging Workflow**: `local-working-project-folder/AlphaEngine-Debugging-Workflow_16-September-2025-12:12PM.md`
- **Database Setup**: `local-working-project-folder/AlphaEngine-Database-Setup_16-September-2025-12:12PM.md`
- **Schema**: `backend/db/schema/` directory
- **Logs**: `logs/` directory with IST timestamps
- **Technical Design**: `local-working-project-folder/TDD-AlphaEngine-CleanSlate_14-September-2025-04:12PM.md`
- **Implementation Plan**: `local-working-project-folder/chatgpt-prepared-implementation-plan.md`

## Guidelines

- **File Cleanup**: Ask before deleting LearnLedger remnants
- **Database**: PostgreSQL only (no SQLite/MySQL)
- **Debugging**: Use session-based logging with correlation IDs
- **Playwright Testing**: Connect to chrome-debug instance (port 9222) with MetaMask support, non-headless mode for visibility

## CLAUDE.md Maintenance Pattern (IMPORTANT)

### Adding New Information:
- **Small changes (≤10-15 lines)**: Add directly to this file
- **Large changes (>10-15 lines)**:
  1. Add **minimal summary** in this file
  2. Create detailed document in `local-working-project-folder/ProjectName-Topic_DD-Month-YYYY-HHMMXM.md`
  3. Add **reference link** in Documentation References section

### Updating Existing Information:
- **Small updates**: Edit directly in this file
- **Large updates**: Update the referenced detailed document, keep summary in this file unchanged
- **Remove outdated**: Remove summary and reference link, archive/delete detailed document

### Pre-Commit Requirement:
- **ALWAYS check and update this CLAUDE.md file before committing**
- Ensure all new project knowledge is documented
- Verify all references point to existing files
- Update any changed commands or configurations

### Benefits:
- Essential info immediately accessible in this file
- Detailed workflows preserved in dedicated timestamped documents
- No size restrictions but organized for maintainability
- Easy discovery through references section
- Always up-to-date before commits
