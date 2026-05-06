import { getEmbedding } from "./pinecone/embedding.js";
import { simpleChunk } from "./pinecone/chunk.js";
import { upsertChunks } from "./pinecone/upsert.js";

const documents = [
    "Le RAG permet d'utiliser des documents internes.",
    "Node.js est utilisé pour le backend.",
    "Les LLM peuvent utiliser des outils."
];


async function run() {
    const chunks = documents.flatMap((doc) => simpleChunk(doc));
    const embeddings = [];
    for (const chunk of chunks){
        embeddings.push(await getEmbedding(chunk));
    }

    await upsertChunks(chunks, embeddings);
}

run()