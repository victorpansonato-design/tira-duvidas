import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {dirname} from 'node:path';
// Prefer the installed CLI; a local npx cache can also supply it on Windows.
let exe=process.env.AGENT_BROWSER_BIN||'agent-browser';
if(!process.env.AGENT_BROWSER_BIN&&process.platform==='win32'){
  try{exe=execFileSync('where.exe',['agent-browser'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim().split(/\r?\n/)[0];}
  catch{const cache=process.env.LOCALAPPDATA+'/npm-cache/_npx';if(existsSync(cache)){const found=readdirSync(cache).map(name=>cache+'/'+name+'/node_modules/agent-browser/bin/agent-browser-win32-x64.exe').filter(existsSync);if(found.length)exe=found[found.length-1];}}
}
const args = process.argv.slice(2);
const localIndex=args.indexOf('--local');
const session=localIndex!==-1?'anchy-local':process.env.ANCHY_BROWSER_SESSION||'anchy-original';
if(localIndex!==-1)args.splice(localIndex,1);
if(session==='anchy-original'&&process.env.ANCHY_ORIGINAL_CDP) {
  execFileSync(process.execPath,['tools/focus-browser.mjs',process.env.ANCHY_ORIGINAL_CDP],{stdio:'ignore'});
  await new Promise(r=>setTimeout(r,400));
}
const saveIndex = args.indexOf('--save');
let save;
if (saveIndex !== -1) {save = args[saveIndex+1]; args.splice(saveIndex,2);}
const fileIndex = args.indexOf('--script');
let input;
if (fileIndex !== -1) {input = readFileSync(args[fileIndex+1], 'utf8'); args.splice(fileIndex, 2, '--stdin');}
const output = execFileSync(exe, ['--session', session, ...args], {input,encoding:'utf8',maxBuffer:20*1024*1024});
if(save) {mkdirSync(dirname(save),{recursive:true}); writeFileSync(save,output); console.log('Saved '+save);} else process.stdout.write(output);
