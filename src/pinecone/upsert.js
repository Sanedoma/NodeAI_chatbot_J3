import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function upsertChunks(chunks, embeddings){

    const vectors =  chunks.map( (chunk, i) => ({
        id: `chunk-${i}`,
        values: embeddings[i],
        metadata: { text: chunk }
    }) );

    const res = await fetch(
        `${process.env.PINECONE_INDEX_HOST}/vectors/upsert`,
        {
            method: "POST",
            headers: {
                "Api-Key": process.env.PINECONE_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ vectors })
        }
    );

    const raw = await res.text();
    let data = {};
    if (raw) {
        try {
            data = JSON.parse(raw);
        } catch {
            data = { raw };
        }
    }

    if (!res.ok) {
        throw new Error(`Pinecone upsert ${res.status}: ${JSON.stringify(data) || raw}`);
    }

    console.log("Upsert:", data);
}