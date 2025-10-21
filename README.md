# Jira Raycast Extension

Create and review Jira tasks directly from Raycast.

## Features

### 1. Create Task
Create new Jira tasks with comprehensive details:
- **Title**: Brief summary of the task
- **Description**: Detailed description of what needs to be done
- **Project**: Select from your available Jira projects
- **Issue Type**: Choose the type of issue (Task, Bug, Story, etc.)
- **Deadline**: Quick options (Today, Tomorrow, 1 week, etc.) or custom date
- **Priority**: Select priority level from your Jira priorities
- **Labels**: Add existing labels to categorize your task

### 2. Review Tasks
View and manage all tasks assigned to you:
- Sorted by deadline (ascending)
- Shows task key, title, project, status, priority, and due date
- Color-coded indicators for overdue, today, and upcoming tasks
- **Mark as Done**: Quickly complete tasks (Ctrl+D)
- **Change Status**: Transition tasks to any available status (Ctrl+T)
- **Refresh**: Reload the task list (Ctrl+R)
- Quick actions to open in Jira or copy task details

## Setup

### 1. Generate Jira API Token

1. Log in to your Atlassian account
2. Go to [API Tokens page](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Click **Create API token**
4. Provide a label (e.g., "Raycast Extension")
5. Click **Create** and copy the token

### 2. Configure Extension

Open Raycast preferences for the Jira extension and enter:

- **Jira Domain**: Your Jira domain (e.g., `yourcompany.atlassian.net`)
- **Email**: Your Atlassian account email
- **API Token**: The token you generated in step 1

## Usage

### Creating a Task

1. Open Raycast
2. Type "Create Task" and select the Jira command
3. Fill in the task details:
   - Title (required)
   - Description (optional)
   - Project (required) - dynamically loads your projects
   - Issue Type (required) - loads based on selected project
   - Deadline - choose from quick options or custom date
   - Priority (optional) - select from available priorities
   - Labels (optional) - add existing labels
4. Press `Ctrl + Enter` to create the task
5. A success notification will appear with a link to open the task in Jira

### Reviewing Tasks

1. Open Raycast
2. Type "Review Tasks" and select the Jira command
3. Browse your assigned tasks sorted by deadline
4. Use the search bar to filter tasks
5. Select a task and:
   - Press `Enter` to open it in Jira
   - Press `Ctrl + D` to mark it as done
   - Press `Ctrl + T` to change status (opens submenu with available transitions)
   - Press `Ctrl + R` to refresh the list
   - Press `Ctrl + C` to copy the issue key
   - Press `Ctrl + Shift + C` to copy the issue URL

## Features

- **Smart Deadline Options**: Quick selections for common deadlines
- **Dynamic Form Fields**: Issue types and labels load based on selected project
- **Color-Coded Status**: Visual indicators for task urgency
- **Status Management**: Mark tasks as done or change to any available status
- **Workflow Transitions**: Automatically detects and presents available status transitions
- **Auto-Refresh**: Task list updates automatically after status changes
- **Windows Keyboard Shortcuts**: Fast navigation with Windows-native Ctrl shortcuts
- **Confirmation Dialogs**: Prevents accidental status changes
- **Error Handling**: Clear error messages for API issues

## Authentication

This extension uses Jira's REST API with Basic Authentication:
- Your credentials are stored securely in Raycast preferences
- API tokens are more secure than passwords and can be revoked anytime
- All API calls are made over HTTPS

## Requirements

- Raycast 1.26.0 or higher
- Node.js 22.14 or higher
- Access to a Jira Cloud instance
- Valid Jira API token

## Development

To develop this extension locally:

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Fix linter issues
npm run fix-lint
```

## Troubleshooting

### "Failed to load data" error
- Verify your Jira domain is correct (without `https://`)
- Check that your email and API token are valid
- Ensure your API token hasn't expired

### "Failed to create task" error
- Ensure all required fields are filled in
- Verify you have permission to create issues in the selected project
- Check that the selected project exists and is accessible

### No projects showing up
- Verify your Jira account has access to at least one project
- Check your API token has the required permissions

## API Reference

This extension uses the following Jira REST API endpoints:

- `GET /rest/api/2/project` - List projects
- `GET /rest/api/2/priority` - List priorities
- `GET /rest/api/2/project/{projectKey}` - Get project details and issue types
- `POST /rest/api/2/issue` - Create new issue
- `GET /rest/api/3/search/jql` - Search for issues with JQL
- `GET /rest/api/3/issue/{issueKey}/transitions` - Get available transitions
- `POST /rest/api/3/issue/{issueKey}/transitions` - Transition issue to new status

For more information, see the [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/software/rest/intro/).

## License

MIT

## Author

Owen David Price

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

