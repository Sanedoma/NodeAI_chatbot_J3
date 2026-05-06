const documents = [
    "Le RAG permet d'utiliser des documents internes.",
    "Node.js est utilisé pour le backend.",
    "Les LLM peuvent utiliser des outils."
];

const ragTool = {
    type: "function",
    function: {
        name: "searchDocs",
        description: "Recherche des informations pertinentes dans une base interne pour aider à répondre à une question",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string" }
            },
            required: ["query"]
        }
    }
};

function searchDocs(query) {
    const words = query.toLowerCase().split(" ");

    const scored = documents.map(doc => {
        let score = 0;

        for (const word of words) {
            if (doc.toLowerCase().includes(word)) {
                score++;
            }
        }

        return { doc, score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => item.doc);
}

export { ragTool, searchDocs }