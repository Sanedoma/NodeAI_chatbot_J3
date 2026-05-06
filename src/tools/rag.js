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
        description: "Recherche dans les documents internes",
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
    const context = results
        .map(r => r.metadata?.text)
        .join("\n\n");

    console.log("Context du chats:\n", context);

    const response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [
                    {
                        role: "system",
                        content: "Réponds uniquement avec le contexte fourni. si l'info n'est pas présente, signal le."
                    },
                    {
                        role: 'user',
                        content: `Context: \n${context}\n\nQuestions: ${query}`
                    }
                ]
            })
        }
    );

    const data = await response.json()
    return data.choices[0].message.content;
}



export { ragTool, searchDocs };


