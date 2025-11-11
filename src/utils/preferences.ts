import { getPreferenceValues, LocalStorage } from "@raycast/api";

/**
 * Return Jira credentials, preferring Raycast preferences and falling back to environment variables on Windows.
 */
export function getJiraCredentials() {
  const preferences = getPreferenceValues<{ jiraDomain?: string; email?: string; apiToken?: string }>();

  const jiraDomain = (preferences.jiraDomain || process.env.JIRA_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const email = preferences.email || process.env.JIRA_EMAIL || "";
  const apiToken = preferences.apiToken || process.env.JIRA_API_TOKEN || "";

  return { jiraDomain, email, apiToken };
}

const LAST_USED_PROJECT_KEY = "last-used-project";

/**
 * Read the last used Jira project key from LocalStorage.
 */
export async function getLastUsedProject(): Promise<string | undefined> {
  try {
    return await LocalStorage.getItem<string>(LAST_USED_PROJECT_KEY);
  } catch (error) {
    console.error("Failed to get last used project:", error);
    return undefined;
  }
}

/**
 * Persist the last used Jira project key into LocalStorage.
 */
export async function setLastUsedProject(projectKey: string): Promise<void> {
  try {
    await LocalStorage.setItem(LAST_USED_PROJECT_KEY, projectKey);
  } catch (error) {
    console.error("Failed to set last used project:", error);
  }
}


