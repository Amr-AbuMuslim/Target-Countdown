import { type CountdownData, type CountdownEntry } from "../types";

const COUNTDOWN_KEY = "countdownData";
const API_URL =
  "https://api.christmas-vacation-countdown.convivial.site/countdown"; // change to your backend URL

// ---------- Local Storage Helpers ----------
const initializeStorage = async () => {
  if (!localStorage.getItem(COUNTDOWN_KEY)) {
    try {
      console.log("Fetching countdown JSON for localStorage...");
      const res = await fetch("/data/CountdownData.json");
      const data: CountdownData = await res.json();
      localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to initialize localStorage:", err);
      const fallback: CountdownData = { targetNights: 700, entries: [] };
      localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(fallback));
    }
  }
};

const getLocalData = async (): Promise<CountdownData> => {
  await initializeStorage();
  const data = localStorage.getItem(COUNTDOWN_KEY);
  return data ? JSON.parse(data) : { targetNights: 700, entries: [] };
};

const saveLocalData = async (data: CountdownData) => {
  localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(data));
};

// ---------- Backend API Helpers ----------
const getBackendData = async (): Promise<CountdownData> => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Failed to fetch API: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching from backend:", err);
    return getLocalData(); // fallback to localStorage if backend fails
  }
};

const postBackendEntry = async (
  entry: Omit<CountdownEntry, "id" | "createdAt">
): Promise<CountdownEntry> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error(`Failed to POST entry: ${res.status}`);
  return await res.json();
};

// ---------- CRUD Operations ----------
export const getCountdownData = async (): Promise<CountdownData> => {
  const [localData, backendData] = await Promise.all([
    getLocalData(),
    getBackendData(),
  ]);

  // Optionally merge backend + local if needed
  return backendData.entries.length ? backendData : localData;
};

export const addCountdownEntry = async (
  entry: Omit<CountdownEntry, "id" | "createdAt">
): Promise<CountdownData> => {
  const newEntry = await postBackendEntry(entry);

  const localData = await getLocalData();
  localData.entries.push(newEntry);
  await saveLocalData(localData);

  return localData;
};

export const updateCountdownEntry = async (
  id: string,
  updates: Partial<CountdownEntry>
): Promise<CountdownData> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok)
      throw new Error(`Failed to update backend entry: ${res.status}`);
    const updatedEntry: CountdownEntry = await res.json();

    const localData = await getLocalData();
    const index = localData.entries.findIndex((e) => e.id === id);
    if (index !== -1) localData.entries[index] = updatedEntry;
    await saveLocalData(localData);

    return localData;
  } catch (err) {
    console.error(err);
    return getLocalData();
  }
};

export const deleteCountdownEntry = async (
  id: string
): Promise<CountdownData> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok)
      throw new Error(`Failed to delete backend entry: ${res.status}`);

    const localData = await getLocalData();
    localData.entries = localData.entries.filter((e) => e.id !== id);
    await saveLocalData(localData);

    return localData;
  } catch (err) {
    console.error(err);
    const localData = await getLocalData();
    localData.entries = localData.entries.filter((e) => e.id !== id);
    await saveLocalData(localData);
    return localData;
  }
};
