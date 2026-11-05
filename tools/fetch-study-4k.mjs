import {writeFileSync} from 'node:fs';
const url='https://videos.pexels.com/video-files/9034460/9034460-uhd_3840_2160_24fps.mp4';
const response=await fetch(url);
if(!response.ok)throw Error('Video request: '+response.status);
writeFileSync('reference/td-study-source-4k.mp4',Buffer.from(await response.arrayBuffer()));
console.log('Downloaded 4K landscape footage from Pexels / RDNE Stock project.');
