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

async function getWeather({ city }) {
    // wttr.in : API météo publique, format JSON, aucune clé requise
    const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    if (!response.ok) {
        return { error: `Impossible de récupérer la météo pour ${city}` };
    }
    const data = await response.json();
    const current = data.current_condition[0];
    return {
        city,
        temperature_c: current.temp_C,
        feels_like_c: current.FeelsLikeC,
        description: current.weatherDesc[0].value,
        humidity: current.humidity + '%',
        wind_kmph: current.windspeedKmph
    };
}
export { weatherTool, getWeather };