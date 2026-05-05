import 'dotenv/config';

const tools = {
    type: 'function',
    function: {
        name: 'calculate',
        description: 'Evalue une expression mathématique. A utiliser pour tout calcul arithmétique.',
        parameters: {
            type: 'object',
            properties: {
                expression: {
                    type: 'string',
                    description: "l'expression mathématique (ex: '2**32' ou '15 * 24')"
                }
            },
            required: ['expression']
        }
    }
}

function calculate(expression) {
    try {
        return eval(expression).toString();
    } catch (error) {
        return `Erreur de calcul: ${error.message}`;
    }
}

async function callWithTools(userMessage) {
    const messages = [{ role: 'user', content: userMessage }];

    try {
        const reponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
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

        const data = await reponse.json();
        let message = data.choices[0].message;

        if (message.tool_calls) {
            console.log(` l'acgent utilise un outil`);
        }

        messages.push(message);

        for (const toolCall of message.tool_calls) {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.args);
            switch (functionName) {
                case 'calculate':
                    const result = calculate(args.expression);
                    messages.push({
                        role: 'tool',
                        name: functionName,
                        content: result,
                        tool_call_id: toolCall.id
                    });
                    const secondReponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: 'mistral-small-latest',
                            messages,
                        })
                    });

                    const secondData = await secondReponse.json();
                    console.log("Réponse Final :", secondData.choices[0].message.content);
                default:
                    console.log('Reponse Direct :', message.content)
            }
        }

    } catch (error) {
        console.error("Erreur lors de l'appel API :", error);
    }
}


callWithTools('Combien fait 2 à la puissance 32 ? Et 15 fois 24 ?');