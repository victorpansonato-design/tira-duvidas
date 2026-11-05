(async()=>{
 for(let i=0;i<6;i++){
   const next=[...document.querySelectorAll('button')].find(b=>/^(Próxima pergunta|Ver resultado)$/.test(b.textContent.trim()));
   if(next)next.click();
   await new Promise(r=>setTimeout(r,350));
   const first=[...document.querySelectorAll('main button')].find(b=>!b.disabled && b.textContent.trim().startsWith('A') && b.querySelector('span')?.textContent.trim()==='A');
   if(first)first.click();
   await new Promise(r=>setTimeout(r,350));
 }
 return document.querySelector('main')?.innerText;
})()
