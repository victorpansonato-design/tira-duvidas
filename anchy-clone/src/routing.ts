/** Front-end contract and deterministic fixtures. Production must authorize scope on the server. */
export type Domain = "study" | "institution";
export type Scope = "institution" | `course:${string}`;
export type Decision = Domain | "clarify" | "mixed" | "greeting";
export type Turn = { role: "user" | "assistant"; text: string };
export type Histories = Partial<Record<Scope, Turn[]>>;
export type Envelope = {
  destination: Domain;
  courseId: string | null;
  scope: Scope;
  history: Turn[];
  question: string;
};
export const course = {
  id: "communication",
  name: "Comunicação e Assertividade",
};
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function classifyQuestion(question: string): Decision {
  const text = normalize(question);
  if (/^(oi|ola|bom dia|boa tarde|boa noite|obrigad[oa])[!.\s]*$/.test(text))
    return "greeting";
  const institutional =
    /\b(atestado|matricula|rematricula|secretaria|boleto|mensalidade|financeiro|documento|carteirinha|certificado|calendario|horario de aula|horario das aulas|nota no|minhas notas|portal do aluno|acessar o ava|nao consigo acessar)\b/.test(
      text,
    ) ||
    /\b(quando|data|horario|onde|resultado)\b.*\b(prova|avaliacao|aula)\b/.test(
      text,
    );
  const calendarOnly =
    /\b(quando|data|horario|onde)\b.*\b(prova|avaliacao|aula)\b/.test(text) &&
    !/\b(explique|entender|estudar|revisar|resumo)\b/.test(text);
  const educational =
    !calendarOnly &&
    (/\b(assertiv[ao]|assertividade|comunicacao|conceito|conteudo|resumir|resumo|revisar|estudar|revisao|flashcards?|mapa mental|quiz|escuta ativa|linguagem)\b/.test(
      text,
    ) ||
      (!institutional &&
        /\b(entender|entendi|explique|explicar|explicacao)\b/.test(text)) ||
      /\b(prepare|ajude|estudar|revisar)\b.*\b(prova|avaliacao)\b/.test(text));
  if (institutional && educational) return "mixed";
  if (institutional) return "institution";
  if (educational) return "study";
  return "clarify";
}
export function createEnvelope(
  destination: Domain,
  courseId: string | null,
  histories: Histories,
  question: string,
): Envelope {
  if (destination === "study" && !courseId)
    throw new Error("Escolha uma matéria antes de consultar seu conteúdo.");
  const scope: Scope =
    destination === "institution" ? "institution" : `course:${courseId}`;
  return {
    destination,
    courseId: destination === "study" ? courseId : null,
    scope,
    history: (histories[scope] || []).map((turn) => ({ ...turn })),
    question,
  };
}
export function demoReply(request: Envelope): string {
  const text = normalize(request.question);
  if (request.destination === "institution") {
    if (/atestado|matricula|documento/.test(text))
      return "Posso te ajudar com essa solicitação. Você precisa do atestado de matrícula deste semestre ou de um período anterior?";
    if (/calendario|data|horario|prova/.test(text))
      return "Você quer consultar o calendário acadêmico ou confirmar o horário de uma aula específica? Me conte qual informação está procurando.";
    if (/boleto|mensalidade|financeiro/.test(text))
      return "Sua dúvida é sobre encontrar o boleto ou entender uma cobrança? Não é preciso enviar dados bancários por aqui.";
    return "Me conte um pouco mais sobre o que você precisa resolver na faculdade para continuarmos o atendimento.";
  }
  if (request.courseId !== course.id)
    return "Ainda não há material disponível para essa matéria. Escolha uma matéria com conteúdo para continuar.";
  if (/prova|revisar|revisao|estudar/.test(text))
    return "Vamos revisar por partes. Podemos começar por três pontos: expressar uma ideia com clareza, ouvir com atenção e respeitar o interlocutor.\n\nQual deles você gostaria de praticar primeiro? Você também pode usar o quiz para testar o que já entendeu.";
  if (/assertiv|comunicacao|escuta/.test(text))
    return "Comunicar-se de forma assertiva é expressar ideias e necessidades com clareza e respeito, sem impor sua opinião nem deixar de se posicionar.\n\nPor exemplo: em vez de “você nunca me escuta”, você pode dizer “gostaria de terminar minha ideia e depois ouvir o que você pensa”.\n\nO que muda entre essas duas formas de falar?";
  return "Vamos entender esse ponto juntos. Qual conceito de Comunicação e Assertividade está gerando dúvida? Se puder, descreva o trecho ou dê um exemplo para começarmos.";
}
