(async()=>{
 const report=[];
 const waitFor=async(condition,label)=>{const until=Date.now()+15000;while(!condition()){if(Date.now()>until)throw Error('Timeout: '+label);await new Promise(r=>setTimeout(r,40));}return true;};
 const visible=e=>e.getClientRects().length>0&&!e.closest('[inert]');
 const button=(label,root=document)=>[...root.querySelectorAll('button')].filter(visible).findLast(b=>b.getAttribute('aria-label')===label||b.textContent.trim()===label||b.innerText.trim()===label);
 const click=async label=>{const b=button(label);if(!b)throw Error('Missing button '+label);if(b.disabled)throw Error('Disabled '+label);b.click();await new Promise(r=>setTimeout(r,250));};
 const assert=(ok,label)=>{if(!ok)throw Error('Failed: '+label);report.push(label);};
 const setText=(input,text)=>{const proto=input instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(input,text);input.dispatchEvent(new Event('input',{bubbles:true}));};
 await click('Dúvidas acadêmicasEstude o conteúdo da sua disciplina com o material oficial da sala.');
 await click('Texto');const input=document.querySelector('#anchy-compositor');
 setText(input,'O que é comunicação assertiva?');await waitFor(()=>!button('Enviar').disabled,'input enabled');await click('Enviar');
 await waitFor(()=>document.body.textContent.includes('Que ótimo que você trouxe essa dúvida'),'chat response');assert(true,'Simulated chat response');
 await click('Boa resposta');assert(button('Boa resposta').getAttribute('aria-pressed')==='true','Feedback toggle');
 await click('Limpar');await waitFor(()=>button('Desfazer'),'undo toast');await click('Desfazer');assert(document.body.textContent.includes('Que ótimo'),'Clear and undo');
 await click('Voz');await click('Texto');assert(document.body.textContent.includes('Que ótimo'),'Conversation survives mode changes');
 await click('Caderno da disciplinaMapa mental, quiz, flashcards e fontes');await click('QuizQuestões A–E com correção comentada. Você escolhe quantidade e nível.');
 assert(document.querySelectorAll('section').length>0,'Mobile study tool opens');await click('Menos5 questões');await click('Fácil');await click('Começar quiz');
 await waitFor(()=>!!button('AConativa (ou apelativa).'),'quiz loaded');
 for(let i=0;i<5;i++){
   const candidates=[...document.querySelectorAll('button')].filter(visible).filter(b=>!b.disabled&&b.querySelector('span')?.textContent==='A');
   if(!candidates[0])throw Error('Quiz option '+i);candidates[0].click();await new Promise(r=>setTimeout(r,120));await click(i===4?'Ver resultado':'Próxima pergunta');
 }
 await waitFor(()=>document.body.textContent.includes('Quiz concluído'),'quiz result');assert(true,'Five-question quiz and feedback');await click('Voltar à conversa');
 await click('Caderno da disciplinaMapa mental, quiz, flashcards e fontes');await click('FlashcardsVire o cartão, diga se acertou e acompanhe seu desempenho.');
 await click('Qual é a origem etimológica e o significado básico da palavra comunicação?Toque para ver a resposta');
 await waitFor(()=>!!button('Voltar à pergunta'),'flip');await click('Entendi');assert(document.body.textContent.includes('Conceito dominado'),'Flashcard rating');await click('Próximo');assert(document.body.textContent.includes('2 de 5'),'Flashcard navigation');await click('Voltar à conversa');
 await click('Caderno da disciplinaMapa mental, quiz, flashcards e fontes');await click('Mapa mentalOs tópicos da disciplina num mapa que você explora e exporta.');await click('Gerar mapa mental');
 await waitFor(()=>document.querySelectorAll('.react-flow__node').length===10,'map ready');assert(true,'Mind map generated locally');await click('Expandir Processo e Elementos Comunicacionais');assert(document.querySelectorAll('.react-flow__node').length===12,'Map branch expansion');await click('Processo e Elementos Comunicacionais');assert(!!button('Fechar detalhe'),'Map detail');await click('Fechar detalhe');
 await click('Conversar com a Anchy');assert(!!document.querySelector('[aria-label="Conversa com a Anchy"]'),'Tool conversation panel');await click('Voltar ao Caderno');
 await click('Voltar à conversa');
 const before=document.documentElement.dataset.theme;await click(before==='dark'?'Usar tema claro':'Usar tema escuro');await waitFor(()=>document.documentElement.dataset.theme!==before,'theme');assert(true,'Theme toggle');
 const requests=performance.getEntriesByType('resource').map(e=>e.name).filter(name=>!name.startsWith(location.origin)&&!name.startsWith('data:')&&!name.startsWith('blob:'));
 assert(requests.length===0,'No external requests from local app');
 return {passed:report.length,checks:report,viewport:[innerWidth,innerHeight]};
})()
