import { motion } from "motion/react";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Owl } from "./ui";
import type { Entry } from "./conversationHistory";
export function VoiceStage({
  recording,
  busy,
  streaming,
  phase,
  messages,
  reduced,
  onText,
}: {
  recording: boolean;
  busy: boolean;
  streaming: boolean;
  phase: number;
  messages: Entry[];
  reduced: boolean;
  onText: () => void;
}) {
  const lastAnswer = [...messages]
    .reverse()
    .find((entry) => entry.role === "assistant");
  const lastQuestion = [...messages]
    .reverse()
    .find((entry) => entry.role === "user");
  const answering = busy && streaming;
  const preparing = busy && !streaming;
  const hasAnswer = Boolean(lastAnswer) && !preparing && !recording;
  return (
    <motion.section
      key="voice"
      id="td-voice-panel"
      className={
        "td-voice-stage" +
        (recording ? " is-demonstrating" : "") +
        (hasAnswer ? " has-answer" : "")
      }
      aria-labelledby="td-voice-title"
      initial={{ opacity: 0, transform: "translateY(8px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      exit={{ opacity: 0, transform: "translateY(-6px)" }}
      transition={{ duration: reduced ? 0 : 0.24, ease: [0.33, 1, 0.68, 1] }}
    >
      <motion.div
        layout
        transition={{ duration: reduced ? 0 : 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="td-voice-portrait"
        aria-hidden="true"
      >
        <span className="td-voice-aura" />
        <span className="td-voice-portrait-disc" />
        <Owl alt="" />
      </motion.div>
      <motion.div
        layout="position"
        transition={{ duration: reduced ? 0 : 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="td-voice-stage-copy"
      >
        <h2 id="td-voice-title">
          {recording
            ? "Vamos experimentar"
            : preparing
              ? "Um momento…"
              : hasAnswer
                ? "Sua resposta"
                : "Vamos conversar?"}
        </h2>
        <p>
          {recording
            ? "Veja uma pergunta de exemplo e acompanhe a resposta."
            : preparing
              ? "Já estou preparando sua resposta."
              : hasAnswer
                ? "A conversa também fica disponível em texto."
                : "Toque no microfone para começar. Pergunte sobre a matéria ou a faculdade."}
        </p>
      </motion.div>
      {recording ? (
        <div className="td-voice-example" role="status">
          <div className="td-voice-wave" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.09}s` }} />
            ))}
          </div>
          <span>Exemplo de pergunta</span>
          <p>“Me explique o que é comunicação assertiva.”</p>
        </div>
      ) : preparing ? (
        <p className="td-voice-preparing td-thinking-label" role="status">
          {phase === 0 ? "Entendendo sua pergunta" : "Preparando sua resposta"}
        </p>
      ) : hasAnswer ? (
        <div className="td-voice-reply">
          <p className="td-voice-question">{lastQuestion?.text}</p>
          <div
            className="td-voice-answer"
            tabIndex={0}
            role="region"
            aria-label="Resposta em texto"
            aria-live={answering ? "off" : "polite"}
          >
            {lastAnswer!.text.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {!busy ? (
            <button
              type="button"
              className="td-voice-transcript"
              onClick={onText}
            >
              <MessageSquare size={16} />
              Ver conversa em texto
              <ArrowRight size={16} />
            </button>
          ) : null}
        </div>
      ) : null}
    </motion.section>
  );
}
