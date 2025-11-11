import { getPreferenceValues } from "@raycast/api";
import { getJiraCredentials } from "./utils/preferences";
import { ensureJiraDueDate } from "./utils/date";

interface Preferences {
  jiraDomain: string;
  email: string;
  apiToken: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

interface JiraPriority {
  id: string;
  name: string;
  iconUrl?: string;
}

interface JiraIssueType {
  id: string;
  name: string;
  subtask: boolean;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
      statusCategory?: {
        name: string;
        colorName: string;
      };
    };
    priority?: {
      name: string;
      iconUrl?: string;
    };
    project: {
      name: string;
      key: string;
    };
    duedate?: string;
    labels: string[];
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    created: string;
    updated: string;
  };
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
    statusCategory?: {
      name: string;
      colorName: string;
    };
  };
}

export interface JiraUserSummary {
  accountId: string;
  displayName: string;
  emailAddress?: string;
}

interface CreateIssuePayload {
  fields: {
    project: {
      key: string;
    };
    summary: string;
    description: string;
    issuetype: {
      name: string;
    };
    duedate?: string;
    priority?: {
      id: string;
    };
    labels?: string[];
    assignee?: {
      accountId?: string;
    };
  };
}

export class JiraAPI {
  private domain: string;
  private authHeader: string;

  constructor() {
    const { jiraDomain, email, apiToken } = getJiraCredentials();

    if (!jiraDomain || !email || !apiToken) {
      throw new Error(
        "Jira credentials not configured. Please set them in Raycast preferences or as environment variables (JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN).",
      );
    }

    this.domain = jiraDomain;
    const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
    this.authHeader = `Basic ${auth}`;
  }

