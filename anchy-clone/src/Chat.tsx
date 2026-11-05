import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  Copy,
  Mic,
  RotateCcw,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { discipline, disclaimer, Owl, useMobile } from "./ui";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: string;
};
type Conversation = {
  messages: Message[];
  busy: boolean;
  send: (text: string) => void;
  clear: () => void;
  undo: () => void;
  deleted: boolean;
};
const ConversationContext = createContext<Conversation>(null!);
const observedAnswer =
  "Olá! Que ótimo que você trouxe essa dúvida, pois ela é o ponto de partida de tudo o que vamos construir por aqui.\n\nPara começarmos a pensar juntos, imagine uma situação do dia a dia em que você precisou defender uma ideia ou dizer algo difícil para alguém. Em vez de ser agressivo ou, pelo contrário, ficar em silêncio por receio da reação do outro, você conseguiu se expressar com equilíbrio e respeito.\n\nPensando nisso, o que você acha que diferencia uma conversa assim daquelas em que surgem brigas ou mal-entendidos? Como você definiria essa forma de se posicionar?";
function response(text: string) {
  if (/prova|gabarito/i.test(text))
    return "Olá! Eu não posso te dar as respostas prontas da sua prova, pois o meu papel é ajudar você a desenvolver o seu próprio aprendizado.\n\nQual é o tema ou a questão específica que você está tentando resolver? Me conte o que você já pensou sobre o assunto para construirmos esse raciocínio juntos!";
  if (/hebraico|futebol|receita/i.test(text))
    return "Isso não faz parte da nossa disciplina, portanto vamos focar no estudo de Comunicação e Assertividade.";
  return observedAnswer;
}
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [backup, setBackup] = useState<Message[] | null>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (pending.current) clearTimeout(pending.current);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );
  const send = (text: string) => {
    if (busy || !text.trim()) return;
    const time = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((v) => [
      ...v,
      { id: Date.now(), role: "user", text: text.trim(), time },
    ]);
    setBackup(null);
    setBusy(true);
    pending.current = setTimeout(() => {
      setMessages((v) => [
        ...v,
        { id: Date.now(), role: "assistant", text: response(text), time },
      ]);
      setBusy(false);
    }, 1100);
  };
  const clear = () => {
    if (pending.current) clearTimeout(pending.current);
    setBusy(false);
    setBackup(messages);
    setMessages([]);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setBackup(null), 6500);
  };
  const undo = () => {
    if (backup) setMessages(backup);
    setBackup(null);
  };
  return (
    <ConversationContext.Provider
      value={{ messages, busy, send, clear, undo, deleted: backup !== null }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
export function Chat({
  onVoice,
  draft,
  setDraft,
}: {
  onVoice: () => void;
  draft: string;
  setDraft: (value: string) => void;
}) {
  const { messages, busy, send, clear, undo, deleted } =
    useContext(ConversationContext);
  const scroll = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const empty = messages.length === 0 && !busy;
  const mobile = useMobile();
  useEffect(() => {
    scroll.current?.scrollTo({
      top: scroll.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);
  useEffect(() => {
    if (draft) input.current?.focus();
  }, [draft]);
  const submit = () => {
    if (!draft.trim() || busy) return;
    send(draft);
    setDraft("");
    if (input.current) input.current.style.height = "auto";
  };
  return (
    <div className="relative h-full min-h-0 flex flex-col rounded-panel lg:bg-surface-2 lg:px-6 lg:pt-5 lg:pb-4">
      <div className="h-11 flex justify-end w-full shrink-0">
        {messages.length ? (
          <button
            type="button"
            onClick={clear}
            className="h-11 px-3 flex items-center gap-2 rounded-full text-[15px] font-bold text-ink hover:bg-surface transition-colors"
          >
            <RotateCcw size={16} />
            <span className="lg:hidden">Limpar</span>
            <span className="hidden lg:inline">Limpar conversa</span>
          </button>
        ) : null}
      </div>
      <div
        ref={scroll}
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col"
      >
        <div className="mt-auto max-w-[720px] w-full mx-auto flex flex-col gap-5 py-3">
          {empty ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center gap-3 py-8"
            >
              <Owl alt="" className="w-20 h-20" />
              <p className="text-lg font-bold text-ink">Qual é a sua dúvida?</p>
              <p className="text-base text-ink-muted max-w-sm">
                Escreva abaixo e a Anchy responde com o material da disciplina.
              </p>
            </motion.div>
          ) : null}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {busy ? (
            <div
              role="status"
              aria-label="Anchy está respondendo"
              className="flex items-start gap-3"
            >
              <Owl alt="" className="w-8 h-8 lg:w-10 lg:h-10" />
              <div className="bg-surface rounded-[20px_20px_20px_6px] px-5 py-4 flex gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="relative max-w-[720px] w-full mx-auto shrink-0 pt-2">
        <div className="flex items-end gap-2 bg-surface border border-line rounded-[30px] min-h-14 lg:min-h-[60px] pl-5 pr-1.5 py-1.5 focus-within:border-link transition-colors">
          <label htmlFor="anchy-compositor" className="sr-only">
            Sua dúvida
          </label>
          <textarea
            ref={input}
            id="anchy-compositor"
            rows={1}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              event.target.style.height = "auto";
              event.target.style.height =
                Math.min(event.target.scrollHeight, 160) + "px";
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={
              mobile
                ? "Escreva sua dúvida…"
                : "Escreva sua dúvida sobre a disciplina…"
            }
            className="composer-input no-scrollbar flex-1 min-w-0 self-center bg-transparent border-none outline-none resize-none text-base text-ink placeholder:text-ink-muted py-2.5 leading-relaxed"
            style={{ maxHeight: 160 }}
          />
          <button
            type="button"
            aria-label="Voltar para o modo voz"
            onClick={onVoice}
            className="w-11 h-11 shrink-0 rounded-full bg-surface-2 text-ink flex items-center justify-center hover:bg-line transition-colors"
          >
            <Mic size={20} />
          </button>
          <button
            type="button"
            aria-label="Enviar"
            disabled={!draft.trim() || busy}
            onClick={submit}
            className="w-11 h-11 shrink-0 rounded-full bg-anchy-blue text-on-blue flex items-center justify-center disabled:opacity-50 transition-opacity"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="hidden lg:block text-center text-[13px] text-ink-muted mt-2">
          {disclaimer}
        </p>
      </div>
      <div aria-hidden="true" className={empty ? "flex-1" : undefined} />
      <AnimatePresence>
        {deleted ? (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="absolute bottom-0 lg:bottom-4 inset-x-0 lg:inset-x-6 mx-auto max-w-[720px] z-10 flex items-center justify-between gap-3 rounded-[20px] bg-ink text-surface pl-5 pr-2 py-2"
          >
            <span className="text-base">Conversa apagada.</span>
            <button
              type="button"
              onClick={undo}
              className="h-11 px-5 rounded-2xl bg-anchy-yellow text-on-yellow font-bold text-base"
            >
              Desfazer
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
function MessageBubble({ message }: { message: Message }) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);
  const actionClass =
    "w-11 h-11 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface hover:text-ink transition-colors";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {message.role === "user" ? (
        <div className="flex flex-col items-end">
          <div className="bg-anchy-blue text-on-blue rounded-[20px_20px_6px_20px] px-4 py-3 whitespace-pre-wrap break-words max-w-[78%] text-base lg:px-5">
            {message.text}
          </div>
          <span className="text-[13px] text-ink-muted mt-1">
            {message.time}
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-3 max-w-full">
          <Owl alt="" className="w-8 h-8 mt-1 lg:w-10 lg:h-10" />
          <div className="min-w-0 flex-1">
            <div className="bg-surface text-ink rounded-[20px_20px_20px_6px] px-4 py-3.5 text-base lg:px-5 lg:py-4">
              {message.text.split("\n\n").map((p, i) => (
                <p key={i} className="message-paragraph">
                  {p}
                </p>
              ))}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center">
                <button
                  type="button"
                  aria-label={copied ? "Resposta copiada" : "Copiar resposta"}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(message.text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {
                      setCopied(false);
                    }
                  }}
                  className={actionClass}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button
                  type="button"
                  aria-label="Boa resposta"
                  aria-pressed={feedback === "up"}
                  onClick={() => setFeedback(feedback === "up" ? null : "up")}
                  className={
                    actionClass + (feedback === "up" ? " feedback-active" : "")
                  }
                >
                  <ThumbsUp size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Resposta ruim"
                  aria-pressed={feedback === "down"}
                  onClick={() =>
                    setFeedback(feedback === "down" ? null : "down")
                  }
                  className={
                    actionClass +
                    (feedback === "down" ? " feedback-active" : "")
                  }
                >
                  <ThumbsDown size={16} />
                </button>
              </div>
              <span className="text-[13px] text-ink-muted">{message.time}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
export function Voice() {
  const [listening, setListening] = useState(false);
  const greeting = (
    <div>
      <p className="text-sm font-bold mb-1.5 text-link">Anchy</p>
      <p className="text-base lg:text-[24px] leading-snug font-medium text-ink">
        Oi! Sou a Anchy. Toque no microfone e me pergunte o que quiser sobre{" "}
        {discipline}.
      </p>
      <p className="hidden lg:block mt-4 text-[13px] text-ink-muted">
        {disclaimer}
      </p>
    </div>
  );
  return (
    <div className="h-full min-h-0 rounded-panel bg-surface p-6 lg:p-10 flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-10 overflow-y-auto no-scrollbar">
      <div className="flex flex-col items-center text-center gap-4 lg:gap-5 lg:min-h-full">
        <div className="relative flex items-center justify-center w-[120px] h-[120px] lg:w-[220px] lg:h-[220px]">
          <span className="absolute inset-0 rounded-full bg-soft" />
          <Owl className="relative w-24 h-24 lg:w-[180px] lg:h-[180px]" />
        </div>
        <div
          aria-live="polite"
          className="h-7 flex items-center justify-center"
        >
          {listening ? (
            <span className="text-sm text-link">Ouvindo…</span>
          ) : null}
        </div>
        <div className="lg:hidden w-full text-center">{greeting}</div>
        <div className="flex-1" />
        <div className="relative flex flex-col items-center">
          <div className="relative flex items-center justify-center w-[156px] h-[156px] lg:w-[168px] lg:h-[168px]">
            {listening ? <span className="voice-pulse" /> : null}
            <button
              type="button"
              aria-label={listening ? "Parar de falar" : "Falar com a Anchy"}
              aria-pressed={listening}
              onClick={() => setListening((v) => !v)}
              className="relative z-10 rounded-full flex items-center justify-center w-[84px] h-[84px] lg:w-24 lg:h-24 transition-[background-color,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link bg-anchy-blue text-on-blue"
              style={{
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <Mic className="w-8 h-8" />
            </button>
          </div>
          <div
            aria-hidden="true"
            className={
              "h-8 flex items-center justify-center gap-1 " +
              (listening ? "" : "invisible")
            }
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className="voice-bar"
                style={{ animationDelay: `${n * 0.09}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-ink-muted max-w-[200px] mt-1">
            {listening ? "Toque para parar" : "Toque para falar"}
          </p>
        </div>
      </div>
      <div className="hidden lg:block min-w-0 pt-4">{greeting}</div>
    </div>
  );
}
export function ToolChat({
  onClose,
  tool,
  draft,
  setDraft,
}: {
  onClose: () => void;
  tool: string;
  draft: string;
  setDraft: (text: string) => void;
}) {
  const { messages, busy, send } = useContext(ConversationContext);
  const input = useRef<HTMLTextAreaElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (draft) input.current?.focus();
  }, [draft]);
  useEffect(() => {
    scroll.current?.scrollTo({
      top: scroll.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);
  const submit = () => {
    if (!draft.trim() || busy) return;
    send(draft);
    setDraft("");
  };
  return (
    <section
      aria-label="Conversa com a Anchy"
      className="flex flex-col bg-surface min-h-0 overflow-hidden fixed inset-x-0 bottom-0 z-[65] h-[75dvh] rounded-t-[24px] shadow-[var(--shadow-sheet)] lg:static lg:z-auto lg:h-auto lg:w-[420px] lg:shrink-0 lg:rounded-panel lg:shadow-none"
    >
      <span className="lg:hidden mx-auto mt-3 w-10 h-1 rounded-full bg-line shrink-0" />
      <header className="shrink-0 flex items-center gap-3 px-5 pt-3 pb-4 lg:px-7 lg:pt-6 border-b border-line">
        <Owl alt="" style={{ width: 32, height: 32 }} />
        <div className="flex-1 min-w-0">
          <h2 className="text-[22px] font-bold leading-tight text-ink">
            Anchy
          </h2>
          <p className="text-sm text-ink-muted truncate">
            Tire dúvidas sem sair{" "}
            {tool === "mindmap"
              ? "do mapa mental"
              : tool === "quiz"
                ? "do quiz"
                : "dos flashcards"}
          </p>
        </div>
        <button
          type="button"
          aria-label="Voltar ao Caderno"
          onClick={onClose}
          className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink hover:bg-surface-2"
        >
          <X size={20} />
        </button>
      </header>
      <div
        ref={scroll}
        className="relative flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col bg-surface-2"
      >
        <div className="mt-auto flex flex-col gap-4 px-4 py-4 lg:px-5">
          {!messages.length ? (
            <p className="py-6 text-center text-[15px] text-ink-muted">
              Pergunte sobre o que está estudando. A Anchy responde com o
              material da disciplina.
            </p>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {busy ? (
            <p role="status" className="text-ink-muted">
              …
            </p>
          ) : null}
        </div>
      </div>
      <div className="shrink-0 px-4 pt-3 pb-4 lg:px-5 bg-surface-2">
        <div className="flex items-end gap-2 bg-surface border border-line rounded-[28px] min-h-[52px] pl-4 pr-1.5 py-1 focus-within:border-link transition-colors">
          <label htmlFor="anchy-painel-campo" className="sr-only">
            Sua dúvida
          </label>
          <textarea
            ref={input}
            id="anchy-painel-campo"
            rows={1}
            placeholder="Escreva sua dúvida…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            className="no-scrollbar flex-1 min-w-0 self-center bg-transparent border-none outline-none resize-none text-[15px] text-ink placeholder:text-ink-muted py-2.5 leading-relaxed"
            style={{ maxHeight: 140, height: 44 }}
          />
          <button
            type="button"
            aria-label="Enviar"
            disabled={!draft.trim() || busy}
            onClick={submit}
            className="w-11 h-11 shrink-0 rounded-full bg-anchy-blue text-on-blue flex items-center justify-center disabled:opacity-50 transition-opacity"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
