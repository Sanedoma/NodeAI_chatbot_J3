import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export function simpleChunk(text, size = 50){
    const words = text.split(" ");
    const chunks =[];

    for (let i = 0; i < words.length; i += size){
        chunks.push(words.slice(i, i + size).join(" "));
    }

    return chunks;
}
