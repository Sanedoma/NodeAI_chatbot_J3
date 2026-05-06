const calculateTool = [{
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
}];

function calculate(expression) {
    try {
        // Utilisation de eval pour cet exercice pédagogique
        // Dans un projet réel, utilisez une bibliothèque comme mathjs
        return eval(expression).toString();
    } catch (error) {
        return `Erreur de calcul: ${error.message}`;
    }
}

export { calculateTool, calculate };
