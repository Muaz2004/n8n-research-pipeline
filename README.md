# n8n Research Pipeline

A minimal, focused research ingestion pipeline workspace connecting a lightweight dark-themed web form to an n8n workflow and the Tavily Search API.

## Workspace Structure

```
/home/muaz/projects/n8n-research-pipeline/
├── index.html        # Minimalist single-column input form (no card containers)
├── style.css         # Dark slate theme styling with emerald green accent
├── app.js            # Form submission handler dispatching JSON to n8n webhook
├── workflow.json     # Initial n8n workflow definition (Webhook -> Tavily HTTP Request)
└── README.md         # Setup and usage documentation
```

---

## 1. Web Form Interface

### Features
- **Design Specifications**: Minimalist, dark-themed UI featuring a deep dark slate palette (`#0b1120`, `#0f172a`, `#1e293b`) with emerald green accent highlights (`#10b981`).
- **Layout**: Single-column stacked vertical layout with no card containers, bounding boxes, or card shadows. Form fields flow directly within the document canvas.
- **Fields Collected**:
  - `topic`: Primary query string passed directly to the search provider.
  - `subtopics`: Auxiliary domains or secondary angles for targeted search expansion.
  - `description`: Detailed research context, criteria, or constraints.
  - `reviewer_email`: Email address for downstream alert and review stages.
- **Client Logic (`app.js`)**: Asynchronously submits the JSON payload via `fetch` to the configured n8n webhook and displays responsive, minimalist feedback.

### Quick Preview
To serve the form locally:
```bash
cd /home/muaz/projects/n8n-research-pipeline
python3 -m http.server 3000
```
Then open `http://localhost:3000` in your browser.

To target a specific n8n webhook URL on launch:
```
http://localhost:3000/?webhook=http://localhost:5678/webhook/research-request
```

---

## 2. n8n Workflow (`workflow.json`)

### Workflow Architecture
1. **Webhook Trigger Node (`n8n-nodes-base.webhook`)**:
   - Method: `POST`
   - Path: `research-request`
   - Test Webhook URL: `http://<n8n-host>:5678/webhook-test/research-request`
   - Production Webhook URL: `http://<n8n-host>:5678/webhook/research-request`
   - Receives JSON payload with `topic`, `subtopics`, `description`, `reviewer_email`.

2. **HTTP Request Node (`n8n-nodes-base.httpRequest`)**:
   - Endpoint: `https://api.tavily.com/search`
   - Method: `POST`
   - Headers: `Content-Type: application/json`
   - Body parameters:
     - `query`: `={{ $json.body?.topic || $json.topic }}`
     - `api_key`: `={{ $env.TAVILY_API_KEY || 'YOUR_TAVILY_API_KEY' }}`
     - `search_depth`: `advanced`
     - `include_answer`: `true`
     - `max_results`: `5`

### Importing into n8n
1. Open your n8n web interface (e.g. `http://localhost:5678`).
2. Go to **Workflows** &rarr; click the **...** menu (top right) &rarr; **Import from File**.
3. Select [workflow.json](file:///home/muaz/projects/n8n-research-pipeline/workflow.json).
4. Set your Tavily API Key either as an environment variable (`TAVILY_API_KEY`) or replace `YOUR_TAVILY_API_KEY` in the HTTP Request node parameters.
5. Activate the workflow or click **Test workflow**.
