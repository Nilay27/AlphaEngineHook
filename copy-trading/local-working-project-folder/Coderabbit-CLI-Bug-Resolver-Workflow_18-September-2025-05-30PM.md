# CodeRabbit CLI Bug Resolver Workflow
*Created: September 18, 2025, 05:30 PM PDT*
*Updated: January 18, 2025, 09:00 PM IST - Expanded with detailed patterns from CLAUDE.md*

## CHANGELOG
- **2025-01-18 21:00 IST**: Added advanced patterns, auto-fix workflows, and four-layer defense system from CLAUDE.md

## Purpose
Build a repeatable loop where Claude Code uses the CodeRabbit CLI as a "bug sweeper" alongside existing log-heavy tooling (Playwright MCP, chrome-monitor, backend telemetry). The goal is to surface fresh defects quickly and hand actionable fixes back to Claude.

## Prerequisites
- CodeRabbit CLI installed (`coderabbit --version` works) and available in `$PATH`.
- `CODERABBIT_API_KEY` exported in the shell session Claude Code uses.
- Git workspace clean enough for CodeRabbit to diff staged/unstaged changes.
- Claude Code has terminal access to run local commands.

## Quick Reference (from CLAUDE.md)
- After ANY code edit: `coderabbit review --plain --severity=error`
- Before Playwright tests: Full review to prevent failures
- After test failures: `coderabbit review --plain --files <failing_component>`
- Before commits: `coderabbit review --plain --severity=error,warning`

## Command Cheatsheet
- `coderabbit review --plain` — Run full review on staged + unstaged changes with text output optimized for Claude.
- `coderabbit review --plain --severity=error` — Limit findings to blocking issues when you need a concise problem list.
- `coderabbit review --plain --files <path>` — Focus on specific areas (e.g. files touched in a failing Playwright suite).
- `coderabbit review --help` — Discover additional filters (scores, categories, etc.).

## Continuous Bug Sweep Loop
1. **Guard rails**: Ensure backend + frontend dev servers are running on mandated ports (see CLAUDE.md) so runtime checks reflect reality.
2. **Trigger**: After any code edit or when telemetry flags new issues, ask Claude to run:
   ```bash
   coderabbit review --plain --severity=error
   ```
   This keeps the signal high and identifies regressions quickly.
3. **Triage**: Claude summarizes each finding, cross-checking with current logs (chrome-monitor, backend telemetry, Playwright reports).
4. **Fix**: Claude applies targeted patches, then re-runs the review until it reports "no issues" or only informational notes.
5. **Log link**: If CodeRabbit highlights an issue tied to runtime errors, copy relevant log snippets into Claude’s scratchpad so subsequent runs know the context.

## Playwright-Driven Investigations
1. Kick off `playwright-setup start` or existing Playwright MCP scenarios.
2. When chrome-monitor or network logs surface anomalies, instruct Claude to:
   ```bash
   coderabbit review --plain --files frontend/src apps/frontend/tests
   ```
   (Adjust paths to the components involved in the failing suite.)
3. Compare CodeRabbit’s findings with the failing Playwright step. Prioritize items marked as `severity=error` or `severity=critical`.
4. After implementing fixes, rerun both Playwright and CodeRabbit review to confirm a clean loop.

## Background Watch Option (Manual Trigger)
If you want proactive sweeps while editing, use `fswatch` or `watchexec` (if installed) in a separate terminal:
```bash
watchexec --exts ts,tsx,js,jsx,py -- "coderabbit review --plain --severity=error"
```
Claude can be instructed to start/stop this watcher from the terminal, but keep it paused during large refactors to avoid noisy output.

## Telemetry Follow-Up Workflow
1. chrome-monitor flags repeated stack traces or error codes.
2. Claude captures the stack trace and references the commit range.
3. Run `coderabbit review --plain` to highlight code-level suspects.
4. Use the CLI output as the task list for Claude’s fix agent; ensure each resolved item is re-reviewed before confirming closure.

## Incorporating Findings into Claude Sessions
- Always paste the most recent CodeRabbit report into the active Claude conversation so it treats the warnings as constraints.
- When a warning recurs after multiple fixes, escalate by creating a quick incident note under `logs/` and reference it in the next Claude prompt.
- Add "Stop once CodeRabbit returns zero blocking issues" as an explicit instruction when delegating multi-step fixes to Claude.

## When to Run CodeRabbit Review
- After every Playwright suite run (pass or fail) to catch latent issues.
- Before handing a bug to the sub-agent for deep analysis.
- After merging telemetry-driven patches to guarantee no collateral regressions.
- Pre-commit and pre-push as part of the Safe Commit checklist.

## Rollback Strategy
If a CodeRabbit-driven fix worsens logs:
1. Use `git restore` or `git checkout -- <file>` to reset the change.
2. Re-run `coderabbit review --plain` to verify the issue disappears.
3. Hand logs + CodeRabbit diff to Claude for an alternative patch.

## Advanced Integration Patterns

### Auto-Fix Pattern for Claude
```markdown
# Claude should follow this pattern automatically:
1. Run: coderabbit review --plain --severity=error
2. Parse output for file:line:issue format
3. Apply fixes directly to identified locations
4. Re-run review to confirm resolution
5. Only proceed when output shows "No issues found" or only info-level
```

### Command Variants by Scenario
```bash
# Critical issues only (fast, focused)
coderabbit review --plain --severity=error

# Full analysis (comprehensive)
coderabbit review --plain

# Target specific area after failure
coderabbit review --plain --files frontend/src/components

# Check before commit (quality gate)
coderabbit review --plain --severity=error,warning

# Review with context from logs
echo "Error context: $(tail -20 logs/latest.log)" && coderabbit review --plain
```

## Four-Layer Quality Defense System

### Layer 1: Write-Time Prevention (CodeRabbit)
- **When**: During code writing/editing
- **Tool**: `coderabbit review --plain --severity=error`
- **Action**: Immediate fixes before code execution
- **Benefit**: Catches 70% of bugs before runtime

### Layer 2: Pre-Runtime Validation (CodeRabbit Full)
- **When**: Before Playwright tests
- **Tool**: `coderabbit review --plain`
- **Action**: Comprehensive review including warnings
- **Benefit**: Clean code = fewer test failures

### Layer 3: Runtime Monitoring (Existing Tools)
- **When**: During Playwright execution
- **Tools**: chrome-monitor + backend telemetry + network logs
- **Action**: Real-time error detection
- **Benefit**: Catches integration and runtime issues

### Layer 4: Post-Error Analysis (Enhanced)
- **When**: After any failure
- **Tools**: CodeRabbit + Sub-agent + All logs
- **Action**: Root cause analysis with static + dynamic context
- **Benefit**: Faster resolution with dual perspective

### Automated Escalation Path
```
Edit → CodeRabbit Quick → Clean? → Test
                     ↓ Issues?
                Fix → Re-review → Test
                            ↓ Still fails?
                    Full Analysis Mode
```

## Integration with Custom Commands
- `/bug-sweep`: Comprehensive bug sweep with auto-fix
- `/pre-test-check`: Quality gate before Playwright tests
- `/smart-fix`: Intelligent fixes combining static + runtime context

These commands are available in `.claude/commands/` directory.
