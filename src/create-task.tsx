import { Form, ActionPanel, Action, showToast, Toast, useNavigation, open, popToRoot, getPreferenceValues } from "@raycast/api";
import { useState, useEffect } from "react";
import { JiraAPI } from "./jira-api";
import { getLastUsedProject, setLastUsedProject } from "./utils/preferences";
import { ensureAssigneeKnown, getAssigneeFrequencies, incrementAssigneeFrequency } from "./utils/assignees";
import { formatDateForJira } from "./utils/date";

interface FormValues {
  title: string;
  description: string;
  project: string;
  issueType: string;
  dueDate?: Date;
  priority?: string;
  labels: string[];
  assignee?: string;
}

interface Project {
  id: string;
  key: string;
  name: string;
}

interface Priority {
  id: string;
  name: string;
}

interface IssueType {
  id: string;
  name: string;
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const api = new JiraAPI();
        const [projectsData, prioritiesData] = await Promise.all([api.getProjects(), api.getPriorities()]);

        setProjects(projectsData);
        setPriorities(prioritiesData);

        // Prefer last used project, then default from preferences, then first project
        const prefs = getPreferenceValues<{ jiraDomain: string; defaultProject?: string }>();
        const lastUsed = await getLastUsedProject();
        const prefKey = (prefs.defaultProject || process.env.JIRA_DEFAULT_PROJECT || process.env.DEFAULT_PROJECT)?.trim();
        const prefMatch = prefKey
          ? (projectsData.find((p) => p.key.toUpperCase() === prefKey.toUpperCase())
            || projectsData.find((p) => p.name.toUpperCase() === prefKey.toUpperCase()))
          : undefined;
        const lastMatch = lastUsed
          ? projectsData.find((p) => p.key.toUpperCase() === lastUsed.toUpperCase())
          : undefined;
        const selected = prefMatch?.key || lastMatch?.key;
        if (selected) {
          setSelectedProject(selected);
          // Persist selection to help other commands default consistently
          await setLastUsedProject(selected);
        } else if (projectsData.length > 0) {
          setSelectedProject(projectsData[0].key);
        }
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to load data",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchProjectData() {
      if (!selectedProject) return;

