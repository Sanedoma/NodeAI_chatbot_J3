import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function getEmbedding(text){
    const res = await fetch("https://api.mistral.ai/v1/embeddings", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
            model: "mistral-embed",
            input: text
        })
    });

    const data = await res.json();
    return data.data[0].embedding;
}


