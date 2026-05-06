const webSearchTool = [
    {
        type: "function",
        function: {
            name: "webSearch",
            description: "Recherche sur le web",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string" }
                },
                required: ["query"]
            }
        }
    }
]

function webSearchfunct(query) {
    return " resultat de la recherche " + query + " est en ligne";
}

export { webSearchfunct, webSearchTool };