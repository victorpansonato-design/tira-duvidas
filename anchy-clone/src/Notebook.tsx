import { useEffect } from "react";
import {
  Share2,
  CircleHelp,
  SquareStack,
  ChevronRight,
  FileText,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Tool } from "./ui";

export const sources = [
  "Conteúdo Digital - Unidade 1",
  "Conteúdo Digital - Unidade 2",
  "Conteúdo Digital - Unidade 3",
  "E-book da Disciplina",
];
const tools = [
  {
    id: "mindmap",
    title: "Mapa mental",
    desc: "Os tópicos da disciplina num mapa que você explora e exporta.",
    Icon: Share2,
  },
  {
    id: "quiz",
    title: "Quiz",
    desc: "Questões A–E com correção comentada. Você escolhe quantidade e nível.",
    Icon: CircleHelp,
  },
  {
    id: "cards",
    title: "Flashcards",
    desc: "Vire o cartão, diga se acertou e acompanhe seu desempenho.",
    Icon: SquareStack,
  },
] as const;
export function Notebook({
  active,
  onTool,
  sourceLabel = "Fontes que a Anchy consulta",
}: {
  sourceLabel?: string;
  active: Tool | null;
  onTool: (tool: Tool) => void;
}) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <h2 className="text-[22px] font-bold text-ink mb-4">
        Caderno da disciplina
      </h2>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <h3 className="text-[15px] font-semibold text-ink-muted mb-1">
          Ferramentas de estudo
        </h3>
        <ul className="mb-6">
          {tools.map(({ id, title, desc, Icon }) => (
            <li
              key={id}
              className={
                "border-b " + (active ? "border-transparent" : "border-line")
              }
            >
              <button
                type="button"
                aria-current={active === id ? "page" : undefined}
                onClick={() => onTool(id)}
                className={
                  "relative w-full min-h-11 flex items-center gap-3 py-3.5 text-left transition-colors " +
                  (active === id
                    ? "rounded-2xl px-3"
                    : "rounded-lg hover:bg-surface-2") +
                  (active && active !== id ? " px-3" : "")
                }
              >
                {active === id ? (
                  <motion.span
                    layoutId="notebook-active"
                    className="absolute inset-0 rounded-2xl bg-soft"
                  />
                ) : null}
                <Icon className="relative w-6 h-6 shrink-0 text-link p-0.5" />
                <span className="relative flex-1 min-w-0">
                  <span
                    className={
                      "block text-base font-bold " +
                      (active === id ? "text-link" : "text-ink")
                    }
                  >
                    {title}
                  </span>
                  <span className="block text-sm text-ink-muted leading-snug">
                    {desc}
                  </span>
                </span>
                {active === id ? null : (
                  <ChevronRight className="relative w-4 h-4 shrink-0 text-ink-muted" />
                )}
              </button>
            </li>
          ))}
        </ul>
        <h3 className="text-[15px] font-semibold text-ink-muted mb-3">
          {sourceLabel}
        </h3>
        <ul className="space-y-2.5">
          {sources.map((source) => (
            <li
              key={source}
              className="flex items-center gap-3 text-base text-ink"
            >
              <FileText className="w-[18px] h-[18px] shrink-0 text-ink-muted" />
              <span className="min-w-0 truncate">{source}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 shrink-0 flex items-center gap-2.5 rounded-2xl bg-page px-4 py-3 text-sm text-ink-muted">
        <span className="w-2 h-2 rounded-full shrink-0 bg-ok" />
        Contexto ativo · 4 materiais da disciplina
      </div>
    </div>
  );
}
export function NotebookSheet({
  open,
  setOpen,
  active,
  onTool,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  active: Tool | null;
  onTool: (tool: Tool) => void;
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [setOpen]);
  return (
    <div className="lg:hidden">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
          />
        ) : null}
      </AnimatePresence>
      <motion.section
        aria-label="Caderno da disciplina"
        animate={{ height: open ? "85dvh" : 92 }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-surface rounded-t-[24px] shadow-[var(--shadow-sheet)] overflow-hidden"
      >
        <motion.button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          onPanEnd={(_, info) => {
            if (Math.abs(info.offset.y) > 30) setOpen(info.offset.y < 0);
          }}
          className="shrink-0 h-[92px] w-full px-5 pt-3 text-left"
          style={{ touchAction: "none" }}
        >
          <span className="block mx-auto w-10 h-1 rounded-full bg-line mb-3" />
          <span className="flex items-center gap-3">
            <span className="flex-1 min-w-0">
              <span className="block text-lg font-bold text-ink">
                Caderno da disciplina
              </span>
              <span className="block text-sm text-ink-muted truncate">
                Mapa mental, quiz, flashcards e fontes
              </span>
            </span>
            <span className="flex items-center gap-3 text-link">
              <Share2 />
              <CircleHelp />
              <SquareStack />
            </span>
          </span>
        </motion.button>
        {open ? (
          <div className="px-5 pb-6 flex flex-col min-h-0 flex-1">
            <Notebook active={active} onTool={onTool} />
          </div>
        ) : null}
      </motion.section>
    </div>
  );
}
