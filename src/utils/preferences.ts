import { getPreferenceValues, LocalStorage } from "@raycast/api";

interface Credentials {
  jiraDomain: string;
  email: string;
  apiToken: string;
}

const LAST_USED_PROJECT_KEY = "last_used_project";

export function getJiraCredentials(): Credentials {
  const prefs = getPreferenceValues<{ jiraDomain?: string; email?: string; apiToken?: string }>();

  const jiraDomain =
    (prefs.jiraDomain || process.env.JIRA_DOMAIN || "").trim().replace(/^https?:\/\//i, "");
  const email = (prefs.email || process.env.JIRA_EMAIL || "").trim();
  const apiToken = (prefs.apiToken || process.env.JIRA_API_TOKEN || "").trim();

  return {
    jiraDomain,
    email,
    apiToken,
  };
}

export async function getLastUsedProject(): Promise<string | undefined> {
  const value = await LocalStorage.getItem<string>(LAST_USED_PROJECT_KEY);
  return value || undefined;
}

export async function setLastUsedProject(projectKey: string): Promise<void> {
  if (!projectKey) return;
  await LocalStorage.setItem(LAST_USED_PROJECT_KEY, projectKey);
}


