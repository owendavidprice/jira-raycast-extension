import {
  List,
  ActionPanel,
  Action,
  showToast,
  Toast,
  Icon,
  Color,
  open,
  getPreferenceValues,
  confirmAlert,
  Alert,
  Form,
  useNavigation,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { JiraAPI, JiraIssue, JiraTransition } from "./jira-api";
import { formatDateForJira } from "./utils/date";

interface Preferences {
  jiraDomain: string;
}

function ChangeStatusSubmenu({
  issue,
  onStatusChange,
}: {
  issue: JiraIssue;
  onStatusChange: (transitionId: string, transitionName: string) => void;
}) {
  const [transitions, setTransitions] = useState<JiraTransition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTransitions() {
      try {
        const api = new JiraAPI();
        const transitionsData = await api.getTransitions(issue.key);
        setTransitions(transitionsData);
      } catch (error) {
        console.error("Failed to load transitions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTransitions();
  }, [issue.key]);

  if (isLoading) {
    return (
      <ActionPanel.Submenu title="Change Status" icon={Icon.ArrowRight}>
        <Action title="Loading…" />
      </ActionPanel.Submenu>
    );
  }

  if (transitions.length === 0) {
    return (
      <ActionPanel.Submenu title="Change Status" icon={Icon.ArrowRight}>
        <Action title="No Transitions Available" />
      </ActionPanel.Submenu>
    );
  }

  return (
    <ActionPanel.Submenu
      title="Change Status"
      icon={Icon.ArrowRight}
      shortcut={{ modifiers: ["ctrl"], key: "t" }}
    >
      {transitions.map((transition) => (
        <Action
          key={transition.id}
          title={transition.name}
          icon={Icon.Circle}
          onAction={() => onStatusChange(transition.id, transition.to.name)}
        />
      ))}
    </ActionPanel.Submenu>
  );
}

function AddCommentForm({
  issue,
  onCommentAdded,
}: {
  issue: JiraIssue;
  onCommentAdded: () => void;
}) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: { comment: string }) {
    if (!values.comment.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Comment cannot be empty",
      });
      return;
    }

    setIsSubmitting(true);
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Adding comment...",
    });

    try {
      const api = new JiraAPI();
      await api.addComment(issue.key, values.comment);

      toast.style = Toast.Style.Success;
      toast.title = "Comment added";
      toast.message = `Comment added to ${issue.key}`;

      pop();
      onCommentAdded();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to add comment";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Add Comment"
            icon={Icon.Message}
            onSubmit={handleSubmit}
            shortcut={{ modifiers: ["ctrl"], key: "enter" }}
          />
        </ActionPanel>
      }
    >
      <Form.Description
        text={`Add a comment to ${issue.key}: ${issue.fields.summary}`}
      />
      <Form.TextArea
        id="comment"
        title="Comment"
        placeholder="Enter your comment..."
        autoFocus
        info="Your comment will be added to this issue in Jira"
      />
    </Form>
  );
}

function EditDueDateForm({
  issue,
  onUpdated,
}: {
  issue: JiraIssue;
  onUpdated: () => void;
}) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: { newDueDate?: Date }) {
    if (!values.newDueDate) {
      await showToast({ style: Toast.Style.Failure, title: "Please select a date" });
      return;
    }
    setIsSubmitting(true);
    const toast = await showToast({ style: Toast.Style.Animated, title: "Updating due date..." });
    try {
      const api = new JiraAPI();
      await api.updateIssueDueDate(issue.key, formatDateForJira(values.newDueDate));
      toast.style = Toast.Style.Success;
      toast.title = "Due date updated";
      pop();
      onUpdated();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to update due date";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Due Date" icon={Icon.Calendar} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text={`Set due date for ${issue.key}: ${issue.fields.summary}`} />
      <Form.DatePicker id="newDueDate" title="Due Date" defaultValue={issue.fields.duedate ? new Date(issue.fields.duedate) : undefined} />
    </Form>
  );
}

