(async()=>{
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const button=label=>[...document.querySelectorAll('button')].find(b=>b.getClientRects().length&&(b.getAttribute('aria-label')===label||b.textContent.trim()===label));
 const input=document.querySelector('#pergunta');
 if(!document.body.textContent.includes('Sem matéria selecionada'))throw Error('Contexto do app não está vazio');
 Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'Me explique comunicação assertiva');input.dispatchEvent(new Event('input',{bubbles:true}));await wait(100);button('Enviar pergunta').click();await wait(450);
 if(!document.body.textContent.includes('Qual matéria você está estudando?'))throw Error('Faltou pedir contexto');
 button('Escolher matéria').click();await wait(150);
 document.querySelector('dialog[open] .td-course-option').click();await wait(6500);
 if(!document.querySelector('.td-answer-text')?.textContent.includes('respeito'))throw Error('Pergunta não foi preservada');
 return {appEntry:'pede matéria apenas quando necessário e preserva a pergunta'};
})();
