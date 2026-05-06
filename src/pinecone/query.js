import fetch from "node-fetch";
import dotenv from "dotenv";
import { getEmbedding } from "./embedding.js";

dotenv.config();


export async function searchSimilar( question, topK = 3 ) {

    const vector = await getEmbedding(question);

    const res = await fetch(
        `${process.env.PINECONE_INDEX_HOST}/query`,
        {
            method: 'POST',
            headers: {
                "Api-Key": process.env.PINECONE_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                vector,
                topK,
                includeMetadata: true
            })
        }
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Pinecone query ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return data.matches || [];
}