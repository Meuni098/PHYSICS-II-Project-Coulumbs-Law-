# Physics Coulomb Project + OpenRouter AI

This project now includes a local AI backend that uses your `CARS_AI.env` file and forwards requests to OpenRouter securely.

## 1) Install dependencies

```bash
npm install
```

## 2) Configure env file

Use `CARS_AI.env` and make sure one of these contains your key:

- `OPENROUTER_API_KEY` (recommended)
- `API_KEY`
- `API_BASE_URL` (fallback supported for your current file)

Optional:

- `OPENROUTER_MODEL=openai/gpt-4o-mini`
- `PORT=8787`

## 3) Start the AI proxy

```bash
npm start
```

Health check:

```bash
http://localhost:8787/health
```

## 4) Open the app

Open `index.html` and use the **Physics AI** box in the right panel.

The frontend sends your question plus current simulation context to:

- `POST http://localhost:8787/api/ai`

Your key stays on the server side and is never exposed in browser JavaScript.