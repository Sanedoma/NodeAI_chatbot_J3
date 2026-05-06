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

const tools = [
    weatherTool,
    webSearchTool,
    ragTool,
    calculateTool
];
const toolsFunctions = [getWeather, webSearchfunct, searchDocs, calculate];


async function runAgent(userInput) {

    if (userInput) {
        messages.push({ role: 'user', content: userInput });
    }

    let iterations = 0;

    while (iterations < 10) {
        iterations++;

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages,
                tools,
                tool_choice: 'auto'
            })
        });

        const data = await response.json();
        const message = data.choices[0].message;

        messages.push(message);

        // ✅ FIN
        if (data.choices[0].finish_reason === "stop") {
            return message.content;
        }

        // ✅ TOOL CALLS
        if (data.choices[0].finish_reason === "tool_calls") {

            const toolResults = await Promise.all(
                message.tool_calls.map(async (toolCall) => {

                    const args = JSON.parse(toolCall.function.arguments);
                    let result;

                    console.log("🔧 TOOL :", toolCall.function.name, args);

                    switch (toolCall.function.name) {

                        case "getWeather":
                            result = await getWeather(args);
                            break;

                        case "webSearch":
                            result = await webSearchfunct(args.query);
                            break;

                        case "searchDocs":
                            const docs = searchDocs(args.query);
                            result = docs.length > 0
                                ? docs
                                : { message: "Aucune info interne" };
                            break;

                        case "calculate":
                            result = calculate(args);
                            break;

                        default:
                            result = { error: "Tool inconnu" };
                    }

                    return {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(result)
                    };
                })
            );

            messages.push(...toolResults);
        }
    }

    return "Erreur : boucle infinie évitée.";
}


while (true) {
    const userInput = readlineSync.question("User: ");
    if (userInput === "code:breaker") break;
    const response = await runAgent(userInput);
    console.log("Agent: ", response);
}