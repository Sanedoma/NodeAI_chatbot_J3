const webSearchTool = {
    type: "function",
    function: {
        name: "webSearch",
        description: "Recherche des informations récentes sur le web et renvoie des résultats pertinents",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string" }
            },
            required: ["query"]
        }
    }
};

function decodeHtmlEntities(text) {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([\da-fA-F]+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function stripHtml(text) {
    return decodeHtmlEntities(
        text
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    );
}

function normalizeDuckDuckGoUrl(href) {
    const url = new URL(href, 'https://duckduckgo.com');
    return url.searchParams.get('uddg') || url.href;
}

function extractSearchResults(html) {
    const anchorMatches = [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];

    return anchorMatches.slice(0, 5).map((match, index) => {
        const nextAnchorIndex = anchorMatches[index + 1]?.index ?? html.length;
        const chunk = html.slice(match.index + match[0].length, nextAnchorIndex);
        const snippetMatch = chunk.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|div|span)>/i);

        return {
            title: stripHtml(match[2]),
            url: normalizeDuckDuckGoUrl(match[1]),
            text: snippetMatch ? stripHtml(snippetMatch[1]) : ''
        };
    }).filter(result => result.title || result.text);
}

async function webSearchfunct(query) {
    if (!query || !query.trim()) {
        return { message: 'Requete de recherche vide.' };
    }

    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (educational project)' }
        });

        if (!response.ok) {
            return { message: `Recherche web indisponible (${response.status}).` };
        }

        const html = await response.text();
        const results = extractSearchResults(html);

        if (results.length > 0) {
            return results.map(result => ({
                title: result.title,
                text: result.text || result.title,
                url: result.url
            }));
        }

        return { message: 'Aucun resultat trouve pour cette requete.' };
    } catch (error) {
        return { message: `Recherche web indisponible: ${error.message}` };
    }
}

export { webSearchfunct, webSearchTool };