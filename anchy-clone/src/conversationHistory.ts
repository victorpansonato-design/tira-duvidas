import type { Domain, Histories, course } from "./routing";
export type Entry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  domain?: Domain;
  courseName?: string;
};
export type Pending = {
  kind: "handoff" | "clarify" | "course" | "mixed";
  text: string;
  entryId: string;
};
export type ServiceState = {
  replyPending?: boolean;
  messages: { user: boolean; text: string }[];
  draft: string;
};
export type Conversation = {
  mode?: "voice" | "text";
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  messages: Entry[];
  histories: Histories;
  draft: string;
  domain: Domain;
  pending: Pending | null;
  course: typeof course | null;
  screen: "study" | "institution";
  service: ServiceState;
};
export type ConversationStore = {
  items: Conversation[];
  activeId: string | null;
};
export const HISTORY_KEY = "tiraduvidas.conversations.v1";
export const emptyService = (): ServiceState => ({ messages: [], draft: "" });
export function conversationTitle(
  messages: Entry[],
  service: ServiceState,
  draft = "",
) {
  return (
    messages.find((entry) => entry.role === "user")?.text ||
    service.messages.find((entry) => entry.user)?.text ||
    service.draft.trim() ||
    draft.trim() ||
    "Nova conversa"
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}
export function readConversations(): ConversationStore {
  try {
    const data = JSON.parse(localStorage.getItem(HISTORY_KEY) || "null");
    if (!data || !Array.isArray(data.items))
      return { items: [], activeId: null };
    const items = data.items.filter((item: unknown): item is Conversation => {
      if (!item || typeof item !== "object") return false;
      const c = item as Conversation;
      return (
        typeof c.id === "string" &&
        (c.mode === undefined || c.mode === "voice" || c.mode === "text") &&
        typeof c.title === "string" &&
        Number.isFinite(c.createdAt) &&
        Number.isFinite(c.updatedAt) &&
        Array.isArray(c.messages) &&
        c.messages.every(
          (m) =>
            m &&
            typeof m.id === "string" &&
            typeof m.text === "string" &&
            (m.role === "user" || m.role === "assistant"),
        ) &&
        Array.isArray(c.service?.messages) &&
        c.service.messages.every(
          (m) => m && typeof m.user === "boolean" && typeof m.text === "string",
        ) &&
        typeof c.service.draft === "string" &&
        (c.service.replyPending === undefined ||
          typeof c.service.replyPending === "boolean") &&
        typeof c.draft === "string" &&
        c.histories &&
        typeof c.histories === "object" &&
        Object.values(c.histories).every(
          (turns) =>
            Array.isArray(turns) &&
            turns.every(
              (t) =>
                t &&
                typeof t.text === "string" &&
                (t.role === "user" || t.role === "assistant"),
            ),
        ) &&
        (c.domain === "study" || c.domain === "institution") &&
        (c.screen === "study" || c.screen === "institution") &&
        (c.course === null ||
          (typeof c.course?.id === "string" &&
            typeof c.course?.name === "string")) &&
        (c.pending === null ||
          (typeof c.pending?.text === "string" &&
            typeof c.pending.entryId === "string" &&
            ["handoff", "clarify", "course", "mixed"].includes(c.pending.kind)))
      );
    });
    return {
      items,
      activeId: typeof data.activeId === "string" ? data.activeId : null,
    };
  } catch {
    return { items: [], activeId: null };
  }
}
export function upsertConversation(
  items: Conversation[],
  record: Conversation,
): Conversation[] {
  if (
    !record.messages.length &&
    !record.draft.trim() &&
    !record.service.messages.length &&
    !record.service.draft.trim()
  )
    return items;
  return [record, ...items.filter((item) => item.id !== record.id)].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}
export function writeConversations(store: ConversationStore): boolean {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