      try {
        const api = new JiraAPI();
        const [issueTypesData, labelsData, projectIssues, freqMap] = await Promise.all([
          api.getIssueTypes(selectedProject),
          api.getExistingLabels(selectedProject),
          api.getProjectIssues(selectedProject),
          getAssigneeFrequencies(),
        ]);

        setIssueTypes(issueTypesData);
        setLabels(labelsData);

        // Build ranked assignee options from frequencies and project assignees
        const seen = new Map<string, { id: string; title: string; count: number }>();
        // From frequencies first (higher count ranked earlier)
        Object.entries(freqMap).forEach(([id, entry]) => {
          if (!id) return;
          seen.set(id.toLowerCase(), { id, title: entry.label, count: entry.count });
        });
        // From project issues
        projectIssues.forEach((issue) => {
          const email = issue.fields.assignee?.emailAddress;
          const display = issue.fields.assignee?.displayName;
          const key = (email || display || "").toLowerCase();
          if (!key) return;
          if (!seen.has(key)) {
            seen.set(key, { id: email || display!, title: display || email!, count: 0 });
          }
        });
        // Ensure defaultAssignee is present
        const { defaultAssignee } = getPreferenceValues<{ defaultAssignee?: string }>();
        const def = defaultAssignee?.trim();
        if (def && !seen.has(def.toLowerCase())) {
          seen.set(def.toLowerCase(), { id: def, title: def, count: 0 });
        }
        const ranked = Array.from(seen.values()).sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count;
          return a.title.localeCompare(b.title);
        });
        setAssigneeOptions(ranked);
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    }

    fetchProjectData();
  }, [selectedProject]);

  const [assigneeOptions, setAssigneeOptions] = useState<Array<{ id: string; title: string; count?: number }>>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(undefined);

  function handleProjectChange(projectKey: string) {
    setSelectedProject(projectKey);
    setLastUsedProject(projectKey);
  }

  async function handleSubmit(values: FormValues) {
    if (!values.title || !values.project || !values.issueType) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Missing required fields",
        message: "Title, Project, and Issue Type are required",
      });
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Creating task...",
    });

    try {
      const api = new JiraAPI();
      const issue = await api.createIssue({
        projectKey: values.project,
        summary: values.title,
        description: values.description || "",
        issueType: values.issueType,
        dueDate: values.dueDate ? formatDateForJira(values.dueDate) : undefined,
        priorityId: values.priority,
        labels: values.labels,
        assigneeInput: selectedAssignee && selectedAssignee.trim().length > 0
          ? selectedAssignee.trim()
          : (getPreferenceValues<{ defaultAssignee?: string }>().defaultAssignee || undefined),
      });

      // Update frequency for the chosen assignee
      const chosen = selectedAssignee || getPreferenceValues<{ defaultAssignee?: string }>().defaultAssignee || "";
      if (chosen) {
        const label = assigneeOptions.find((o) => o.id.toLowerCase() === chosen.toLowerCase())?.title || chosen;
        await incrementAssigneeFrequency(chosen, label);
      }

      toast.style = Toast.Style.Success;
      toast.title = "Task created successfully";
      toast.message = `${issue.key} - ${values.title}`;
      toast.primaryAction = {
        title: "Open in Jira",
        onAction: () => {
          const prefs = getPreferenceValues<{ jiraDomain: string }>();
          open(`https://${prefs.jiraDomain}/browse/${issue.key}`);
        },
      };

      popToRoot();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to create task";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    }
  }

  const deadlineOptions = [
    { title: "Today", value: "today" },
    { title: "Tomorrow", value: "tomorrow" },
    { title: "In 3 days", value: "3days" },
    { title: "In 1 week", value: "1week" },
    { title: "In 2 weeks", value: "2weeks" },
    { title: "In 1 month", value: "1month" },
    { title: "Custom", value: "custom" },
  ];

  const [deadlineType, setDeadlineType] = useState<string>("1week");

  function getDateFromDeadlineType(type: string): Date | undefined {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for consistency
    
    switch (type) {
      case "today":
        return new Date(today);
      case "tomorrow": {
        const date = new Date(today);
        date.setDate(date.getDate() + 1);
        return date;
      }
      case "3days": {
        const date = new Date(today);
        date.setDate(date.getDate() + 3);
        return date;
      }
      case "1week": {
        const date = new Date(today);
        date.setDate(date.getDate() + 7);
        return date;
      }
      case "2weeks": {
        const date = new Date(today);
        date.setDate(date.getDate() + 14);
        return date;
      }
      case "1month": {
        const date = new Date(today);
        date.setMonth(date.getMonth() + 1);
        return date;
      }
      default:
        return undefined;
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Task"
            onSubmit={(values: FormValues & { customDate?: Date }) => {
              const dueDate = deadlineType === "custom" ? values.customDate : getDateFromDeadlineType(deadlineType);
              handleSubmit({ ...values, dueDate });
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Create a new Jira task with all the details" />

      <Form.TextField id="title" title="Title" placeholder="Enter task title" info="A brief summary of the task" />

      <Form.TextArea
        id="description"
        title="Description"
        placeholder="Enter detailed description"
        info="Detailed description of what needs to be done"
      />

      <Form.Separator />

      <Form.Dropdown
        id="project"
        title="Project"
        value={selectedProject}
        onChange={handleProjectChange}
        info="Select the Jira project for this task"
      >
        {projects.map((project) => (
          <Form.Dropdown.Item key={project.id} value={project.key} title={`${project.name} (${project.key})`} />
        ))}
      </Form.Dropdown>

      <Form.Dropdown id="issueType" title="Issue Type" info="Type of issue to create">
        {issueTypes.map((type) => (
          <Form.Dropdown.Item key={type.id} value={type.name} title={type.name} />
        ))}
      </Form.Dropdown>

      <Form.Separator />

      <Form.Dropdown
        id="deadlineType"
        title="Deadline"
        value={deadlineType}
        onChange={setDeadlineType}
        info="When should this task be completed?"
      >
        {deadlineOptions.map((option) => (
          <Form.Dropdown.Item key={option.value} value={option.value} title={option.title} />
        ))}
      </Form.Dropdown>

      {deadlineType === "custom" && (
        <Form.DatePicker id="customDate" title="Custom Date" info="Select a custom due date" />
      )}

      <Form.Dropdown id="priority" title="Priority" info="Task priority level">
        <Form.Dropdown.Item value="" title="None" />
        {priorities.map((priority) => (
          <Form.Dropdown.Item key={priority.id} value={priority.id} title={priority.name} />
        ))}
      </Form.Dropdown>

      <Form.TagPicker id="labels" title="Labels" info="Add labels to categorize this task">
        {labels.map((label) => (
          <Form.TagPicker.Item key={label} value={label} title={label} />
        ))}
      </Form.TagPicker>

      <Form.Separator />

      <Form.Dropdown
        id="assignee"
        title="Assignee"
        value={selectedAssignee ?? (getPreferenceValues<{ defaultAssignee?: string }>().defaultAssignee || "")}
        onChange={async (val) => {
          setSelectedAssignee(val);
          const label = assigneeOptions.find((o) => o.id.toLowerCase() === val.toLowerCase())?.title || val;
          await ensureAssigneeKnown(val, label);
        }}
        info="Choose the assignee. Ranked by your past selections."
      >
        {assigneeOptions.map((opt) => (
          <Form.Dropdown.Item key={opt.id} value={opt.id} title={opt.title} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
