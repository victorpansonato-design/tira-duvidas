(async()=>{
 const host=[...document.querySelectorAll('*')].find(e=>e.shadowRoot);if(!host)throw Error('Widget missing');const root=host.shadowRoot;
 const menu=root.querySelector('[aria-label="Abrir histórico de conversas"]');menu.click();await new Promise(r=>setTimeout(r,80));if(!root.querySelector('[aria-label="Histórico de conversas"]'))throw Error('History missing');root.querySelector('[aria-label="Fechar histórico"]').click();
 const input=root.querySelector('[aria-label="Mensagem"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'Onde vejo o calendário?');input.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,80));root.querySelector('form').requestSubmit();await new Promise(r=>setTimeout(r,1300));if(!root.textContent.includes('Você pode consultar essas informações'))throw Error('Simulation missing');
 const external=performance.getEntriesByType('resource').filter(e=>!e.name.startsWith(location.origin)&&!e.name.startsWith('data:')&&!e.name.startsWith('blob:'));if(external.length)throw Error('External request');return{institutionalLocalSimulation:true,historyToggle:true,externalRequests:0};
})()
