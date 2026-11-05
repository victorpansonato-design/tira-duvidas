import {writeFileSync} from 'node:fs';
const r=await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',{headers:{'User-Agent':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'}});
let css=await r.text();const extension=css.includes("format('truetype')")?'ttf':'woff2';const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))];
await Promise.all(urls.map(async(url,i)=>{const r=await fetch(url);if(!r.ok)throw Error('Font download failed');writeFileSync('anchy-clone/public/assets/inter-'+i+'.'+extension,Buffer.from(await r.arrayBuffer()));css=css.split(url).join('/assets/inter-'+i+'.'+extension);}));
writeFileSync('anchy-clone/public/assets/fonts.css',css);console.log('Saved '+urls.length+' font subsets');
