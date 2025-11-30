import { type CountdownData, type CountdownEntry } from "../types";

const COUNTDOWN_KEY = "countdownData";

// Initialize localStorage with default data if not exists
const initializeStorage = async () => {
  if (!localStorage.getItem(COUNTDOWN_KEY)) {
    try {
      const res = await fetch("/data/countdownData.json");
      const data = await res.json();
      localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(data));
    } catch (error) {
      const fallback: CountdownData = {
        targetNights: 700,
        entries: [],
      };
      localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(fallback));
    }
  }
};

// Get countdown data
export const getCountdownData = async (): Promise<CountdownData> => {
  await initializeStorage();
  const data = localStorage.getItem(COUNTDOWN_KEY);
  return data ? JSON.parse(data) : { targetNights: 700, entries: [] };
};

// Save data
export const saveCountdownData = async (data: CountdownData): Promise<void> => {
  localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(data));
};

// Add entry
export const addCountdownEntry = async (
  entry: Omit<CountdownEntry, "id" | "createdAt">
): Promise<CountdownData> => {
  const data = await getCountdownData();
  const newEntry: CountdownEntry = {
    ...entry,
    id: `cd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  data.entries.push(newEntry);
  await saveCountdownData(data);
  return data;
};

// Update entry
export const updateCountdownEntry = async (
  id: string,
  updates: Partial<CountdownEntry>
): Promise<CountdownData> => {
  const data = await getCountdownData();
  const index = data.entries.findIndex((e) => e.id === id);

  if (index !== -1) {
    data.entries[index] = { ...data.entries[index], ...updates };
  }

  await saveCountdownData(data);
  return data;
};

// Delete entry
export const deleteCountdownEntry = async (
  id: string
): Promise<CountdownData> => {
  const data = await getCountdownData();
  data.entries = data.entries.filter((e) => e.id !== id);
  await saveCountdownData(data);
  return data;
};
