import {readFileSync,renameSync,writeFileSync} from 'node:fs';
const path='anchy-clone/public/assets/fonts.css';let css=readFileSync(path,'utf8');
if(css.includes("format('truetype')")){for(let i=0;i<5;i++)renameSync('anchy-clone/public/assets/inter-'+i+'.woff2','anchy-clone/public/assets/inter-'+i+'.ttf');css=css.replaceAll('.woff2','.ttf');writeFileSync(path,css);}
let script=readFileSync('tools/download-fonts.mjs','utf8');script=script.replace("const urls=[...new Set", "const extension=css.includes(\"format('truetype')\")?'ttf':'woff2';const urls=[...new Set").replaceAll("'+i+'.woff2'","'+i+'.'+extension");writeFileSync('tools/download-fonts.mjs',script);
console.log('Font extensions now match the downloaded TrueType format');
