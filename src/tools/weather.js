const weatherTool = [
    {
        type: "function",
        function: {
            name: "getWeather",
            description: "Donne la météo d'une ville",
            parameters: {
                type: "object",
                properties: {
                    city: { type: "string" }
                },
                required: ["city"]
            }
        }
    }
];

function getWeather(city) {
    return `
        La météo à ${city} est ensoleillée avec une température de 25°C
    `;
}

export { weatherTool, getWeather };