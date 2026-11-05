import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Image, Menu, Mic, X } from "lucide-react";
import { BackHome, Logo, Owl, ThemeButton, ThemeContext } from "./ui";
import type { ServiceState } from "./conversationHistory";
import widgetCSS from "./institution-widget.css?inline";

const chips = [
  "Qual é o meu horário de aula?",
  "Onde vejo o calendário acadêmico?",
  "Como falo com a secretaria?",
];
const widgetOverrides = `
:host { display:block; width:100%; height:100%; min-height:0; }
.caw-root {position:relative!important;inset:0!important;width:100%;height:100%;font-family:Inter,system-ui,sans-serif;--caw-primary:var(--anchy-blue);--caw-primary-text:var(--anchy-on-blue);--caw-bg:var(--surface);--caw-surface:var(--surface-2);--caw-header-bg:var(--surface);--caw-header-text:var(--text);--caw-text:var(--text);--caw-muted:var(--text-muted);--caw-border:var(--line);--caw-field-border:var(--line);--caw-danger:var(--erro);--caw-danger-text:var(--on-erro);--caw-radius:var(--radius-card);}
.caw-root .caw-panel,.caw-root .caw-panel[data-expanded='1']{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-height:none!important;border-radius:var(--radius-panel)!important;box-shadow:none!important;padding-bottom:0!important;transition:none!important;}
.caw-attach svg {width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;}
.caw-menu svg {width:18px;height:18px;}
.demo-message {max-width:80%;align-self:flex-end;background:var(--anchy-blue);color:white;padding:10px 14px;border-radius:18px 18px 4px 18px;margin:8px;white-space:pre-wrap;}
.demo-message{animation:service-message-in var(--td-motion-duration,.24s) cubic-bezier(.33,1,.68,1) both;}
@keyframes service-message-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){.demo-message{animation:none}}
.demo-response {align-self:flex-start;background:var(--surface);color:var(--text);border-radius:18px 18px 18px 4px;}
`;
type WidgetControl = {
  state: ServiceState;
  onDraftChange: (value: string) => void;
  onSend: (text: string) => void;
  busy: boolean;
};
export function Institution({
  onHome,
  control,
  onHistory,
  historyOpen = false,
  returnToChat = false,
}: {
  onHome: () => void;
  control?: WidgetControl;
  onHistory?: () => void;
  historyOpen?: boolean;
  returnToChat?: boolean;
}) {
  return (
    <main
      aria-label="Atendimento da UniAnchieta"
      className="h-full flex flex-col gap-4 px-4 pt-3 pb-4 lg:gap-6 lg:px-10 lg:pt-7 lg:pb-8 bg-page text-ink"
    >
      <div className="h-12 lg:h-auto flex items-center justify-between shrink-0">
        <Logo className="h-6 lg:h-7" />
        <ThemeButton />
      </div>
      <header className="w-full max-w-[960px] mx-auto flex items-center gap-3 lg:gap-4 shrink-0">
        <Owl alt="" className="w-11 h-11 lg:w-14 lg:h-14" />
        <div className="flex-1 min-w-0">
          <h1 className="text-[19px] lg:text-[34px] leading-snug lg:leading-[1.15] font-bold lg:tracking-[-0.015em]">
            Dúvidas sobre a UniAnchieta
          </h1>
          <p className="hidden lg:block mt-1 text-base text-ink-muted">
            Horários, calendário, secretaria e outras questões, com o Chat
            Anchieta.
          </p>
        </div>
        {returnToChat ? (
          <button
            type="button"
            className="td-service-back"
            aria-label="Voltar ao Tira-dúvidas"
            onClick={onHome}
          >
            <ArrowLeft size={19} />
            <span>Voltar ao Tira-dúvidas</span>
          </button>
        ) : (
          <BackHome onClick={onHome} />
        )}
      </header>
      <section
        aria-label="Chat Anchieta"
        className="flex-1 min-h-0 w-full max-w-[960px] mx-auto rounded-panel bg-surface overflow-hidden"
      >
        <LocalWidget
          control={control}
          onHistory={onHistory}
          historyOpen={historyOpen}
        />
      </section>
    </main>
  );
}
function LocalWidget({
  control,
  onHistory,
  historyOpen = false,
}: {
  control?: WidgetControl;
  onHistory?: () => void;
  historyOpen?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  const [localDraft, setLocalDraft] = useState("");
  const draft = control?.state.draft ?? localDraft;
  const setDraft = control?.onDraftChange || setLocalDraft;
  const [localMessages, setMessages] = useState<
    { user: boolean; text: string }[]
  >([]);
  const messages = control?.state.messages ?? localMessages;
  const [history, setHistory] = useState(false);
  const [localBusy, setBusy] = useState(false);
  const busy = control?.busy ?? localBusy;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const [recording, setRecording] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { dark } = useContext(ThemeContext);
  useLayoutEffect(() => {
    if (host.current)
      setShadow(
        host.current.shadowRoot || host.current.attachShadow({ mode: "open" }),
      );
  }, []);
  const send = (text: string) => {
    if (!text.trim() || busy) return;
    if (control) {
      control.onSend(text);
      setFile(null);
      return;
    }
    setMessages((v) => [...v, { user: true, text }]);
    setDraft("");
    setFile(null);
    setBusy(true);
    timer.current = setTimeout(() => {
      setMessages((v) => [
        ...v,
        {
          user: false,
          text: "Você pode consultar essas informações na área do aluno. Para continuar, escolha a opção relacionada à sua dúvida.",
        },
      ]);
      setBusy(false);
    }, 1000);
  };
  return (
    <div
      ref={host}
      data-theme={dark ? "dark" : "light"}
      style={{ height: "100%" }}
    >
      {shadow
        ? createPortal(
            <>
              <style>{widgetCSS + widgetOverrides}</style>
              <div
                className="caw-root"
                data-pos="right"
                data-fullscreen="1"
                data-launcher="hidden"
                data-controls="hidden"
                data-avatar="1"
                data-open="1"
              >
                <div
                  className="caw-panel"
                  role="dialog"
                  aria-label="Chat Anchieta"
                >
                  <div className="caw-header">
                    <button
                      className="caw-menu"
                      type="button"
                      aria-label="Abrir histórico de conversas"
                      aria-expanded={onHistory ? historyOpen : history}
                      onClick={() =>
                        onHistory ? onHistory() : setHistory((v) => !v)
                      }
                    >
                      <Menu size={18} />
                    </button>
                    <div className="caw-header-info">
                      <div className="caw-title">Chat Anchieta</div>
                      <div className="caw-subtitle">
                        Atendimento oficial da UniAnchieta
                      </div>
                    </div>
                  </div>
                  <div
                    className="caw-messages"
                    role="log"
                    aria-live="polite"
                    aria-label="Mensagens"
                  >
                    {!messages.length ? (
                      <div className="caw-welcome">
                        <div className="caw-welcome-title">
                          Bem-vindo(a) ao Chat Anchieta.
                        </div>
                        <div className="caw-welcome-sub">
                          Como posso te ajudar hoje?
                        </div>
                        <div className="caw-welcome-chips">
                          {chips.map((chip) => (
                            <button
                              key={chip}
                              className="caw-chip"
                              type="button"
                              onClick={() => send(chip)}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((message, i) => (
                        <div
                          className={
                            "demo-message " +
                            (message.user ? "" : "demo-response")
                          }
                          key={i}
                        >
                          {message.text}
                        </div>
                      ))
                    )}
                    {busy ? (
                      <div className="demo-message demo-response" role="status">
                        …
                      </div>
                    ) : null}
                  </div>
                  <form
                    className="caw-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      send(draft || (file ? "Anexo: " + file : ""));
                    }}
                  >
                    {file ? (
                      <div className="caw-form-notice">
                        {file}
                        <button
                          type="button"
                          aria-label="Remover anexo"
                          onClick={() => setFile(null)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : null}
                    <input
                      ref={fileRef}
                      type="file"
                      hidden
                      onChange={(event) =>
                        setFile(event.target.files?.[0]?.name || null)
                      }
                    />
                    <div className="caw-row">
                      <button
                        className="caw-attach"
                        type="button"
                        aria-label="Anexar foto, documento ou áudio"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Image />
                      </button>
                      <button
                        className="caw-attach caw-mic"
                        type="button"
                        aria-label={
                          recording ? "Cancelar gravação" : "Gravar áudio"
                        }
                        onClick={() => setRecording((v) => !v)}
                      >
                        <Mic />
                      </button>
                      <input
                        className="caw-input"
                        type="text"
                        placeholder="Digite sua mensagem"
                        aria-label="Mensagem"
                        maxLength={4000}
                        autoComplete="off"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                      />
                      {recording ? (
                        <button
                          type="button"
                          className="caw-rec-cancel"
                          onClick={() => setRecording(false)}
                        >
                          Cancelar
                        </button>
                      ) : (
                        <button
                          className="caw-send"
                          type="submit"
                          disabled={(!draft.trim() && !file) || busy}
                        >
                          Enviar
                        </button>
                      )}
                    </div>
                    <div className="caw-disclaimer">
                      Chat Anchieta é uma IA e pode cometer erros.
                    </div>
                  </form>
                  {history ? (
                    <>
                      <div
                        className="caw-scrim"
                        onClick={() => setHistory(false)}
                      />
                      <div
                        className="caw-drawer"
                        role="dialog"
                        aria-label="Histórico de conversas"
                      >
                        <div className="caw-drawer-head">
                          <div className="caw-drawer-title">Histórico</div>
                          <button
                            type="button"
                            className="caw-drawer-close"
                            aria-label="Fechar histórico"
                            onClick={() => setHistory(false)}
                          >
                            ✕
                          </button>
                        </div>
                        <button
                          type="button"
                          className="caw-drawer-new"
                          onClick={() => {
                            setMessages([]);
                            setHistory(false);
                          }}
                        >
                          + Nova Conversa
                        </button>
                        <div className="caw-drawer-list" />
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </>,
            shadow,
          )
        : null}
    </div>
  );
}
