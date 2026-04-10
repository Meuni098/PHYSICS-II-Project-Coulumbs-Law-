const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, 'CARS_AI.env');

function loadEnvFile(filePath) {
    const encodings = ['utf8', 'utf16le'];
    for (const encoding of encodings) {
        try {
            const raw = fs.readFileSync(filePath, { encoding });
            const parsed = dotenv.parse(raw);
            if (Object.keys(parsed).length > 0) {
                Object.assign(process.env, parsed);
                return;
            }
        } catch (_err) {
            // Try the next encoding.
        }
    }
}

loadEnvFile(envPath);

const app = express();
const PORT = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY =
    process.env.OPENROUTER_API_KEY ||
    process.env.API_KEY ||
    process.env.API_BASE_URL;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

app.get('/health', (_req, res) => {
    res.json({
        ok: true,
        model: OPENROUTER_MODEL,
        keyLoaded: Boolean(OPENROUTER_API_KEY),
    });
});

app.post('/api/ai', async (req, res) => {
    if (!OPENROUTER_API_KEY) {
        return res.status(500).json({
            error: 'OpenRouter key is missing. Put OPENROUTER_API_KEY (or API_BASE_URL fallback) in CARS_AI.env.',
        });
    }

    const prompt = String(req.body?.prompt || '').trim();
    const imageDataUrl = typeof req.body?.imageDataUrl === 'string'
        ? req.body.imageDataUrl.trim()
        : '';
    const context = req.body?.context;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    const systemPrompt = [
        'You are a concise physics tutor focused on electrostatics.',
        'Use the provided simulation context when relevant.',
        'Give practical guidance and keep explanations readable for students.',
        'Do not use Markdown headers (like ###) or heavy formatting.',
        'When writing values, never duplicate signs (avoid patterns like "- -3.2").',
        'Prefer short, clear paragraphs and at most 3 numbered steps when needed.',
    ].join(' ');

    const userMessage = `Student question: ${prompt}\n\nSimulation context (JSON):\n${JSON.stringify(context || {}, null, 2)}`;

    const userContent = imageDataUrl
        ? [
            { type: 'text', text: userMessage },
            { type: 'image_url', image_url: { url: imageDataUrl } },
        ]
        : userMessage;

    try {
        const openRouterRes = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost',
                'X-Title': 'Physics Coulomb Assistant',
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent },
                ],
                temperature: 0.4,
            }),
        });

        const payload = await openRouterRes.json();
        if (!openRouterRes.ok) {
            return res.status(openRouterRes.status).json({
                error: payload?.error?.message || payload?.error || 'OpenRouter request failed.',
            });
        }

        const answer = payload?.choices?.[0]?.message?.content || 'No response generated.';
        return res.json({
            answer,
            model: payload?.model || OPENROUTER_MODEL,
        });
    } catch (err) {
        return res.status(500).json({
            error: `Server error: ${err.message}`,
        });
    }
});

app.listen(PORT, () => {
    console.log(`OpenRouter proxy listening on http://localhost:${PORT}`);
});
