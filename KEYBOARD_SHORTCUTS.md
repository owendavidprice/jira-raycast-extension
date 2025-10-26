# Keyboard Shortcuts Guide

This document lists all available keyboard shortcuts in the Jira for Windows extension.

## Global Shortcuts

These shortcuts work in all views where applicable:

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Enter` | Submit Form | Submit the current form |
| `Ctrl+R` | Refresh | Reload the current list |
| `Enter` | Primary Action | Execute the primary action (usually "Open in Jira") |
| `Escape` | Go Back | Return to previous view |
| `Tab` | Next Field | Move to next form field |
| `Shift+Tab` | Previous Field | Move to previous form field |

## Create Task Command

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Enter` | Create Task | Submit and create the new task |

**Form Navigation:**
- Use `Tab` / `Shift+Tab` to move between fields
- All fields support auto-complete where applicable

## Review Tasks Command

View and manage tasks assigned to you.

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Enter` | Open in Jira | Open the selected task in your browser |
| `Ctrl+D` | Mark as Done | Complete the selected task |
| `Ctrl+T` | Change Status | Open status transition menu |
| `Ctrl+R` | Refresh | Reload the task list |
| `Ctrl+C` | Copy Issue Key | Copy the issue key (e.g., FPA-143) |
| `Ctrl+Shift+C` | Copy Issue URL | Copy the full Jira URL |

**Status Transitions:**
- Press `Ctrl+T` to see available status transitions
- Navigate with arrow keys, press `Enter` to select

## Project Overview Command

View and manage all tasks in a selected project.

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Enter` | Open in Jira | Open the selected task in your browser |
| `Ctrl+D` | Mark as Done | Complete the selected task |
| `Ctrl+T` | Change Status | Open status transition menu |
| `Ctrl+M` | Add Comment | Add a comment to the selected task |
| `Ctrl+R` | Refresh | Reload the task list |
| `Ctrl+C` | Copy Issue Key | Copy the issue key (e.g., FPA-143) |
| `Ctrl+Shift+C` | Copy Issue URL | Copy the full Jira URL |

**Project Selection:**
- Click the dropdown at the top to switch projects
- No keyboard shortcut needed - just click and select

**Adding Comments:**
- Press `Ctrl+M` to open the comment form
- Type your comment (supports markdown)
- Press `Ctrl+Enter` to submit
- Press `Escape` to cancel

## Configure Extension Command

Setup your Jira credentials with an interactive form.

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Enter` | Copy Configuration | Copy your config to clipboard |
| `Ctrl+T` | Open API Token Page | Open Atlassian API token generation page |
| `Tab` | Next Field | Move to next field |
| `Shift+Tab` | Previous Field | Move to previous field |

## Tips for Power Users

### 1. Quick Task Completion Workflow
```
1. Open Review Tasks (or Project Overview)
2. Navigate to task with arrow keys
3. Press Ctrl+D to mark as done
4. Confirm with Enter
5. Task auto-refreshes
```

### 2. Status Change Workflow
```
1. Select a task
2. Press Ctrl+T
3. Choose status with arrow keys
4. Press Enter to apply
5. List auto-refreshes
```

### 3. Add Quick Comment
```
1. Select a task in Project Overview
2. Press Ctrl+M
3. Type your comment
4. Press Ctrl+Enter to submit
5. List auto-refreshes
```

### 4. Copy and Share Task Links
```
1. Select a task
2. Press Ctrl+Shift+C to copy URL
3. Paste in Slack/Teams/Email
```

### 5. Rapid Task Creation
```
1. Open Create Task
2. Fill in Title (Tab to next field)
3. Fill in Description (Tab)
4. Select Project (Tab)
5. Select Issue Type (Tab)
6. Choose Deadline (Tab)
7. Press Ctrl+Enter to create
```

## Keyboard-First Philosophy

This extension is designed to be fully navigable via keyboard:

✅ **Every action has a keyboard shortcut**  
✅ **Tab navigation works throughout**  
✅ **Auto-focus on first fields**  
✅ **Escape always goes back**  
✅ **Enter always does primary action**  

### Navigation Pattern
1. **Arrow Keys**: Move between list items
2. **Tab/Shift+Tab**: Move between form fields
3. **Enter**: Execute primary action
4. **Escape**: Go back/cancel
5. **Ctrl+[Key]**: Quick actions

## Customization

Currently, keyboard shortcuts are fixed. If you need custom shortcuts:
1. Check Raycast settings for global command shortcuts
2. You can assign custom shortcuts to open each command
3. Once inside a command, use the shortcuts listed above

## Windows vs macOS

This extension uses **Windows-native shortcuts**:
- `Ctrl` instead of `Cmd`
- `Shift` for modifiers
- Standard Windows conventions

If you're switching from macOS:
- `⌘` → `Ctrl`
- `⌥` → `Alt` (not used currently)
- `⇧` → `Shift`

## Conflicts with Raycast

Some shortcuts might conflict with Raycast global shortcuts:
- **Ctrl+C**: Usually copy, but we use it for "Copy Issue Key"
- **Solution**: Raycast's context takes precedence, so our shortcuts work within the extension view

## Accessibility

All keyboard shortcuts are also available via:
- **Mouse clicks**: All actions can be clicked
- **Action Panel**: Press `Ctrl+K` in Raycast to see all available actions
- **Search**: Type action names in Raycast's command bar

## Quick Reference Card

Print-friendly shortcut reference:

```
╔══════════════════════════════════════════════╗
║      JIRA FOR WINDOWS - QUICK REFERENCE      ║
╠══════════════════════════════════════════════╣
║ GLOBAL ACTIONS                               ║
║ ─────────────────────────────────────────    ║
║ Enter          Open in Jira                  ║
║ Ctrl+R         Refresh                       ║
║ Ctrl+C         Copy Issue Key                ║
║ Ctrl+Shift+C   Copy Issue URL                ║
║                                              ║
║ TASK MANAGEMENT                              ║
║ ─────────────────────────────────────────    ║
║ Ctrl+D         Mark as Done                  ║
║ Ctrl+T         Change Status                 ║
║ Ctrl+M         Add Comment (Project Overview)║
║                                              ║
║ FORMS                                        ║
║ ─────────────────────────────────────────    ║
║ Ctrl+Enter     Submit Form                   ║
║ Tab            Next Field                    ║
║ Shift+Tab      Previous Field                ║
║ Escape         Cancel/Go Back                ║
╚══════════════════════════════════════════════╝
```

## Getting Help

If a keyboard shortcut isn't working:
1. Ensure you're focused on the extension (not Raycast search)
2. Check if another app is capturing the shortcut
3. Try clicking the action to ensure it works
4. Check the extension logs for errors

For more help, see:
- `README.md` - General extension documentation
- `PROJECT_OVERVIEW_GUIDE.md` - Project Overview specific guide
- `CONFIGURATION_WORKAROUND.md` - Setup help