function ChangeAssigneeForm({
  issue,
  onUpdated,
}: {
  issue: JiraIssue;
  onUpdated: () => void;
}) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: { assignee: string }) {
    setIsSubmitting(true);
    const toast = await showToast({ style: Toast.Style.Animated, title: "Assigning..." });
    try {
      const api = new JiraAPI();
      const results = await api.searchUsers(values.assignee, 10);
      if (!results || results.length === 0) {
        throw new Error("No matching users found");
      }
      let accountId = results[0].accountId;
      if (values.assignee.includes("@")) {
        const exact = results.find((u) => u.emailAddress?.toLowerCase() === values.assignee.toLowerCase());
        if (exact) accountId = exact.accountId;
      }
      await api.assignIssue(issue.key, accountId);
      toast.style = Toast.Style.Success;
      toast.title = "Assignee updated";
      pop();
      onUpdated();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to update assignee";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Assignee" icon={Icon.Person} onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text={`Change assignee for ${issue.key}: ${issue.fields.summary}`} />
      <Form.TextField id="assignee" title="Assignee" placeholder="email@company.com or accountId" />
    </Form>
  );
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const preferences = getPreferenceValues<Preferences>();

  async function fetchIssues() {
    setIsLoading(true);
    try {
      const api = new JiraAPI();
      const issuesData = await api.getMyIssues();
      setIssues(issuesData);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load tasks",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchIssues();
  }, []);

  async function handleMarkAsDone(issue: JiraIssue) {
    const confirmed = await confirmAlert({
      title: "Mark as Done",
      message: `Are you sure you want to mark "${issue.fields.summary}" as done?`,
      primaryAction: {
        title: "Mark as Done",
        style: Alert.ActionStyle.Default,
      },
    });

    if (!confirmed) return;

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Marking as done...",
    });

    try {
      const api = new JiraAPI();
      await api.markAsDone(issue.key);

      toast.style = Toast.Style.Success;
      toast.title = "Task marked as done";
      toast.message = `${issue.key} completed successfully`;

      // Refresh the list
      await fetchIssues();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to mark as done";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    }
  }

  async function handleChangeStatus(
    issue: JiraIssue,
    transitionId: string,
    transitionName: string,
  ) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Changing status...",
    });

    try {
      const api = new JiraAPI();
      await api.transitionIssue(issue.key, transitionId);

      toast.style = Toast.Style.Success;
      toast.title = "Status changed";
      toast.message = `${issue.key} → ${transitionName}`;

      // Refresh the list
      await fetchIssues();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to change status";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    }
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return "No due date";

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time parts for accurate comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else if (date < today) {
      const daysOverdue = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );
      return `Overdue by ${daysOverdue} day${daysOverdue > 1 ? "s" : ""}`;
    } else {
      const daysUntil = Math.floor(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return `In ${daysUntil} day${daysUntil > 1 ? "s" : ""}`;
    }
  }

  function getDateIcon(dateString?: string): { icon: Icon; tintColor?: Color } {
    if (!dateString) return { icon: Icon.Calendar };

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date < today) {
      return { icon: Icon.ExclamationMark, tintColor: Color.Red };
    } else if (date.getTime() === today.getTime()) {
      return { icon: Icon.Clock, tintColor: Color.Orange };
    } else {
      return { icon: Icon.Calendar, tintColor: Color.Green };
    }
  }

  function getPriorityIcon(priority?: { name: string }): {
    icon: Icon;
    tintColor?: Color;
  } {
    if (!priority) return { icon: Icon.Minus };

    const priorityName = priority.name.toLowerCase();
    if (priorityName.includes("highest") || priorityName.includes("critical")) {
      return { icon: Icon.ArrowUp, tintColor: Color.Red };
    } else if (priorityName.includes("high")) {
      return { icon: Icon.ArrowUp, tintColor: Color.Orange };
    } else if (priorityName.includes("medium")) {
      return { icon: Icon.Minus, tintColor: Color.Yellow };
    } else if (priorityName.includes("low")) {
      return { icon: Icon.ArrowDown, tintColor: Color.Blue };
    } else if (priorityName.includes("lowest")) {
      return { icon: Icon.ArrowDown, tintColor: Color.SecondaryText };
    }
    return { icon: Icon.Minus };
  }

  function getStatusColor(status?: {
    statusCategory?: { colorName: string };
  }): Color {
    const colorName = status?.statusCategory?.colorName?.toLowerCase();
    switch (colorName) {
      case "green":
        return Color.Green;
      case "yellow":
        return Color.Yellow;
      case "blue":
        return Color.Blue;
      case "red":
        return Color.Red;
      default:
        return Color.SecondaryText;
    }
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search tasks...">
      <List.EmptyView
        title="No Tasks Found"
        description="You don't have any assigned tasks or try adjusting your search"
        icon={Icon.CheckCircle}
      />

      {issues.map((issue) => {
        const dateInfo = getDateIcon(issue.fields.duedate);
        const priorityInfo = getPriorityIcon(issue.fields.priority);

        return (
          <List.Item
            key={issue.id}
            title={issue.fields.summary}
            subtitle={`${issue.key} • ${issue.fields.project.name}`}
            accessories={[
              {
                text: issue.fields.status.name,
                icon: {
                  source: Icon.Circle,
                  tintColor: getStatusColor(issue.fields.status),
                },
              },
              issue.fields.priority
                ? ({
                    text: issue.fields.priority.name,
                    icon: {
                      source: priorityInfo.icon,
                      tintColor: priorityInfo.tintColor,
                    },
                  } as const)
                : ({} as const),
              {
                text: formatDate(issue.fields.duedate),
                icon: { source: dateInfo.icon, tintColor: dateInfo.tintColor },
              },
            ].filter((acc) => Object.keys(acc).length > 0)}
            actions={
              <ActionPanel>
                <ActionPanel.Section title="Quick Actions">
                  <Action
                    title="Open in Jira"
                    icon={Icon.Globe}
                    onAction={() => {
                      open(
                        `https://${preferences.jiraDomain}/browse/${issue.key}`,
                      );
                    }}
                  />
                  <Action
                    title="Mark as Done"
                    icon={Icon.CheckCircle}
                    style={Action.Style.Regular}
                    shortcut={{ modifiers: ["ctrl"], key: "d" }}
                    onAction={() => handleMarkAsDone(issue)}
                  />
                  <ChangeStatusSubmenu
                    issue={issue}
                    onStatusChange={(transitionId, transitionName) =>
                      handleChangeStatus(issue, transitionId, transitionName)
                    }
                  />
                  <Action.Push
                    title="Change Due Date"
                    icon={Icon.Calendar}
                    shortcut={{ modifiers: ["ctrl"], key: "y" }}
                    target={<EditDueDateForm issue={issue} onUpdated={fetchIssues} />}
                  />
                  <Action.Push
                    title="Change Assignee"
                    icon={Icon.Person}
                    shortcut={{ modifiers: ["ctrl"], key: "a" }}
                    target={
                      <ChangeAssigneeForm
                        issue={issue}
                        onUpdated={fetchIssues}
                      />
                    }
                  />
                  <Action.Push
                    title="Add Comment"
                    icon={Icon.Message}
                    shortcut={{ modifiers: ["ctrl"], key: "m" }}
                    target={
                      <AddCommentForm
                        issue={issue}
                        onCommentAdded={fetchIssues}
                      />
                    }
                  />
                  <Action
                    title="Refresh"
                    icon={Icon.ArrowClockwise}
                    shortcut={{ modifiers: ["ctrl"], key: "r" }}
                    onAction={fetchIssues}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section title="Copy">
                  <Action.CopyToClipboard
                    title="Copy Issue Key"
                    content={issue.key}
                    shortcut={{ modifiers: ["ctrl"], key: "c" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Issue URL"
                    content={`https://${preferences.jiraDomain}/browse/${issue.key}`}
                    shortcut={{ modifiers: ["ctrl", "shift"], key: "c" }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
