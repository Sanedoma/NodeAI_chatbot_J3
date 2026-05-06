const calculateTool = {
    type: 'function',
    function: {
        name: 'calculate',
        description: 'Effectue un calcul mathématique',
        parameters: {
            type: 'object',
            properties: {
                expression: { type: 'string' }
            },
            required: ['expression']
        }
    }
};

function calculate({ expression }) {
    try {
        return { result: eval(expression) };
    } catch (e) {
        return { error: e.message };
    }
}

export { calculateTool, calculate };
