import {writeFileSync} from 'node:fs';
const url='https://videos.pexels.com/video-files/6930462/6930462-uhd_2160_3840_25fps.mp4';
const response=await fetch(url);if(!response.ok)throw Error('Video request: '+response.status);
writeFileSync('reference/td-video-source.mp4',Buffer.from(await response.arrayBuffer()));
console.log('Downloaded public study footage');
