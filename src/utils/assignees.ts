import { LocalStorage } from "@raycast/api";

type AssigneeFrequencyMap = Record<string, { count: number; label: string }>;

const ASSIGNEE_FREQ_KEY = "assignee-frequency";

export async function getAssigneeFrequencies(): Promise<AssigneeFrequencyMap> {
  try {
    const raw = await LocalStorage.getItem<string>(ASSIGNEE_FREQ_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AssigneeFrequencyMap;
  } catch {
    return {};
  }
}

export async function incrementAssigneeFrequency(id: string, label: string) {
  const map = await getAssigneeFrequencies();
  const entry = map[id];
  map[id] = { count: (entry?.count ?? 0) + 1, label: entry?.label ?? label };
  await LocalStorage.setItem(ASSIGNEE_FREQ_KEY, JSON.stringify(map));
}

export async function ensureAssigneeKnown(id: string, label: string) {
  const map = await getAssigneeFrequencies();
  if (!map[id]) {
    map[id] = { count: 0, label };
    await LocalStorage.setItem(ASSIGNEE_FREQ_KEY, JSON.stringify(map));
  }
}


