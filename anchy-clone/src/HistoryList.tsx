import { useState } from "react";
import {
  BookOpen,
  Building2,
  Check,
  History,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import type { Conversation } from "./conversationHistory";
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
const isService = (item: Conversation) =>
  item.screen === "institution" ||
  (!item.messages.some(
    (message) => message.role === "assistant" && message.domain === "study",
  ) &&
    (item.service.messages.length > 0 || Boolean(item.service.draft)));
const day = (stamp: number) => new Date(stamp).toLocaleDateString("pt-BR");
const group = (stamp: number) => {
  const today = new Date();
  if (day(stamp) === day(+today)) return "Hoje";
  today.setDate(today.getDate() - 1);
  return day(stamp) === day(+today) ? "Ontem" : "Anteriores";
};
export function HistoryList({
  items,
  activeId,
  onSelect,
  onNew,
  error,
}: {
  items: Conversation[];
  activeId: string;
  onSelect: (item: Conversation) => void;
  onNew: () => void;
  error: boolean;
}) {
  const [query, setQuery] = useState("");
  const term = normalize(query.trim());
  const filtered = items.filter(
    (item) =>
      !term ||
      normalize(
        [
          item.title,
          item.course?.name || "",
          ...item.messages.map((m) => m.text),
          ...item.service.messages.map((m) => m.text),
        ].join(" "),
      ).includes(term),
  );
  return (
    <>
      <button type="button" className="td-history-new" onClick={onNew}>
        <Plus size={18} />
        Nova conversa
      </button>
      <div className="td-history-search">
        <Search size={18} />
        <label className="sr-only" htmlFor="td-history-search">
          Buscar conversas
        </label>
        <input
          id="td-history-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar conversas"
        />
      </div>
      <div className="td-history-list">
        {filtered.length ? (
          ["Hoje", "Ontem", "Anteriores"].map((label) => {
            const rows = filtered.filter(
              (item) => group(item.updatedAt) === label,
            );
            return rows.length ? (
              <section key={label} aria-label={label}>
                <h3>{label}</h3>
                {rows.map((item) => (
                  <button
                    type="button"
                    className="td-history-item"
                    key={item.id}
                    aria-current={item.id === activeId ? "page" : undefined}
                    onClick={() => onSelect(item)}
                  >
                    <MessageSquare size={18} />
                    <span>
                      <strong>{item.title}</strong>
                      <span className="td-history-meta">
                        {isService(item) ? (
                          <Building2 size={12} />
                        ) : (
                          <BookOpen size={12} />
                        )}
                        <span>
                          {isService(item)
                            ? "Atendimento da faculdade"
                            : item.course?.name || "Tira-dúvidas"}
                        </span>
                      </span>
                      <time dateTime={new Date(item.updatedAt).toISOString()}>
                        {new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(item.updatedAt)}
                      </time>
                    </span>
                    {item.id === activeId ? <Check size={15} /> : null}
                  </button>
                ))}
              </section>
            ) : null;
          })
        ) : (
          <div className="td-history-empty">
            <History size={28} />
            <h3>
              {term
                ? "Nenhuma conversa encontrada"
                : "Suas conversas ficam aqui"}
            </h3>
            <p>
              {term
                ? "Tente outra palavra ou um trecho da pergunta."
                : "Comece uma conversa para poder retomá-la depois."}
            </p>
          </div>
        )}
      </div>
      {error ? (
        <p className="td-history-error" role="status">
          Não foi possível salvar neste navegador. As conversas desta sessão
          continuam disponíveis aqui.
        </p>
      ) : null}
      <p className="td-history-footnote">Salvo somente neste navegador.</p>
    </>
  );
}
