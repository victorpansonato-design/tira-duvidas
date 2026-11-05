import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  HelpCircle,
  History,
  Mic,
  Square,
  Plus,
  Share2,
  SquareStack,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { Logo, Owl, ThemeButton, ThemeContext } from "./ui";
import type { Tool } from "./ui";
import { classifyQuestion, course, createEnvelope, demoReply } from "./routing";
import type { Domain, Envelope, Histories } from "./routing";
import { sources, Notebook } from "./Notebook";
import { useMedia } from "./useReducedMotion";
import { HistoryList } from "./HistoryList";
import {
  conversationTitle,
  emptyService,
  readConversations,
  upsertConversation,
  writeConversations,
} from "./conversationHistory";
import type {
  Conversation,
  Entry,
  Pending,
  ServiceState,
} from "./conversationHistory";
import { ConversationModeSwitch } from "./ConversationMode";
import type { ConversationMode } from "./ConversationMode";
import { VoiceStage } from "./VoiceStage";
import "./workspace.css";

const Institution = lazy(() =>
  import("./Institution").then((module) => ({ default: module.Institution })),
);
const StudyTools = lazy(() =>
  import("./StudyTools").then((module) => ({ default: module.StudyTools })),
);
const examples = [
  {
    icon: BookOpen,
    title: "Entender um conceito",
    question: "Me explique o que é comunicação assertiva.",
  },
  {
    icon: HelpCircle,
    title: "Revisar para a prova",
    question: "Me ajude a revisar a matéria para a prova.",
  },
  {
    icon: FileText,
    title: "Pedir atestado de matrícula",
    question: "Onde peço meu atestado de matrícula?",
  },
];
export default function Workspace() {
  const [initial] = useState(() => {
    const store = readConversations();
    const active = new URLSearchParams(location.search).has("origem")
      ? null
      : store.items.find((item) => item.id === store.activeId) || null;
    return { store, active };
  });
  const [activeId, setActiveId] = useState(
    () => initial.active?.id || crypto.randomUUID(),
  );
  const [createdAt, setCreatedAt] = useState(
    () => initial.active?.createdAt || Date.now(),
  );
  const [historyItems, setHistoryItems] = useState(initial.store.items);
  const itemsRef = useRef(initial.store.items);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [historyAnchor, setHistoryAnchor] = useState<CSSProperties>({});
  const [screen, setScreen] = useState<"study" | "institution">(
    initial.active?.screen || "study",
  );
  const [service, setService] = useState<ServiceState>(
    () => initial.active?.service || emptyService(),
  );
  const [serviceBusy, setServiceBusy] = useState(false);
  const serviceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobile = useMedia("(max-width:1023px)");
  const systemReduced = useMedia("(prefers-reduced-motion:reduce)");
  const [quiet, setQuiet] = useState(
    () => localStorage.getItem("tiraduvidas.motion") === "reduce",
  );
  const reduced = systemReduced || quiet;
  const [phase, setPhase] = useState(0);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [dark, setDark] = useState(
    () => localStorage.getItem("tiraduvidas.theme.v2") !== "light",
  );
  const [currentCourse, setCurrentCourse] = useState<typeof course | null>(
    () =>
      initial.active
        ? initial.active.course
        : new URLSearchParams(location.search).get("origem") === "app"
          ? null
          : course,
  );
  const [domain, setDomain] = useState<Domain>(
    initial.active?.domain || "study",
  );
  const [messages, setMessages] = useState<Entry[]>(
    initial.active?.messages || [],
  );
  const [draft, setDraft] = useState(initial.active?.draft || "");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(
    initial.active?.pending || null,
  );
  const [courseDialog, setCourseDialog] = useState(false);
  const [studyDialog, setStudyDialog] = useState(false);
  const [filter, setFilter] = useState("");
  const [tool, setTool] = useState<Tool | null>(null);
  const [recording, setRecording] = useState(false);
  const [mode, setMode] = useState<ConversationMode>(
    () =>
      initial.active?.mode ||
      (initial.active?.messages.length ? "text" : "voice"),
  );
  const [voiceIntroOpen, setVoiceIntroOpen] = useState(false);
  const [voiceDemoAllowed, setVoiceDemoAllowed] = useState(false);
  const voiceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [undo, setUndo] = useState<Conversation | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const histories = useRef<Histories>(initial.active?.histories || {});
  const lastEnvelope = useRef<Envelope | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const [showLatest, setShowLatest] = useState(false);
  const empty = messages.length === 0;
  const locked = busy || pending !== null;
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    localStorage.setItem("tiraduvidas.theme.v2", dark ? "dark" : "light");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#0c0c0c" : "#eeeeee");
  }, [dark]);
  useEffect(() => {
    const viewport = visualViewport;
    const resize = () =>
      document.documentElement.style.setProperty(
        "--td-viewport-height",
        (viewport?.height || innerHeight) + "px",
      );
    resize();
    viewport?.addEventListener("resize", resize);
    return () => viewport?.removeEventListener("resize", resize);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (voiceTimer.current) clearTimeout(voiceTimer.current);
      if (serviceTimer.current) clearTimeout(serviceTimer.current);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!showLatest)
      bottom.current?.scrollIntoView({
        behavior: reduced || busy ? "instant" : "smooth",
        block: "end",
      });
  }, [messages, busy, pending, reduced, showLatest]);
  useEffect(() => {
    if (tool)
      requestAnimationFrame(() =>
        document.querySelector<HTMLDivElement>(".td-tool-workspace")?.focus(),
      );
  }, [tool]);
  const focusInput = () => requestAnimationFrame(() => input.current?.focus());
  const addAnswer = (text: string, target: Domain, courseName?: string) =>
    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text,
        domain: target,
        courseName,
      },
    ]);
  const dispatch = (
    text: string,
    target: Domain,
    selectedCourse = currentCourse,
  ) => {
    const request = createEnvelope(
      target,
      selectedCourse?.id || null,
      histories.current,
      text,
    );
    lastEnvelope.current = request;
    setPending(null);
    setDomain(target);
    setBusy(true);
    setShowLatest(false);
    setAnnouncement(
      target === "institution"
        ? "Sua pergunta está no atendimento da faculdade."
        : "Sua pergunta está no contexto da matéria.",
    );
    histories.current[request.scope] = [
      ...request.history,
      { role: "user", text },
    ];
    setPhase(0);
    setStreaming(null);
    timer.current = setTimeout(() => {
      setPhase(1);
      timer.current = setTimeout(() => {
        const answer = demoReply(request);
        const id = crypto.randomUUID();
        setStreaming(id);
        setMessages((previous) => [
          ...previous,
          {
            id,
            role: "assistant",
            text: "",
            domain: target,
            courseName: selectedCourse?.name,
          },
        ]);
        const words = answer.match(/\S+\s*/g) || [answer];
        let position = 0;
        let partial = "";
        const next = () => {
          const batch = reduced ? words.length : 2;
          partial += words.slice(position, position + batch).join("");
          position += batch;
          setMessages((previous) =>
            previous.map((entry) =>
              entry.id === id ? { ...entry, text: partial } : entry,
            ),
          );
          if (position < words.length) timer.current = setTimeout(next, 80);
          else {
            histories.current[request.scope] = [
              ...histories.current[request.scope]!,
              { role: "assistant", text: answer },
            ];
            setStreaming(null);
            setBusy(false);
            setAnnouncement("Resposta pronta. " + answer);
          }
        };
        next();
      }, 1000);
    }, 1100);
  };
  const route = (text: string, entryId: string, target: Domain) => {
    if (target === "study" && !currentCourse) {
      setMode("text");
      setPending({ kind: "course", text, entryId });
      return;
    }
    if (target === "institution") {
      setMode("text");
      setPending({ kind: "handoff", text, entryId });
      return;
    }
    dispatch(text, target);
  };
  const submitQuestion = (question: string, fromVoice = false) => {
    const text = question.trim();
    if (!text || locked) return;
    const entryId = crypto.randomUUID();
    setMessages((previous) => [
      ...previous,
      { id: entryId, role: "user", text },
    ]);
    if (!fromVoice) setDraft("");
    setRecording(false);
    setUndo(null);
    setShowLatest(false);
    if (input.current) input.current.style.height = "auto";
    const intent = classifyQuestion(text);
    if (intent === "greeting") {
      addAnswer(
        "Olá! Pode perguntar sobre a matéria ou sobre a faculdade. Como posso te ajudar?",
        domain,
        currentCourse?.name,
      );
      return;
    }
    if (intent === "clarify" || intent === "mixed") {
      setMode("text");
      setPending({ kind: intent, text, entryId });
      return;
    }
    route(text, entryId, intent);
  };
  const submit = () => submitQuestion(draft);
  const changeMode = (next: ConversationMode) => {
    if (voiceTimer.current) clearTimeout(voiceTimer.current);
    setRecording(false);
    setMode(next);
    if (next === "text") focusInput();
  };
  const runVoiceDemo = () => {
    setVoiceIntroOpen(false);
    setVoiceDemoAllowed(true);
    setRecording(true);
    voiceTimer.current = setTimeout(() => {
      setRecording(false);
      submitQuestion("Me explique o que é comunicação assertiva.", true);
    }, 2300);
  };
  const startVoice = () => {
    if (recording) {
      if (voiceTimer.current) clearTimeout(voiceTimer.current);
      setRecording(false);
      return;
    }
    if (voiceDemoAllowed) runVoiceDemo();
    else setVoiceIntroOpen(true);
  };
  const editPending = () => {
    if (!pending) return;
    setDraft(pending.text);
    setMessages((previous) =>
      previous.filter((entry) => entry.id !== pending.entryId),
    );
    setPending(null);
    focusInput();
  };
  const snapshot = (): Conversation => {
    const scoped = structuredClone(histories.current);
    const partial = streaming
      ? messages.find((entry) => entry.id === streaming)
      : null;
    const scope = lastEnvelope.current?.scope;
    if (partial?.text && scope)
      scoped[scope] = [
        ...(scoped[scope] || []),
        { role: "assistant", text: partial.text },
      ];
    return {
      mode,
      id: activeId,
      createdAt,
      updatedAt: Date.now(),
      title: conversationTitle(messages, service, draft),
      messages: structuredClone(messages),
      histories: scoped,
      draft,
      domain,
      pending: pending ? { ...pending } : null,
      course: currentCourse,
      screen,
      service: structuredClone(service),
    };
  };
  const commit = (record: Conversation) => {
    const items = upsertConversation(itemsRef.current, record);
    itemsRef.current = items;
    setHistoryItems(items);
    setHistoryError(!writeConversations({ items, activeId: record.id }));
  };
  const stopWork = () => {
    if (voiceTimer.current) clearTimeout(voiceTimer.current);
    setRecording(false);
    setVoiceIntroOpen(false);
    if (timer.current) clearTimeout(timer.current);
    if (serviceTimer.current) clearTimeout(serviceTimer.current);
    setBusy(false);
    setServiceBusy(false);
    setStreaming(null);
    lastEnvelope.current = null;
  };
  const applyRecord = (record: Conversation) => {
    stopWork();
    setMode(record.mode || (record.messages.length ? "text" : "voice"));
    setActiveId(record.id);
    setCreatedAt(record.createdAt);
    setMessages(structuredClone(record.messages));
    histories.current = structuredClone(record.histories);
    setDraft(record.draft);
    setDomain(record.domain);
    setPending(record.pending);
    setCurrentCourse(record.course);
    setScreen(record.screen);
    setService(structuredClone(record.service));
    setTool(null);
    setStudyDialog(false);
    setCourseDialog(false);
    setShowLatest(false);
    setRecording(false);
  };
  const openHistory = () => {
    commit(snapshot());
    setHistoryOpen(true);
  };
  const selectConversation = (record: Conversation) => {
    if (record.id === activeId) {
      setHistoryOpen(false);
      return;
    }
    commit(snapshot());
    applyRecord(record);
    setUndo(null);
    setHistoryOpen(false);
    setAnnouncement("Conversa retomada: " + record.title);
  };
  const newConversation = () => {
    const previous = snapshot();
    commit(previous);
    stopWork();
    if (undoTimer.current) clearTimeout(undoTimer.current);
    if (
      previous.messages.length ||
      previous.service.messages.length ||
      previous.service.draft
    )
      setUndo(previous);
    else setUndo(null);
    setMode("voice");
    setActiveId(crypto.randomUUID());
    setCreatedAt(Date.now());
    histories.current = {};
    setMessages([]);
    setPending(null);
    setDraft("");
    setService(emptyService());
    setDomain("study");
    setScreen("study");
    setHistoryOpen(false);
    setAnnouncement("Nova conversa iniciada. A anterior ficou no histórico.");
    undoTimer.current = setTimeout(() => setUndo(null), 8000);
  };
  const restore = () => {
    if (!undo) return;
    applyRecord(undo);
    setUndo(null);
    setAnnouncement("Conversa restaurada.");
  };
  useEffect(() => {
    if (pending?.kind === "handoff") void import("./Institution");
  }, [pending?.kind]);
  const openService = () => {
    if (!pending) return;
    setService((previous) => ({ ...previous, draft: pending.text }));
    setPending(null);
    setScreen("institution");
    setAnnouncement(
      "Atendimento aberto. Sua pergunta está preenchida, pronta para enviar.",
    );
  };
  const sendService = (text: string) => {
    const question = text.trim();
    if (!question || serviceBusy || service.replyPending) return;
    setService((previous) => ({
      messages: [...previous.messages, { user: true, text: question }],
      draft: "",
      replyPending: true,
    }));
  };
  useEffect(() => {
    if (!service.replyPending) return;
    setServiceBusy(true);
    const lastUser = [...service.messages]
      .reverse()
      .find((message) => message.user);
    if (!lastUser) {
      setService((previous) => ({ ...previous, replyPending: false }));
      setServiceBusy(false);
      return;
    }
    const context = service.messages.slice(0, -1).map((message) => ({
      role: message.user ? ("user" as const) : ("assistant" as const),
      text: message.text,
    }));
    const request = createEnvelope(
      "institution",
      null,
      { institution: context },
      lastUser.text,
    );
    serviceTimer.current = setTimeout(() => {
      setService((previous) => ({
        ...previous,
        messages: [
          ...previous.messages,
          { user: false, text: demoReply(request) },
        ],
        replyPending: false,
      }));
      setServiceBusy(false);
    }, 1500);
    return () => {
      if (serviceTimer.current) clearTimeout(serviceTimer.current);
    };
  }, [activeId, service.replyPending]);
  useEffect(() => {
    const record = snapshot();
    const save = () => commit(record);
    const timeout = setTimeout(save, 300);
    window.addEventListener("pagehide", save);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("pagehide", save);
    };
  }, [
    activeId,
    createdAt,
    messages,
    draft,
    domain,
    pending,
    currentCourse,
    screen,
    service,
    streaming,
    mode,
  ]);
  useEffect(() => {
    if (!historyOpen) return;
    const measure = () => {
      const rail = document.querySelector(".td-study-rail");
      const bounds = rail?.getClientRects().length
        ? rail.getBoundingClientRect()
        : document
            .querySelector(".td-institution-view section")
            ?.getBoundingClientRect();
      if (bounds)
        setHistoryAnchor({
          top: bounds.top,
          right: Math.max(16, innerWidth - bounds.right),
          width: Math.min(420, bounds.width),
          height: bounds.height,
          bottom: "auto",
        });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [historyOpen, screen]);
  const chooseCourse = () => {
    setCurrentCourse(course);
    setCourseDialog(false);
    setFilter("");
    if (pending?.kind === "course") dispatch(pending.text, "study", course);
    else setDomain("study");
    focusInput();
  };
  const openTool = (next: Tool) => {
    setStudyDialog(false);
    setTool(next);
  };
  const closeTool = () => {
    const panel =
      document.querySelector<HTMLDialogElement>(".td-tool-workspace");
    const done = () => {
      setTool(null);
      focusInput();
    };
    if (panel && !reduced) {
      const current = getComputedStyle(panel);
      const opacity = current.opacity;
      const transform = current.transform;
      panel.getAnimations().forEach((animation) => animation.cancel());
      void panel
        .animate(
          [
            { opacity, transform },
            { opacity: 0, transform: "translateY(6px)" },
          ],
          {
            duration: 180,
            easing: "cubic-bezier(.33,1,.68,1)",
            fill: "forwards",
          },
        )
        .finished.then(done, () => {});
    } else done();
  };
  const seed = (text: string) => {
    changeMode("text");
    setDraft(text);
    focusInput();
  };
  const studyContent = currentCourse ? (
    <Notebook
      active={tool}
      onTool={openTool}
      sourceLabel="Materiais da disciplina"
    />
  ) : (
    <div className="td-no-course">
      <BookOpen size={26} />
      <h2>Caderno da disciplina</h2>
      <p>
        Escolha uma matéria para acessar o material e as ferramentas de estudo.
      </p>
      <button
        className="td-primary"
        onClick={() => {
          setStudyDialog(false);
          setCourseDialog(true);
        }}
      >
        Escolher matéria
      </button>
    </div>
  );
  const toggle = (x = innerWidth / 2, y = 0) => {
    if (!document.startViewTransition || reduced) {
      setDark((v) => !v);
      return;
    }
    const root = document.documentElement;
    root.style.setProperty("--tema-x", x + "px");
    root.style.setProperty("--tema-y", y + "px");
    root.style.setProperty(
      "--tema-raio-max",
      Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) +
        "px",
    );
    root.dataset.trocaTema = dark ? "nascer" : "eclipse";
    const transition = document.startViewTransition(() =>
      flushSync(() => setDark((v) => !v)),
    );
    void transition.finished.finally(() => delete root.dataset.trocaTema);
  };
  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>
        <div
          className="td-app"
          data-color={dark ? "dark" : "light"}
          data-motion={reduced ? "reduce" : "full"}
        >
          <AnimatePresence initial={false} mode="wait">
            {screen === "institution" ? (
              <motion.div
                key="institution"
                className="td-institution-view"
                initial={{ opacity: 0, transform: "translateY(6px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                exit={{ opacity: 0, transform: "translateY(-4px)" }}
                transition={{
                  duration: reduced ? 0 : 0.24,
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                <Suspense
                  fallback={
                    <div className="td-tool-loading" role="status">
                      Abrindo atendimento…
                    </div>
                  }
                >
                  <Institution
                    returnToChat
                    onHome={() => {
                      setScreen("study");
                      setDomain("study");
                    }}
                    control={{
                      state: service,
                      onDraftChange: (value) =>
                        setService((previous) => ({
                          ...previous,
                          draft: value,
                        })),
                      onSend: sendService,
                      busy: serviceBusy || Boolean(service.replyPending),
                    }}
                    onHistory={openHistory}
                    historyOpen={historyOpen}
                  />
                </Suspense>
              </motion.div>
            ) : (
              <motion.div
                key="study"
                className="td-study-view"
                initial={{ opacity: 0, transform: "translateY(6px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                exit={{ opacity: 0, transform: "translateY(-4px)" }}
                transition={{
                  duration: reduced ? 0 : 0.24,
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                <a
                  className="td-skip"
                  href={mode === "voice" ? "#td-voice-start" : "#pergunta"}
                >
                  {mode === "voice"
                    ? "Ir para os controles de voz"
                    : "Ir para o campo de pergunta"}
                </a>
                <header className="td-header">
                  <div className="td-header-top">
                    <Logo className="td-logo" />
                    <span>
                      {currentCourse
                        ? "Aberto pela sua sala no AVA"
                        : "UniAnchieta · Seu espaço para tirar dúvidas"}
                    </span>
                  </div>
                  <div className="td-header-main">
                    <div className="td-brand">
                      <Owl alt="" />
                      <div>
                        <h1>Tira-dúvidas</h1>
                        <p>
                          {currentCourse?.name ||
                            "Sobre a matéria e a faculdade"}
                        </p>
                      </div>
                    </div>
                    <div className="td-header-actions">
                      <button
                        type="button"
                        className="td-text-button td-history-trigger"
                        aria-label="Histórico de conversas"
                        aria-expanded={historyOpen}
                        aria-haspopup="dialog"
                        onClick={openHistory}
                      >
                        <History size={19} />
                        <span>Histórico</span>
                      </button>
                      <button
                        type="button"
                        className="td-text-button td-new"
                        aria-label="Nova conversa"
                        onClick={newConversation}
                        disabled={busy || (empty && !pending && !draft.trim())}
                      >
                        <Plus size={19} />
                        <span>Nova conversa</span>
                      </button>
                      <ThemeButton />
                    </div>
                  </div>
                </header>
                <div className="td-layout">
                  <main
                    className={
                      "td-chat" +
                      (empty ? " td-chat-empty" : "") +
                      (mode === "voice" ? " td-chat-voice" : "")
                    }
                    aria-label="Tira-dúvidas"
                  >
                    <div
                      className="td-scroll"
                      ref={log}
                      onScroll={() => {
                        const el = log.current;
                        if (el)
                          setShowLatest(
                            el.scrollHeight - el.scrollTop - el.clientHeight >
                              160,
                          );
                      }}
                    >
                      <AnimatePresence initial={false} mode="wait">
                        {mode === "voice" && !pending ? (
                          <VoiceStage
                            recording={recording}
                            busy={busy}
                            streaming={Boolean(streaming)}
                            phase={phase}
                            messages={messages}
                            reduced={reduced}
                            onText={() => changeMode("text")}
                          />
                        ) : empty ? (
                          <motion.section
                            key="welcome"
                            initial={{
                              opacity: 0,
                              transform: "translateY(8px)",
                            }}
                            animate={{
                              opacity: 1,
                              transform: "translateY(0px)",
                            }}
                            exit={{ opacity: 0, transform: "translateY(-6px)" }}
                            transition={{
                              duration: reduced ? 0 : 0.24,
                              ease: [0.33, 1, 0.68, 1],
                            }}
                            className="td-empty"
                            aria-labelledby="td-welcome"
                          >
                            <div className="td-welcome-banner">
                              <div className="td-welcome-copy">
                                <Owl alt="" className="td-welcome-owl" />
                                <h2 id="td-welcome">Qual é a sua dúvida?</h2>
                                <p>
                                  Sobre a matéria ou a faculdade.
                                  <br className="td-mobile-break" /> Escreva do
                                  seu jeito.
                                </p>
                              </div>
                            </div>
                          </motion.section>
                        ) : (
                          <motion.div
                            key="conversation"
                            initial={{
                              opacity: 0,
                              transform: "translateY(8px)",
                            }}
                            animate={{
                              opacity: 1,
                              transform: "translateY(0px)",
                            }}
                            transition={{
                              duration: reduced ? 0 : 0.28,
                              ease: [0.33, 1, 0.68, 1],
                            }}
                            className="td-message-list"
                            role="log"
                            aria-label="Conversa"
                            aria-live={busy ? "off" : "polite"}
                            aria-relevant="additions text"
                          >
                            {messages.map((entry) => (
                              <ChatEntry
                                key={entry.id}
                                entry={entry}
                                streaming={streaming === entry.id}
                              />
                            ))}
                            {busy && !streaming ? (
                              <div className="td-thinking" role="status">
                                <Owl alt="" />
                                <AnimatePresence mode="wait" initial={false}>
                                  <motion.span
                                    key={phase}
                                    className="td-thinking-label"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {phase === 0
                                      ? "Entendendo sua pergunta"
                                      : "Preparando sua resposta"}
                                  </motion.span>
                                </AnimatePresence>
                              </div>
                            ) : null}
                            {pending ? (
                              <section
                                className="td-decision"
                                aria-labelledby="td-decision-title"
                              >
                                {pending.kind === "handoff" ? (
                                  <>
                                    <span className="td-decision-icon">
                                      <Building2 size={20} />
                                    </span>
                                    <h2 id="td-decision-title">
                                      Vamos falar com o atendimento?
                                    </h2>
                                    <p>
                                      O atendimento da faculdade cuida de
                                      documentos, matrícula e serviços. Sua
                                      pergunta já vai junto.
                                    </p>
                                    <div className="td-decision-actions">
                                      <button
                                        type="button"
                                        className="td-primary"
                                        onClick={() => openService()}
                                      >
                                        Ir para o atendimento
                                        <ArrowRight size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        className="td-secondary"
                                        onClick={editPending}
                                      >
                                        Editar pergunta
                                      </button>
                                    </div>
                                  </>
                                ) : pending.kind === "clarify" ? (
                                  <>
                                    <h2 id="td-decision-title">
                                      Só para eu entender
                                    </h2>
                                    <p>
                                      Sua pergunta é sobre o que você está
                                      estudando ou sobre um serviço da
                                      faculdade?
                                    </p>
                                    <div className="td-decision-actions">
                                      <button
                                        type="button"
                                        className="td-secondary"
                                        onClick={() =>
                                          route(
                                            pending.text,
                                            pending.entryId,
                                            "study",
                                          )
                                        }
                                      >
                                        <BookOpen size={17} />
                                        Conteúdo da matéria
                                      </button>
                                      <button
                                        type="button"
                                        className="td-secondary"
                                        onClick={() =>
                                          route(
                                            pending.text,
                                            pending.entryId,
                                            "institution",
                                          )
                                        }
                                      >
                                        <Building2 size={17} />
                                        Serviços da faculdade
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      className="td-inline-button"
                                      onClick={editPending}
                                    >
                                      Prefiro reformular a pergunta
                                    </button>
                                  </>
                                ) : pending.kind === "course" ? (
                                  <>
                                    <h2 id="td-decision-title">
                                      Qual matéria você está estudando?
                                    </h2>
                                    <p>
                                      Assim, a resposta usa o conteúdo da
                                      matéria certa. Você não precisa escrever
                                      sua pergunta de novo.
                                    </p>
                                    <div className="td-decision-actions">
                                      <button
                                        type="button"
                                        className="td-primary"
                                        onClick={() => setCourseDialog(true)}
                                      >
                                        Escolher matéria
                                        <ChevronDown size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        className="td-secondary"
                                        onClick={editPending}
                                      >
                                        Editar pergunta
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <h2 id="td-decision-title">
                                      Vamos resolver uma dúvida de cada vez
                                    </h2>
                                    <p>
                                      Sua mensagem tem uma pergunta sobre estudo
                                      e outra sobre serviços. Separe as
                                      perguntas para cada uma receber a resposta
                                      certa.
                                    </p>
                                    <button
                                      type="button"
                                      className="td-primary"
                                      onClick={editPending}
                                    >
                                      Editar minha pergunta
                                    </button>
                                  </>
                                )}
                              </section>
                            ) : null}
                            {!pending &&
                            (service.messages.length > 0 ||
                              service.draft.trim()) ? (
                              <button
                                type="button"
                                className="td-service-return"
                                onClick={() => setScreen("institution")}
                              >
                                <Building2 size={18} />
                                <span>Continuar no atendimento</span>
                                <ArrowRight size={16} />
                              </button>
                            ) : null}
                            <div ref={bottom} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {showLatest && !empty ? (
                      <button
                        type="button"
                        className="td-jump"
                        onClick={() => {
                          setShowLatest(false);
                          bottom.current?.scrollIntoView({
                            behavior: reduced ? "instant" : "smooth",
                          });
                        }}
                      >
                        <ArrowDown size={16} />
                        Ver última mensagem
                      </button>
                    ) : null}
                    <div className="td-composer-area">
                      {empty && mode === "text" ? (
                        <div
                          className="td-examples"
                          role="group"
                          aria-label="Exemplos de perguntas"
                        >
                          {examples.map(({ icon: Icon, title, question }) => (
                            <button
                              type="button"
                              key={title}
                              onClick={() => seed(question)}
                            >
                              <Icon size={16} />
                              <span>{title}</span>
                              <ArrowRight size={15} />
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <form
                        className={
                          "td-composer td-composer-" +
                          mode +
                          (locked ? " td-composer-locked" : "")
                        }
                        onSubmit={(event) => {
                          event.preventDefault();
                          submit();
                        }}
                      >
                        <div className="td-composer-top">
                          <span className="td-context">
                            {domain === "institution" ? (
                              <Building2 size={15} />
                            ) : (
                              <BookOpen size={15} />
                            )}
                            <strong>
                              {domain === "institution"
                                ? "Serviços da faculdade"
                                : currentCourse?.name ||
                                  "Sem matéria selecionada"}
                            </strong>
                          </span>
                          <span className="td-enter-hint">
                            {locked || mode === "voice" || mobile
                              ? ""
                              : "Enter para enviar"}
                          </span>
                        </div>
                        <div className="td-composer-mode-body">
                          {mode === "text" ? (
                            <>
                              {" "}
                              <label className="sr-only" htmlFor="pergunta">
                                Escreva sua dúvida
                              </label>
                              <textarea
                                ref={input}
                                id="pergunta"
                                rows={2}
                                maxLength={3000}
                                value={draft}
                                placeholder={
                                  pending
                                    ? "Conclua a escolha acima para continuar…"
                                    : "Escreva sua dúvida…"
                                }
                                readOnly={locked}
                                aria-describedby="td-input-help"
                                onChange={(event) => {
                                  setDraft(event.target.value);
                                  event.target.style.height = "auto";
                                  event.target.style.height =
                                    Math.min(event.target.scrollHeight, 160) +
                                    "px";
                                }}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" &&
                                    !event.shiftKey &&
                                    !mobile &&
                                    !event.nativeEvent.isComposing
                                  ) {
                                    event.preventDefault();
                                    submit();
                                  }
                                }}
                              />
                            </>
                          ) : (
                            <div
                              className="td-voice-composer-hint"
                              role="status"
                            >
                              <span
                                className={
                                  "td-voice-status-dot" +
                                  (recording || busy ? " is-active" : "")
                                }
                              />
                              <span>
                                {recording
                                  ? "Demonstração em andamento…"
                                  : busy
                                    ? "Preparando sua resposta…"
                                    : "Toque no microfone para perguntar"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="td-composer-bottom">
                          <ConversationModeSwitch
                            mode={mode}
                            onChange={changeMode}
                            reduced={reduced}
                          />
                          {mode === "voice" ? (
                            <button
                              type="button"
                              className="td-voice-start"
                              id="td-voice-start"
                              disabled={locked}
                              aria-label={
                                recording
                                  ? "Cancelar demonstração de voz"
                                  : "Iniciar conversa por voz"
                              }
                              onClick={startVoice}
                            >
                              {recording ? (
                                <Square size={21} />
                              ) : (
                                <Mic size={22} />
                              )}
                              <span>
                                {recording
                                  ? "Parar"
                                  : messages.length
                                    ? "Perguntar por voz"
                                    : "Começar a falar"}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="td-send"
                              aria-label="Enviar pergunta"
                              disabled={!draft.trim() || locked}
                            >
                              <ArrowRight size={20} />
                              <span>Enviar</span>
                            </button>
                          )}
                        </div>
                      </form>
                      <p id="td-input-help" className="td-input-help">
                        {pending
                          ? "Sua pergunta está salva enquanto você escolhe."
                          : "Respostas podem conter erros. Confira informações importantes."}
                        <button
                          type="button"
                          className="td-motion-toggle"
                          aria-pressed={quiet}
                          onClick={() =>
                            setQuiet((value) => {
                              localStorage.setItem(
                                "tiraduvidas.motion",
                                value ? "full" : "reduce",
                              );
                              return !value;
                            })
                          }
                        >
                          {quiet ? "Ativar animações" : "Reduzir movimento"}
                        </button>
                      </p>
                    </div>
                  </main>
                  <aside
                    className="td-study-rail"
                    aria-label="Caderno da disciplina"
                  >
                    {studyContent}
                  </aside>
                </div>
                <button
                  type="button"
                  className="td-caderno-peek"
                  aria-label="Abrir espaço de estudo"
                  aria-haspopup="dialog"
                  onClick={() => setStudyDialog(true)}
                >
                  <span className="td-handle" />
                  <span className="td-peek-content">
                    <span>
                      <strong>Caderno da disciplina</strong>
                      <span>Mapa mental, quiz, flashcards e fontes</span>
                    </span>
                    <span className="td-peek-icons">
                      <Share2 size={21} />
                      <HelpCircle size={21} />
                      <SquareStack size={21} />
                    </span>
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <Modal
            open={voiceIntroOpen}
            title="Vamos conversar por voz?"
            onClose={() => setVoiceIntroOpen(false)}
            className="td-voice-intro"
          >
            <div className="td-voice-intro-portrait">
              <Owl alt="" />
            </div>
            <p className="td-modal-description">
              Nesta prévia, você pode acompanhar uma pergunta de exemplo e a
              resposta. Seu microfone não será ativado e nenhum áudio será
              gravado.
            </p>
            <button
              type="button"
              className="td-primary td-full"
              onClick={runVoiceDemo}
            >
              <Mic size={18} />
              Experimentar conversa
            </button>
            <button
              type="button"
              className="td-voice-intro-cancel"
              onClick={() => setVoiceIntroOpen(false)}
            >
              Agora não
            </button>
          </Modal>
          <Modal
            open={historyOpen}
            title="Histórico de conversas"
            onClose={() => setHistoryOpen(false)}
            className="td-history-dialog"
            style={mobile ? undefined : historyAnchor}
          >
            <HistoryList
              items={historyItems}
              activeId={activeId}
              onSelect={selectConversation}
              onNew={newConversation}
              error={historyError}
            />
          </Modal>
          <div className="sr-only" role="status" aria-live="polite">
            {announcement}
          </div>
          <AnimatePresence>
            {undo ? (
              <motion.div
                key="undo"
                initial={{
                  opacity: 0,
                  transform: "translateY(8px) translateX(-50%)",
                }}
                animate={{
                  opacity: 1,
                  transform: "translateY(0px) translateX(-50%)",
                }}
                exit={{
                  opacity: 0,
                  transform: "translateY(5px) translateX(-50%)",
                }}
                transition={{
                  duration: reduced ? 0 : 0.22,
                  ease: [0.33, 1, 0.68, 1],
                }}
                className="td-toast"
                role="status"
              >
                <span>Conversa salva no histórico.</span>
                <button type="button" onClick={restore}>
                  Desfazer
                </button>
                <button
                  className="td-toast-close"
                  type="button"
                  aria-label="Fechar aviso"
                  onClick={() => setUndo(null)}
                >
                  <X size={16} />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <Modal
            open={courseDialog}
            title="Sua matéria"
            onClose={() => setCourseDialog(false)}
          >
            <p className="td-modal-description">
              Selecione a matéria para usar os conteúdos da sua sala.
            </p>
            <label htmlFor="td-course-search" className="sr-only">
              Buscar matéria
            </label>
            <input
              id="td-course-search"
              type="search"
              placeholder="Buscar matéria"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            {course.name
              .toLocaleLowerCase()
              .includes(filter.toLocaleLowerCase()) ? (
              <button
                type="button"
                className="td-course-option"
                onClick={chooseCourse}
              >
                <span className="td-course-icon">
                  <BookOpen size={21} />
                </span>
                <span>
                  <strong>{course.name}</strong>
                  <span>{sources.length} materiais disponíveis</span>
                </span>
                {currentCourse ? (
                  <Check size={19} />
                ) : (
                  <ChevronRight size={19} />
                )}
              </button>
            ) : (
              <p className="td-no-results" role="status">
                Nenhuma matéria encontrada. Tente outra palavra.
              </p>
            )}
          </Modal>
          <Modal
            open={studyDialog}
            title="Caderno da disciplina"
            onClose={() => setStudyDialog(false)}
            className="td-study-dialog"
          >
            {studyContent}
          </Modal>
          {tool ? (
            <ToolWorkspace
              onClose={() => {
                closeTool();
                focusInput();
              }}
            >
              <Suspense
                fallback={
                  <div className="td-tool-loading" role="status">
                    Abrindo ferramenta de estudo…
                  </div>
                }
              >
                <StudyTools
                  active={tool}
                  onBack={() => setTool(null)}
                  chatOpen={false}
                  onChat={() => {
                    closeTool();
                    focusInput();
                  }}
                  onAsk={(text) => {
                    closeTool();
                    seed(text);
                  }}
                />
              </Suspense>
            </ToolWorkspace>
          ) : null}
        </div>
      </MotionConfig>
    </ThemeContext.Provider>
  );
}

function ChatEntry({
  entry,
  streaming = false,
}: {
  entry: Entry;
  streaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copyError, setCopyError] = useState(false);
  if (entry.role === "user")
    return (
      <motion.div
        initial={{ opacity: 0, transform: "translateY(6px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ duration: 0.24, ease: [0.33, 1, 0.68, 1] }}
        className="td-user-message"
      >
        <span className="sr-only">Você: </span>
        <p>{entry.text}</p>
      </motion.div>
    );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry.text);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
      className={"td-answer" + (streaming ? " td-streaming" : "")}
    >
      <div className="td-answer-heading">
        <Owl alt="" />
        <span>
          {entry.domain === "institution"
            ? "Atendimento da faculdade"
            : entry.courseName || "Tira-dúvidas"}
        </span>
        {entry.domain === "institution" ? (
          <Building2 size={14} />
        ) : (
          <BookOpen size={14} />
        )}
      </div>
      <div className="td-answer-text">
        {entry.text.split("\n\n").map((paragraph, index) => (
          <p key={index}>
            {streaming
              ? (paragraph.match(/\S+\s*/g) || []).map((word, i) => (
                  <span key={i} className="td-stream-word">
                    {word}
                  </span>
                ))
              : paragraph}
          </p>
        ))}
      </div>
      {!streaming ? (
        <div className="td-answer-actions">
          <button
            type="button"
            aria-label={copied ? "Resposta copiada" : "Copiar resposta"}
            onClick={() => void copy()}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            type="button"
            aria-label="Resposta útil"
            aria-pressed={feedback === "up"}
            onClick={() =>
              setFeedback((previous) => (previous === "up" ? null : "up"))
            }
          >
            <ThumbsUp size={16} />
          </button>
          <button
            type="button"
            aria-label="Resposta não ajudou"
            aria-pressed={feedback === "down"}
            onClick={() =>
              setFeedback((previous) => (previous === "down" ? null : "down"))
            }
          >
            <ThumbsDown size={16} />
          </button>
          {copyError ? (
            <span role="status">
              Não foi possível copiar. Selecione o texto.
            </span>
          ) : null}
        </div>
      ) : null}
    </motion.article>
  );
}
function Modal({
  open,
  title,
  onClose,
  children,
  className = "",
  style,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useCallback(() => onClose(), [onClose]);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const reduced =
      matchMedia("(prefers-reduced-motion:reduce)").matches ||
      document.querySelector(".td-app")?.getAttribute("data-motion") ===
        "reduce";
    const sliding = className.includes("td-history-dialog");
    const offset = sliding
      ? matchMedia("(max-width:1023px)").matches
        ? "translateX(-32px)"
        : "translateX(32px)"
      : "translateY(14px)";
    const existing = dialog.getAnimations();
    const visual = existing.length ? getComputedStyle(dialog) : null;
    const current = visual?.transform || null;
    const currentOpacity = visual?.opacity || null;
    existing.forEach((a) => a.cancel());
    if (open) {
      if (!dialog.open) dialog.showModal();
      if (!reduced)
        dialog.animate(
          [
            {
              opacity: currentOpacity || 0,
              transform: current || offset,
            },
            { opacity: 1, transform: "translateY(0px)" },
          ],
          { duration: 280, easing: "cubic-bezier(.32,.72,0,1)" },
        );
    } else if (dialog.open) {
      if (reduced) dialog.close();
      else
        void dialog
          .animate(
            [
              {
                opacity: currentOpacity || 1,
                transform: current || "translateY(0px)",
              },
              { opacity: 0, transform: sliding ? offset : "translateY(10px)" },
            ],
            { duration: 190, easing: "cubic-bezier(.33,1,.68,1)" },
          )
          .finished.then(
            () => dialog.close(),
            () => {},
          );
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      style={style}
      className={"td-dialog " + className}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const r = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            close();
        }
      }}
    >
      <div className="td-modal-header">
        <h2>{title}</h2>
        <button
          type="button"
          className="td-icon-button"
          aria-label="Fechar painel"
          onClick={close}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function ToolWorkspace({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    if (
      !matchMedia("(prefers-reduced-motion:reduce)").matches &&
      document.querySelector(".td-app")?.getAttribute("data-motion") !==
        "reduce"
    )
      dialog.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0px)" },
        ],
        { duration: 280, easing: "cubic-bezier(.33,1,.68,1)" },
      );
  }, []);
  return (
    <dialog
      ref={ref}
      className="td-tool-workspace"
      aria-label="Ferramenta de estudo"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {children}
    </dialog>
  );
}
