import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  BackHome,
  discipline,
  Logo,
  ModeSwitch,
  Owl,
  ThemeButton,
  ThemeContext,
} from "./ui";
import type { Mode, Tool } from "./ui";
import { Notebook, NotebookSheet } from "./Notebook";
import { Chat, ToolChat, Voice } from "./Chat";
import { StudyTools } from "./StudyTools";
import { Institution } from "./Institution";

type Screen = "home" | "academic" | "institution";
export default function App() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("anchy-demo-theme") !== "light",
  );
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<Mode>("voice");
  const [tool, setTool] = useState<Tool | null>(null);
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState("");
  const [toolChat, setToolChat] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("anchy-demo-theme", dark ? "dark" : "light");
  }, [dark]);
  const home = () => {
    setScreen("home");
    setSheet(false);
  };
  const openTool = (next: Tool) => {
    setTool(next);
    setSheet(false);
    setToolChat(false);
  };
  const ask = (text: string) => {
    setDraft(text);
    setMode("text");
    setToolChat(true);
  };
  const toggle = (x = innerWidth / 2, y = 0) => {
    if (
      !document.startViewTransition ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
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
      <div className="flex flex-col w-full h-screen overflow-hidden font-sans bg-page text-ink">
        <div className="flex flex-col w-full h-full min-h-0 bg-page text-ink px-4 pt-4 pb-[108px] gap-4 lg:px-10 lg:pt-7 lg:pb-8 lg:gap-6 transition-colors duration-300">
          <header className="flex flex-col gap-4 lg:gap-6 shrink-0">
            <div className="hidden lg:flex items-center justify-between">
              <Logo />
              <span className="text-sm text-ink-muted">
                Aberta pela sua sala no AVA
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <Owl alt="" style={{ width: 56, height: 56 }} />
              <div className="flex-1 min-w-0">
                <h1 className="text-[34px] leading-tight font-bold tracking-[-0.015em] text-ink truncate">
                  {discipline}
                </h1>
                <p className="text-base text-ink-muted">
                  Estudando com a Anchy, sua tutora da UniAnchieta
                </p>
              </div>
              {!tool ? <ModeSwitch mode={mode} onChange={setMode} /> : null}
              <BackHome onClick={home} />
              <ThemeButton />
            </div>
            <div className="flex lg:hidden items-center gap-3">
              <Owl alt="" style={{ width: 44, height: 44 }} />
              <h1 className="flex-1 min-w-0 text-[19px] leading-snug font-bold text-ink line-clamp-2">
                {discipline}
              </h1>
              <BackHome onClick={home} />
              <ThemeButton />
            </div>
            {!tool ? (
              <div className="lg:hidden">
                <ModeSwitch mode={mode} onChange={setMode} wide />
              </div>
            ) : null}
          </header>
          <div className="flex flex-1 min-h-0 gap-6">
            <main className="flex-1 min-w-0 min-h-0">
              <div
                className={
                  "h-full " +
                  (tool ? "" : "relative overflow-hidden rounded-panel")
                }
              >
                <div className="h-full">
                  <StudyTools
                    active={tool}
                    onBack={() => {
                      setTool(null);
                      setToolChat(false);
                    }}
                    chatOpen={toolChat}
                    onChat={() => setToolChat((v) => !v)}
                    onAsk={ask}
                  />
                  {!tool ? (
                    <div className="h-full">
                      {mode === "voice" ? (
                        <Voice />
                      ) : (
                        <Chat
                          onVoice={() => setMode("voice")}
                          draft={draft}
                          setDraft={setDraft}
                        />
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </main>
            {tool && toolChat ? (
              <ToolChat
                tool={tool}
                onClose={() => setToolChat(false)}
                draft={draft}
                setDraft={setDraft}
              />
            ) : (
              <aside className="hidden lg:flex w-[420px] shrink-0 min-h-0 rounded-panel bg-surface p-7">
                <Notebook active={tool} onTool={openTool} />
              </aside>
            )}
          </div>
          <NotebookSheet
            open={sheet}
            setOpen={setSheet}
            active={tool}
            onTool={openTool}
          />
        </div>
        <AnimatePresence mode="wait">
          {screen === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[301]"
            >
              <Home
                onAcademic={() => setScreen("academic")}
                onInstitution={() => setScreen("institution")}
              />
            </motion.div>
          ) : screen === "institution" ? (
            <motion.div
              key="institution"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[301]"
            >
              <Institution onHome={home} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ThemeContext.Provider>
  );
}
function Home({
  onAcademic,
  onInstitution,
}: {
  onAcademic: () => void;
  onInstitution: () => void;
}) {
  return (
    <div className="h-full flex flex-col gap-3 px-4 pt-3 pb-6 lg:gap-0 lg:px-10 lg:pt-7 lg:pb-8 bg-page text-ink">
      <div className="h-12 lg:h-auto flex items-center justify-between shrink-0">
        <Logo className="h-6 lg:h-7" />
        <ThemeButton />
      </div>
      <main className="flex-1 min-h-0 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-[560px] flex flex-col items-center gap-4 text-center">
          <span className="w-40 h-40 lg:w-[180px] lg:h-[180px] rounded-full bg-soft flex items-center justify-center">
            <Owl className="w-[124px] h-[124px] lg:w-[140px] lg:h-[140px]" />
          </span>
          <h1 className="mt-2 text-[26px] lg:text-[30px] leading-[1.2] font-bold">
            Como a Anchy pode te ajudar?
          </h1>
          <p className="max-w-[440px] text-base lg:text-[17px] leading-[1.55] text-ink-muted">
            Escolha o tipo da sua dúvida para começar.
          </p>
          <div className="mt-2 w-full flex flex-col gap-3">
            {[
              {
                title: "Dúvidas acadêmicas",
                desc: "Estude o conteúdo da sua disciplina com o material oficial da sala.",
                path: "M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z",
                click: onAcademic,
              },
              {
                title: "Dúvidas institucionais",
                desc: "Horários de aula, calendário, secretaria e outras questões da faculdade.",
                path: "M3 21h18M5 21V10M19 21V10M9 21v-6h6v6M2 10l10-6 10 6",
                click: onInstitution,
              },
            ].map(({ title, desc, path, click }) => (
              <motion.button
                key={title}
                type="button"
                whileTap={{ scale: 0.985 }}
                onClick={click}
                className="group w-full flex items-center gap-4 p-5 lg:p-6 rounded-panel bg-surface border border-line text-left transition-colors hover:border-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anchy-blue"
              >
                <span className="w-14 h-14 shrink-0 rounded-full bg-soft flex items-center justify-center text-link">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={path} />
                  </svg>
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[19px] lg:text-[20px] leading-[1.25] font-bold text-ink">
                    {title}
                  </span>
                  <span className="text-[15px] leading-normal text-ink-muted">
                    {desc}
                  </span>
                </span>
                <ChevronRight
                  size={22}
                  className="shrink-0 text-ink-muted group-hover:text-link transition-colors"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </main>
      <p className="hidden lg:block shrink-0 text-center text-[13px] leading-[normal] text-ink-muted">
        A Anchy é a tutora com IA da UniAnchieta e responde só com o material
        oficial da disciplina.
      </p>
    </div>
  );
}
