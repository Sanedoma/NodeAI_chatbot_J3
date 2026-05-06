import { searchSimilar } from "../pinecone/query.js";

const documents = [
    "Le RAG permet d'utiliser des documents internes.",
    "Node.js est utilisé pour le backend.",
    "Les LLM peuvent utiliser des outils."
];

const ragTool = {
    type: "function",
    function: {
        name: "searchDocs",
        description: "Recherche les passages pertinents dans les documents internes",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string" }
            },
            required: ["query"]
        }
    }
};

async function searchDocs(query) {
    const results = await searchSimilar(query);
    const relevantResults = results.filter(result => (result.score ?? 0) >= 0.75);
    const context = relevantResults
        .map(result => result.metadata?.text)
        .filter(Boolean)
        .join("\n\n");

    if (!context) {
        return "";
    }

    console.log("Context du chats:\n", context);
    return context;
}



export { ragTool, searchDocs };