  private getBaseUrl(version: number = 3): string {
    return `https://${this.domain}/rest/api/${version}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    apiVersion: number = 3,
  ): Promise<T> {
    const url = `${this.getBaseUrl(apiVersion)}${endpoint}`;
    console.log(`Making request to: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API Error - URL: ${url}, Status: ${response.status}, Response: ${errorText}`,
      );
      throw new Error(
        `Jira API error (${response.status}) at ${endpoint}: ${errorText}`,
      );
    }

    // Handle empty responses (204 No Content, etc.)
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    // If no content or content-length is 0, return empty object
    if (
      response.status === 204 ||
      contentLength === "0" ||
      !contentType?.includes("application/json")
    ) {
      return {} as T;
    }

    // Try to parse JSON, but handle empty responses gracefully
    const text = await response.text();
    if (!text || text.trim() === "") {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  async getProjects(): Promise<JiraProject[]> {
    // Try API v2 first as it's more stable for project listing
    try {
      const response = await this.request<JiraProject[]>("/project", {}, 2);
      return response;
    } catch (error) {
      console.error("Failed with API v2, trying v3:", error);
      // Fallback to v3
      const response = await this.request<JiraProject[]>("/project", {}, 3);
      return response;
    }
  }

  async getPriorities(): Promise<JiraPriority[]> {
    const response = await this.request<JiraPriority[]>("/priority", {}, 2);
    return response;
  }

  async getIssueTypes(projectKey: string): Promise<JiraIssueType[]> {
    const response = await this.request<{ issueTypes: JiraIssueType[] }>(
      `/project/${projectKey}`,
      {},
      2,
    );
    return response.issueTypes.filter((type) => !type.subtask);
  }

  async createIssue(data: {
    projectKey: string;
    summary: string;
    description: string;
    issueType: string;
    dueDate?: string;
    priorityId?: string;
    labels?: string[];
    assigneeInput?: string;
  }): Promise<JiraIssue> {
    const payload: CreateIssuePayload = {
      fields: {
        project: {
          key: data.projectKey,
        },
        summary: data.summary,
        description: data.description,
        issuetype: {
          name: data.issueType,
        },
      },
    };

    if (data.dueDate) {
      payload.fields.duedate = ensureJiraDueDate(data.dueDate);
    }

    if (data.priorityId) {
      payload.fields.priority = {
        id: data.priorityId,
      };
    }

    if (data.labels && data.labels.length > 0) {
      payload.fields.labels = data.labels;
    }

    const response = await this.request<JiraIssue>(
      "/issue",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      2,
    );

    // Some Jira Cloud setups ignore due date at creation; enforce if provided
    if (data.dueDate) {
      try {
        await this.updateIssueDueDate(response.key, data.dueDate);
      } catch (e) {
        console.warn("Failed to enforce duedate after create:", e);
      }
    }

    // Assign after creation if an assignee input was provided
    if (data.assigneeInput && data.assigneeInput.trim().length > 0) {
      try {
        const accountId = await this.resolveAccountId(data.assigneeInput.trim());
        if (accountId) {
          await this.assignIssue(response.key, accountId);
        }
      } catch (e) {
        console.warn("Failed to assign after create:", e);
      }
    }

    return response;
  }

  async getMyIssues(): Promise<JiraIssue[]> {
    const jql =
      "assignee = currentUser() AND resolution = Unresolved ORDER BY duedate ASC";
    // Use the new /search/jql endpoint (API v3)
    const response = await this.request<{ issues: JiraIssue[] }>(
      `/search/jql?jql=${encodeURIComponent(jql)}&fields=summary,description,status,priority,project,duedate,labels,assignee,created,updated`,
      {},
      3,
    );
    return response.issues;
  }

  async getProjectIssues(projectKey: string): Promise<JiraIssue[]> {
    const jql = `project = ${projectKey} AND resolution = Unresolved ORDER BY duedate ASC, created DESC`;
    // Use the new /search/jql endpoint (API v3)
    const response = await this.request<{ issues: JiraIssue[] }>(
      `/search/jql?jql=${encodeURIComponent(jql)}&fields=summary,description,status,priority,project,duedate,labels,assignee,created,updated`,
      {},
      3,
    );
    return response.issues;
  }

  async getExistingLabels(projectKey: string): Promise<string[]> {
    // Search for issues in the project to get labels
    const jql = `project = ${projectKey}`;
    try {
      // Use the new /search/jql endpoint (API v3)
      const response = await this.request<{ issues: JiraIssue[] }>(
        `/search/jql?jql=${encodeURIComponent(jql)}&fields=labels&maxResults=100`,
        {},
        3,
      );

      const labelsSet = new Set<string>();
      response.issues.forEach((issue) => {
        issue.fields.labels?.forEach((label) => labelsSet.add(label));
      });

      return Array.from(labelsSet).sort();
    } catch (error) {
      console.error("Error fetching labels:", error);
      return [];
    }
  }

  async getTransitions(issueKey: string): Promise<JiraTransition[]> {
    const response = await this.request<{ transitions: JiraTransition[] }>(
      `/issue/${issueKey}/transitions`,
      {},
      3,
    );
    return response.transitions;
  }

  async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    await this.request<void>(
      `/issue/${issueKey}/transitions`,
      {
        method: "POST",
        body: JSON.stringify({
          transition: {
            id: transitionId,
          },
        }),
      },
      3,
    );
  }

  async markAsDone(issueKey: string): Promise<void> {
    // Get available transitions
    const transitions = await this.getTransitions(issueKey);

    // Look for a "Done" or "Complete" transition
    const doneTransition = transitions.find(
      (t) =>
        t.name.toLowerCase().includes("done") ||
        t.name.toLowerCase().includes("complete") ||
        t.to.name.toLowerCase().includes("done") ||
        t.to.name.toLowerCase().includes("complete"),
    );

    if (doneTransition) {
      await this.transitionIssue(issueKey, doneTransition.id);
    } else {
      throw new Error(
        `No "Done" transition available for ${issueKey}. Available transitions: ${transitions.map((t) => t.name).join(", ")}`,
      );
    }
  }

  async addComment(issueKey: string, comment: string): Promise<void> {
    await this.request<void>(
      `/issue/${issueKey}/comment`,
      {
        method: "POST",
        body: JSON.stringify({
          body: comment,
        }),
      },
      3,
    );
  }

  private async resolveAccountId(input: string): Promise<string | undefined> {
    // If it already looks like an accountId, allow directly
    if (input && !input.includes("@") && input.length > 16) {
      return input;
    }

    try {
      const results = await this.request<Array<JiraUserSummary>>(
        `/user/search?query=${encodeURIComponent(input)}&maxResults=10`,
        {},
        3,
      );

      if (!results || results.length === 0) return undefined;

      if (input.includes("@")) {
        const exact = results.find((u) => u.emailAddress?.toLowerCase() === input.toLowerCase());
        if (exact) return exact.accountId;
      }

      return results[0].accountId;
    } catch (error) {
      console.error("Failed to resolve accountId:", error);
      return undefined;
    }
  }

  async assignIssue(issueKey: string, accountId: string): Promise<void> {
    await this.request<void>(
      `/issue/${issueKey}/assignee`,
      {
        method: "PUT",
        body: JSON.stringify({ accountId }),
      },
      3,
    );
  }

  async updateIssueDueDate(issueKey: string, duedate: string): Promise<void> {
    await this.request<void>(
      `/issue/${issueKey}`,
      {
        method: "PUT",
        body: JSON.stringify({ fields: { duedate: ensureJiraDueDate(duedate) } }),
      },
      3,
    );
  }

  async searchUsers(query: string, maxResults: number = 10): Promise<JiraUserSummary[]> {
    return await this.request<Array<JiraUserSummary>>(
      `/user/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}`,
      {},
      3,
    );
  }
}
