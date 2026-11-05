import assert from 'node:assert/strict';
import {classifyQuestion,createEnvelope} from '../anchy-clone/src/routing.ts';

const cases=[
 ['Oi!','greeting'],['Olá','greeting'],
 ['Me explique comunicação assertiva','study'],
 ['O que é escuta ativa?','study'],
 ['Me ajude a revisar para a prova','study'],
 ['Faça um resumo do conteúdo','study'],
 ['Onde peço meu atestado de matrícula?','institution'],
 ['Explique como pegar meu atestado de matrícula','institution'],
 ['Como acesso o boleto?','institution'],
 ['Onde vejo o calendário acadêmico?','institution'],
 ['Quando é a prova de Comunicação?','institution'],
 ['Qual o horário das aulas?','institution'],
 ['Não consigo acessar o AVA','institution'],
 ['Me explique assertividade e onde peço meu atestado','mixed'],
 ['Quero um resumo da matéria e meu boleto','mixed'],
 ['Preciso de ajuda','clarify'],['Quero falar sobre minha nota','clarify'],
 ['Pode me ajudar com uma questão?','clarify'],
];
for(const [question,expected] of cases)assert.equal(classifyQuestion(question),expected,question);
const histories={institution:[{role:'user',text:'Boleto privado'}], 'course:a':[{role:'user',text:'Conceito A'}], 'course:b':[{role:'user',text:'Conceito B'}]};
assert.deepEqual(createEnvelope('study','a',histories,'Pergunta').history,histories['course:a']);
const institution=createEnvelope('institution','a',histories,'Documento');
assert.equal(institution.courseId,null);
assert.deepEqual(institution.history,histories.institution);
assert.deepEqual(createEnvelope('study','c',histories,'Pergunta').history,[]);
assert.throws(()=>createEnvelope('study',null,histories,'Pergunta'));
institution.history[0].text='Outro texto';
assert.equal(histories.institution[0].text,'Boleto privado');
console.log(`${cases.length} casos de intenção e 5 verificações de isolamento passaram.`);
