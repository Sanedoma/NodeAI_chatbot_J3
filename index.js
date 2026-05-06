import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { weatherTool, getWeather } from './src/tools/weather.js';
import { webSearchTool, webSearchfunct } from './src/tools/webSearch.js';
import { ragTool, searchDocs } from './src/tools/rag.js';
import { calculateTool, calculate } from './src/tools/calculate.js';
import readlineSync from 'readline-sync';

dotenv.config();

const messages = [
    {
        role: 'system', content: `
        Tu es une IA précise.

        Quand tu reçois du contexte (tool RAG), tu DOIS :
        - t'appuyer dessus
        - ne pas inventer
        - répondre uniquement avec ces informations si elles existent. 

        voici les Règle que tu dois suivre :
        1. Si des documents internes existent → utilise-les
        2. Sinon → utilise le web
        3. Sinon → répond normalement
    ` },
];

const tools = [weatherTool, webSearchTool, ragTool, calculateTool];


async function chat(userInput) {
    if (userInput) {
        messages.push({ role: 'user', content: userInput });
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
            model: 'mistral-small-latest',
            messages,
            tools
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Mistral Error ${response.status} : ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    // 🧠 TOOL CALLS EN PARALLÈLE
    if (message.tool_calls) {
        // On ajoute le message de l'assistant (qui contient les appels d'outils) UNE SEULE FOIS
        messages.push(message);

        const toolResults = await Promise.all(
            message.tool_calls.map(async (toolCall) => {
                const args = JSON.parse(toolCall.function.arguments);
                let result;

                console.log("TOOL UTILISÉ :", toolCall.function.name);

                switch (toolCall.function.name) {
                    case "getWeather":
                        // getWeather attend maintenant un objet { city }
                        result = await getWeather({ city: args.city });
                        break;

                    case "webSearch":
                        result = await webSearchfunct(args.query);
                        break;

                    case "searchDocs":
                        const docs = searchDocs(args.query);
                        if (docs.length === 0) {
                            result = "Aucune information trouvée dans la base interne.";
                        } else {
                            result = `Contexte Interne:\n${docs.join("\n")}\n\nUtilise ces informations pour répondre à la question utilisateur.`;
                        }
                        break;

                    case "calculate":
                        result = calculate(args.expression);
                        break;

                    default:
                        result = "Tool inconnu";
                }

                return {
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: typeof result === 'string' ? result : JSON.stringify(result)
                };
            })
        );

        // On ajoute tous les résultats d'un coup
        messages.push(...toolResults);

        return await chat(); // relance sans input
    }

    messages.push({ role: "assistant", content: message.content });

    return message.content;
}


while (true) {
    const userInput = readlineSync.question("User: ");
    if (userInput === "code:breaker") break;
    const response = await chat(userInput);
    console.log("Agent: ", response);
}