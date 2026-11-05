import {mkdirSync,writeFileSync} from 'node:fs';
mkdirSync('anchy-clone/public/assets',{recursive:true});
const assets=['logo-unianchieta-Cqc7_wQ6.webp','logo_dark_mode-CS6ykYrL.png','logo-BxiGImZO.png'];
await Promise.all(assets.map(async name=>{const r=await fetch('https://app.anchieta.br/anchy/assets/'+name);if(!r.ok) throw new Error(r.status);writeFileSync('anchy-clone/public/assets/'+name,Buffer.from(await r.arrayBuffer()));}));
const js=await fetch('https://app.anchieta.br/anchy/assets/index-Bu0U-71x.js');writeFileSync('reference/original-bundle.js',await js.text());
console.log('Public visual assets downloaded');
