import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { Ask, discipline, focus, Primary, ThemeButton, Owl } from "./ui";
import type { Tool } from "./ui";
import { cards, quizQuestions } from "./demo";
import { MindMap } from "./MindMap";

type Props = {
  active: Tool | null;
  onBack: () => void;
  chatOpen: boolean;
  onChat: () => void;
  onAsk: (text: string) => void;
};
export function StudyTools(props: Props) {
  return (
    <>
      {(["quiz", "cards", "mindmap"] as const).map((tool) => (
        <div key={tool} className={props.active === tool ? "h-full" : "hidden"}>
          {tool === "quiz" ? (
            <Quiz {...props} />
          ) : tool === "cards" ? (
            <Flashcards {...props} />
          ) : (
            <MindMap {...props} />
          )}
        </div>
      ))}
    </>
  );
}
export function ToolPanel({
  title,
  subtitle,
  children,
  extra,
  progress,
  fullHeader,
  ...props
}: Props & {
  title: string;
  subtitle?: string;
  children: ReactNode;
  extra?: ReactNode;
  progress?: ReactNode;
  fullHeader?: ReactNode;
}) {
  if (fullHeader)
    return (
      <section className="flex flex-col bg-surface overflow-hidden h-full">
        {fullHeader}
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </section>
    );
  return (
    <section className="flex flex-col bg-surface overflow-hidden fixed inset-0 z-[60] lg:static lg:z-auto lg:h-full lg:rounded-panel">
      <div className="hidden lg:flex h-16 shrink-0 items-center gap-3 pl-3 pr-4 border-b border-line">
        <button
          type="button"
          onClick={props.onBack}
          className={
            "h-11 px-3 rounded-full inline-flex items-center gap-2 text-[15px] font-semibold text-ink hover:bg-surface-2 transition-colors " +
            focus
          }
        >
          <ArrowLeft size={20} />
          Voltar à conversa
        </button>
        <span className="w-px h-6 bg-line" />
        <h2 className="flex-1 min-w-0 truncate text-[17px] font-bold text-ink">
          {title}
          {subtitle ? (
            <span className="text-[15px] font-medium text-ink-muted">
              {" "}
              · {subtitle}
            </span>
          ) : null}
        </h2>
        {progress}
        {extra}
        <button
          type="button"
          aria-pressed={props.chatOpen}
          onClick={props.onChat}
          className={
            "h-11 px-4 rounded-full inline-flex items-center gap-2 text-[15px] font-semibold border transition-colors " +
            (props.chatOpen
              ? "bg-soft border-link text-link"
              : "bg-surface border-line text-ink hover:bg-surface-2") +
            " " +
            focus
          }
        >
          <MessageCircle size={18} />
          Anchy
        </button>
      </div>
      <div className="flex lg:hidden h-[76px] shrink-0 items-center gap-2 px-2 bg-surface border-b border-line">
        <button
          type="button"
          aria-label="Voltar à conversa"
          onClick={props.onBack}
          className={
            "w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink hover:bg-surface-2 " +
            focus
          }
        >
          <ArrowLeft />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[19px] font-bold text-ink truncate">
            {title}
            {subtitle && title !== "Mapa mental" ? " · " + subtitle : ""}
          </h2>
          <p className="text-sm text-ink-muted truncate">{discipline}</p>
        </div>
        <button
          type="button"
          aria-label="Conversar com a Anchy"
          aria-pressed={props.chatOpen}
          onClick={props.onChat}
          className={
            "w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink hover:bg-surface-2 " +
            focus
          }
        >
          <MessageCircle />
        </button>
        <ThemeButton plain />
      </div>
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </section>
  );
}
function Quiz(props: Props) {
  const [count, setCount] = useState(10);
  const [level, setLevel] = useState("Médio");
  const [stage, setStage] = useState<
    "config" | "loading" | "question" | "feedback" | "result"
  >("config");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const question = quizQuestions[index % quizQuestions.length];
  const answer = answers[index];
  const correct = answer === question.correct;
  const score = answers.reduce(
    (sum, answer, i) =>
      sum + Number(answer === quizQuestions[i % quizQuestions.length].correct),
    0,
  );
  const start = () => {
    setStage("loading");
    setIndex(0);
    setAnswers([]);
    setTimeout(() => setStage("question"), 1200);
  };
  const progress =
    stage === "question" ? (
      <div
        role="img"
        aria-label={`Pergunta ${index + 1} de ${count}. ${answers.length} respondidas, ${score} certas.`}
        className="flex items-center gap-1.5"
      >
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={
              "h-2.5 rounded-full transition-[width,background-color] " +
              (i === index
                ? "w-6 bg-anchy-blue"
                : i < answers.length
                  ? "w-2.5 bg-anchy-blue"
                  : "w-2.5 bg-line")
            }
          />
        ))}
      </div>
    ) : null;
  return (
    <ToolPanel
      {...props}
      title="Quiz"
      subtitle={
        stage === "config"
          ? "Configurar"
          : stage === "question"
            ? `Pergunta ${index + 1} de ${count}`
            : stage === "result"
              ? "Resultado"
              : stage === "feedback"
                ? "Feedback"
                : undefined
      }
      progress={progress}
    >
      {stage === "config" ? (
        <div className="flex-1 flex flex-col px-5 py-6 lg:px-[78px] lg:py-8 overflow-y-auto">
          <h3 className="text-[22px] lg:text-[28px] font-bold text-ink">
            Avalie seu domínio sobre o conteúdo
          </h3>
          <p className="mt-2 text-base text-ink-muted">
            A Anchy monta as perguntas com base no material da disciplina e
            comenta cada resposta.
          </p>
          <h4 className="mt-8 mb-3 text-base font-semibold text-ink">
            Número de questões
          </h4>
          <div className="flex flex-col lg:flex-row gap-3">
            {[5, 10, 20].map((value, i) => (
              <button
                type="button"
                key={value}
                aria-pressed={count === value}
                onClick={() => setCount(value)}
                className={
                  "relative flex-1 rounded-card text-left px-5 transition-colors h-16 flex items-center justify-between lg:h-24 lg:flex-col lg:items-start lg:justify-center " +
                  (count === value
                    ? "border-2 border-anchy-blue bg-soft"
                    : "border border-line bg-surface hover:bg-surface-2") +
                  " " +
                  focus
                }
              >
                <span className="text-[15px] text-ink-muted">
                  {["Menos", "Padrão", "Mais"][i]}
                </span>
                <span className="text-lg lg:text-xl font-bold text-ink">
                  {value} questões
                </span>
                {count === value ? (
                  <span className="absolute top-3 right-3 hidden lg:flex w-6 h-6 rounded-full bg-anchy-blue text-on-blue items-center justify-center">
                    <Check size={16} />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <h4 className="mt-8 mb-3 text-base font-semibold text-ink">
            Nível de dificuldade
          </h4>
          <div
            role="group"
            aria-label="Nível de dificuldade"
            className="flex h-[52px] w-full lg:w-[420px] p-1 rounded-full bg-surface-2"
          >
            {["Fácil", "Médio", "Difícil"].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={level === value}
                onClick={() => setLevel(value)}
                className={
                  "relative flex-1 rounded-full inline-flex items-center justify-center gap-1.5 text-[15px] font-semibold transition-colors " +
                  (level === value
                    ? "text-on-blue"
                    : "text-ink hover:text-link") +
                  " " +
                  focus
                }
              >
                {level === value ? (
                  <>
                    <motion.span
                      layoutId="quiz-level"
                      className="absolute inset-0 rounded-full bg-anchy-blue"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 36,
                      }}
                    />
                    <Check className="relative w-4 h-4" />
                  </>
                ) : null}
                <span className="relative">{value}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-8" />
          <Primary onClick={start} className="w-full lg:w-auto lg:self-start">
            Começar quiz
          </Primary>
        </div>
      ) : null}
      {stage === "loading" ? (
        <StudyLoading
          title="Preparando seu quiz…"
          text="A Anchy está criando perguntas a partir do material da disciplina."
        />
      ) : null}
      {stage === "question" ? (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-h-0 overflow-y-auto px-5 py-5 lg:px-12 lg:py-7"
        >
          <div className="lg:hidden mb-4">{progress}</div>
          <h3 className="text-xl lg:text-[22px] font-semibold leading-snug text-ink">
            {question.question}
          </h3>
          <div className="mt-5 flex flex-col gap-2.5">
            {question.options.map((option, i) => {
              const letter = String.fromCharCode(65 + i);
              const right = answer !== undefined && i === question.correct;
              const wrong = answer === i && !right;
              return (
                <motion.button
                  type="button"
                  key={letter}
                  disabled={answer !== undefined}
                  onClick={() => setAnswers((previous) => [...previous, i])}
                  animate={
                    right || wrong ? { scale: [1, 1.02, 1] } : { scale: 1 }
                  }
                  className={
                    "w-full min-h-[50px] lg:min-h-[52px] rounded-2xl flex items-center gap-3.5 py-2 pl-2 pr-4 text-left transition-colors " +
                    (right
                      ? "bg-ok-soft border-2 border-ok-texto"
                      : wrong
                        ? "bg-erro-soft border-2 border-erro"
                        : "bg-surface border border-line " +
                          (answer === undefined
                            ? "hover:border-anchy-blue"
                            : "opacity-50")) +
                    " " +
                    focus
                  }
                >
                  <span
                    className={
                      "w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center text-base font-bold " +
                      (right
                        ? "bg-ok-texto text-surface"
                        : wrong
                          ? "bg-erro text-on-erro"
                          : "bg-soft text-link")
                    }
                  >
                    {letter}
                  </span>
                  <span className="flex-1 min-w-0 text-base leading-[1.35] text-ink">
                    {option}
                  </span>
                  {right || wrong ? (
                    <span
                      className={
                        "shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold " +
                        (right ? "text-ok-texto" : "text-erro")
                      }
                    >
                      {right ? <Check size={20} /> : <X size={20} />}
                      <span className="hidden lg:inline">
                        {right ? "Resposta certa" : "Sua resposta"}
                      </span>
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
          {answer !== undefined ? (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                "mt-4 rounded-card px-5 py-[18px] " +
                (correct ? "bg-ok-soft" : "bg-erro-soft")
              }
            >
              <p
                className={
                  "flex items-center gap-2 text-[17px] font-bold " +
                  (correct ? "text-ok-texto" : "text-erro")
                }
              >
                {correct ? <Check size={20} /> : <X size={20} />}{" "}
                {correct
                  ? "Correto!"
                  : `Incorreto. A resposta certa era ${String.fromCharCode(65 + question.correct)}.`}
              </p>
              <p className="mt-1.5 text-base leading-normal text-ink">
                {question.explanation}
              </p>
              <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <Ask
                  onClick={() =>
                    props.onAsk("Me ajude a entender: " + question.question)
                  }
                  className="w-full lg:w-auto"
                />
                <Primary
                  onClick={() => {
                    if (index + 1 >= count) {
                      setStage("feedback");
                      setTimeout(() => setStage("result"), 1000);
                    } else setIndex((i) => i + 1);
                  }}
                  className="w-full lg:w-auto"
                >
                  {index + 1 >= count ? "Ver resultado" : "Próxima pergunta"}
                </Primary>
              </div>
            </motion.div>
          ) : null}
        </motion.div>
      ) : null}
      {stage === "feedback" ? (
        <StudyLoading
          title="Preparando seu feedback…"
          text="A Anchy está analisando suas respostas para te dar um retorno personalizado."
        />
      ) : null}
      {stage === "result" ? (
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-5 py-8 lg:py-10 text-center">
          <span className="rounded-full bg-soft flex items-center justify-center shrink-0 result-owl">
            <Owl alt="" className="result-owl-image" />
          </span>
          <div>
            <h3 className="mt-5 text-2xl lg:text-[28px] font-bold text-ink">
              Quiz concluído
            </h3>
            <p className="mt-2 text-base text-ink-muted">
              Veja seu desempenho e as recomendações da Anchy.
            </p>
          </div>
          <div className="mt-6 w-full max-w-[640px] flex flex-col items-center">
            <section className="w-full rounded-card bg-surface-2 p-6 text-left">
              <h4 className="flex items-center gap-2 text-[17px] font-bold text-link">
                <MessageCircle size={20} />
                Feedback da Anchy
              </h4>
              <div className="mt-3 space-y-3 text-base leading-relaxed text-ink">
                <p>
                  Olá, estudante UniAnchieta! 🎓💙 Que alegria ver sua dedicação
                  e empenho nesta etapa da disciplina de Comunicação e
                  Assertividade! 🌟👏
                </p>
                <p>
                  Você já dominou a iniciativa e o compromisso de testar seus
                  conhecimentos, que é o passo mais importante para quem quer
                  crescer profissionalmente! 🚀📚 Os testes servem exatamente
                  como uma bússola para mostrar onde focar a energia agora. 🧭✨
                </p>
                <p>
                  Para conquistar o domínio completo dos temas, recomendo
                  revisar com carinho estes pontos e autores chave:
                </p>
                <p>
                  🔹 Funções da Linguagem: foque na Função Fática, usada para
                  testar ou manter o canal de contato aberto! 📞💬
                </p>
                <p>
                  🔹 Ruídos na Comunicação: explore como barreiras culturais e
                  de interpretação geram ruídos semânticos! 🌍 Gestos mudam de
                  significado pelo mundo! 🤝
                </p>
                <p>
                  🔹 Comunicação assertiva: pratique a expressão de ideias com
                  clareza, objetividade e respeito.
                </p>
                <p>
                  🔹 Escuta ativa: preste atenção e confirme o que foi
                  compreendido.
                </p>
                <p>
                  Errar faz parte do caminho do aprendizado e te deixa ainda
                  mais forte e preparado! 🌈💪 Revise o material com calma e
                  brilhe nas próximas etapas!
                </p>
              </div>
            </section>
            <Primary onClick={props.onBack} className="mt-6 w-full lg:w-auto">
              Voltar à conversa
            </Primary>
          </div>
        </div>
      ) : null}
    </ToolPanel>
  );
}
export function StudyLoading({ title, text }: { title: string; text: string }) {
  return (
    <div
      role="status"
      className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4"
    >
      <div className="study-spinner" />
      <h3 className="text-[22px] font-bold text-ink">{title}</h3>
      <p className="text-base text-ink-muted max-w-sm">{text}</p>
    </div>
  );
}
function Flashcards(props: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<number, boolean>>({});
  const card = cards[index];
  const go = (next: number) => {
    setIndex(next);
    setFlipped(false);
  };
  const rate = (understood: boolean) => {
    setRatings((v) => ({ ...v, [index]: understood }));
  };
  const navClass =
    "h-[52px] px-5 rounded-full inline-flex items-center justify-center gap-2 text-base font-bold transition-colors disabled:opacity-45 disabled:pointer-events-none " +
    focus;
  const previous = (
    <button
      type="button"
      disabled={index === 0}
      onClick={() => go(index - 1)}
      className={
        navClass + " bg-surface border border-line text-ink hover:bg-surface-2"
      }
    >
      <ArrowLeft size={20} />
      Anterior
    </button>
  );
  const next = (
    <button
      type="button"
      disabled={index === cards.length - 1}
      onClick={() => go(index + 1)}
      className={
        navClass + " bg-surface border border-line text-ink hover:bg-surface-2"
      }
    >
      Próximo
      <ArrowRight size={20} />
    </button>
  );
  const no = (
    <button
      type="button"
      aria-pressed={ratings[index] === false}
      onClick={() => rate(false)}
      className={
        navClass +
        (ratings[index] === false
          ? " bg-erro border-2 border-erro text-on-erro"
          : " bg-surface border-2 border-erro text-erro hover:bg-erro-soft")
      }
    >
      <X size={20} />
      Não entendi
    </button>
  );
  const yes = (
    <button
      type="button"
      aria-pressed={ratings[index] === true}
      onClick={() => rate(true)}
      className={
        navClass +
        (ratings[index] === true
          ? " bg-ok-texto border-2 border-ok-texto text-surface"
          : " bg-surface border-2 border-ok-texto text-ok-texto hover:bg-ok-soft")
      }
    >
      <Check size={20} />
      Entendi
    </button>
  );
  return (
    <ToolPanel
      {...props}
      title="Flashcards"
      subtitle={`${index + 1} de ${cards.length}`}
    >
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center gap-5 px-4 py-6">
        <p className="text-[15px] text-ink-muted text-center">
          Toque no cartão para ver a resposta. Depois diga se entendeu.
        </p>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[358px] h-[440px] lg:max-w-[560px] lg:h-[373px] relative touch-pan-y"
          style={{ perspective: 1400 }}
          onPanEnd={(_, info) => {
            if (info.offset.x < -70 && index < cards.length - 1) go(index + 1);
            if (info.offset.x > 70 && index > 0) go(index - 1);
          }}
        >
          {ratings[index] !== undefined ? (
            <div
              className={
                "w-full h-full rounded-panel border-2 p-6 flex flex-col items-center text-center shadow-float " +
                (ratings[index]
                  ? "bg-ok-soft border-ok-texto"
                  : "bg-erro-soft border-erro")
              }
            >
              <span
                className={
                  "h-8 px-4 rounded-full inline-flex items-center gap-2 text-[15px] font-bold " +
                  (ratings[index]
                    ? "bg-ok-texto text-surface"
                    : "bg-erro text-on-erro")
                }
              >
                {ratings[index] ? <Check size={16} /> : <X size={16} />}{" "}
                {ratings[index] ? "Conceito dominado" : "Quase lá"}
              </span>
              <p className="mt-3 text-[15px] text-ink">
                {ratings[index]
                  ? "Ótimo, este ficou fixado."
                  : "Vale reforçar este ponto. Tente explicar em voz alta com suas palavras."}
              </p>
              <p className="flex-1 flex items-center text-xl lg:text-2xl font-semibold leading-snug text-ink">
                {card.q}
              </p>
            </div>
          ) : (
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
              className="relative w-full h-full preserve-3d"
            >
              <div className="absolute inset-0 backface-hidden" inert={flipped}>
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  className={
                    "absolute inset-0 rounded-panel bg-surface border border-line shadow-float p-6 flex flex-col items-center text-center " +
                    focus
                  }
                >
                  <span className="flex-1 flex items-center text-xl lg:text-2xl font-semibold leading-snug text-ink">
                    {card.q}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
                    <RotateCcw size={16} />
                    Toque para ver a resposta
                  </span>
                </button>
              </div>
              <div
                className="absolute inset-0 backface-hidden"
                inert={!flipped}
                style={{ transform: "rotateY(180deg)" }}
              >
                <div className="absolute inset-0 rounded-panel bg-surface border border-line shadow-float p-6 flex flex-col items-center text-center">
                  <span className="text-sm font-semibold text-ink-muted">
                    Resposta
                  </span>
                  <p className="flex-1 flex items-center text-lg lg:text-xl leading-normal text-ink">
                    {card.a}
                  </p>
                  <div className="w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setFlipped(false)}
                      className={
                        "h-11 px-3 rounded-full inline-flex items-center gap-2 text-[15px] font-medium text-ink-muted hover:bg-surface-2 " +
                        focus
                      }
                    >
                      <RotateCcw size={16} />
                      Voltar à pergunta
                    </button>
                    <Ask
                      onClick={() => props.onAsk(card.q)}
                      className="card-ask"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        <div className="hidden lg:flex items-center gap-3">
          {previous}
          {no}
          {yes}
          {next}
        </div>
        <div className="lg:hidden w-full max-w-[358px] grid grid-cols-2 gap-3">
          {no}
          {yes}
          {previous}
          {next}
        </div>
      </div>
    </ToolPanel>
  );
}
