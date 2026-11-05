(async()=>{
 const visible=e=>e.getClientRects().length>0&&!e.closest('[inert]');
 const click=async label=>{const b=[...document.querySelectorAll('button')].filter(visible).findLast(b=>b.textContent.trim()===label||b.getAttribute('aria-label')===label||b.innerText.trim()===label);if(!b)throw Error('Missing '+label);b.click();await new Promise(r=>setTimeout(r,250));};
 await click('Caderno da disciplinaMapa mental, quiz, flashcards e fontes');
 await click('Mapa mentalOs tópicos da disciplina num mapa que você explora e exporta.');
 await click('Mais ações');
 let exported='';const original=HTMLAnchorElement.prototype.click;
 HTMLAnchorElement.prototype.click=function(){if(this.download==='mapa-mental.png'){exported=this.href;}else original.call(this);};
 try{await click('Exportar imagem');const until=Date.now()+15000;while(!exported&&Date.now()<until)await new Promise(r=>setTimeout(r,50));if(!exported.startsWith('data:image/png;base64,')||exported.length<1000)throw Error('No PNG export');return {pngExport:true,dataUrlLength:exported.length};}finally{HTMLAnchorElement.prototype.click=original;}
})()
