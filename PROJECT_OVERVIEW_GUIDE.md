# Project Overview Command Guide

## Overview
The **Project Overview** command lets you view all outstanding tasks in any of your Jira projects. It features a **dropdown selector** at the top of the window to easily switch between projects.

## How to Use

### Step 1: Open the Command
1. Open Raycast
2. Type: `Project Overview`
3. Select the command from the Jira for Windows extension

### Step 2: Select a Project
At the top of the window, you'll see a **dropdown menu** that says "Select Project":
- Click on it to see all your available projects
- Select the project you want to view
- The list of tasks will automatically update

### Step 3: Browse Tasks
Once a project is selected, you'll see:
- All outstanding (unresolved) tasks in that project
- Sorted by due date (overdue tasks first)
- Color-coded status tags
- Due date indicators with icons

## Features

### Visual Indicators
- 🔴 **Red Exclamation**: Overdue tasks
- 🟠 **Orange Clock**: Due today
- 📅 **Gray Calendar**: Future due dates
- ✓ **Green Checkmark**: No outstanding tasks

### Status Colors
- 🟢 **Green**: Done/Complete
- 🔵 **Blue**: In Progress/Doing
- 🔴 **Red**: Blocked/On Hold
- ⚪ **Gray**: Other statuses

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Open task in Jira |
| `Ctrl+R` | Refresh task list |
| `Ctrl+C` | Copy issue key |
| `Ctrl+Shift+C` | Copy issue URL |

## Default Project Behavior

If you've set a **Default Project** in your extension preferences:
- That project will be automatically selected when you open the command
- Otherwise, the first project alphabetically will be selected

You can always change the selected project using the dropdown at the top.

## Empty States

### "No Project Selected"
If you see this message, click the dropdown at the top to select a project.

### "No Outstanding Tasks"
Great news! All tasks in the selected project are complete. You can:
- Select a different project from the dropdown
- Press `Ctrl+R` to refresh in case there are new tasks

## Switching Between Projects

To switch to a different project:
1. Click the dropdown at the top (shows "Select Project")
2. Choose a new project from the list
3. The task list updates automatically
4. No need to close and reopen the command!

## Tips

1. **Quick Project Switch**: Use the dropdown to quickly browse tasks across all your projects without leaving Raycast

2. **Refresh Often**: Press `Ctrl+R` to reload the task list and see the latest updates from Jira

3. **Combine with Review Tasks**: Use "Project Overview" to see all project tasks, and "Review Tasks" to see only your assigned tasks

4. **Default Project**: Set your most-used project as the default in extension preferences to save time

## Troubleshooting

### Dropdown not showing projects
- Verify your Jira credentials are correct
- Check that you have access to at least one project
- Try refreshing with `Ctrl+R`

### "Failed to load issues"
- Verify the project key is valid
- Check your internet connection
- Ensure you have permission to view issues in the selected project

### Project not in the list
- The dropdown only shows projects you have access to
- Contact your Jira admin if you need access to additional projects

## Difference from Review Tasks

| Feature | Project Overview | Review Tasks |
|---------|-----------------|--------------|
| **Filter** | All tasks in a project | Only tasks assigned to you |
| **Project Selection** | Dropdown to select any project | Shows tasks from all projects |
| **Use Case** | Team/project management | Personal task management |
| **Sorting** | By due date | By due date |

## Example Workflow

1. **Morning Check**: Open Project Overview, select your main project
2. **Review Tasks**: See what needs attention today (overdue/due today in red/orange)
3. **Quick Access**: Click a task and press Enter to open in Jira
4. **Switch Projects**: Use dropdown to check other projects
5. **Copy & Share**: Use `Ctrl+C` to copy task keys for team communication

---

**Pro Tip**: Bookmark this command in Raycast (right-click → Add to Favorites) for even faster access!

