import { LocalStorage } from "@raycast/api";

interface AssigneeFrequencyEntry {
  label: string;
  count: number;
}

type AssigneeFrequencyMap = Record<string, AssigneeFrequencyEntry>;

const STORAGE_KEY = "assignee_frequencies";

async function readMap(): Promise<AssigneeFrequencyMap> {
  const raw = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as AssigneeFrequencyMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeMap(map: AssigneeFrequencyMap): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function getAssigneeFrequencies(): Promise<AssigneeFrequencyMap> {
  return await readMap();
}

export async function incrementAssigneeFrequency(id: string, label: string): Promise<void> {
  if (!id) return;
  const map = await readMap();
  const key = id.toLowerCase();
  const current = map[key] || { label, count: 0 };
  map[key] = { label: current.label || label, count: (current.count || 0) + 1 };
  await writeMap(map);
}

export async function ensureAssigneeKnown(id: string, label: string): Promise<void> {
  if (!id) return;
  const map = await readMap();
  const key = id.toLowerCase();
  if (!map[key]) {
    map[key] = { label, count: 0 };
    await writeMap(map);
  }
}


