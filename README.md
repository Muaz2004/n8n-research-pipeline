# n8n Research Pipeline

A minimal, focused research ingestion pipeline workspace connecting a lightweight dark-themed web form to an n8n workflow, the Tavily Search API, an LLM report generator, and automated email review dispatch via Gmail.

## Workspace Structure

```
/home/muaz/projects/n8n-research-pipeline/
├── index.html        # Minimalist single-column input form (no card containers)
├── style.css         # Dark slate theme styling with emerald green accent
├── app.js            # Form submission handler dispatching JSON to n8n webhook
├── workflow.json     # n8n workflow (Webhook -> Tavily -> LLM -> Gmail)
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
python3 -m http.server 3000 --directory /home/muaz/projects/n8n-research-pipeline
```
Then open `http://localhost:3000` in your browser.

---

## 2. n8n Workflow (`workflow.json`)

### Workflow Architecture
1. **Webhook Trigger Node (`n8n-nodes-base.webhook`)**:
   - Method: `POST`
   - Path: `research-request`
   - Receives JSON payload with `topic`, `subtopics`, `description`, `reviewer_email`.

2. **HTTP Request Node (`n8n-nodes-base.httpRequest`)**:
   - Endpoint: `https://api.tavily.com/search`
   - Method: `POST`
   - Query Expression: `={{ $json.body?.topic || $json.topic }}`
   - Options: `advanced` search depth with `include_answer: true`.

3. **LLM Node (`n8n-nodes-base.openAi`)**:
   - Ingests both the Tavily search results and original request parameters (`topic`, `subtopics`, `description`).
   - Generates an HTML-only research report utilizing semantic markup: `<h1>`, `<h2>`, `<p>`, and unordered lists (`<ul>`, `<li>`).
   - Produces raw semantic HTML ready for email rendering (no markdown code blocks).

4. **Gmail Node (`n8n-nodes-base.gmail`)**:
   - Sends the HTML report directly to `reviewer_email`.
   - Includes review instructions at the top:
     > *Please review this report and reply with either 'APPROVED' or 'FEEDBACK: [comments]'.*
   - Embeds `reportHtml` within the email body.

### Importing into n8n
1. Open your n8n web interface (e.g. `http://localhost:5678`).
2. Go to **Workflows** &rarr; click **...** (top right) &rarr; **Import from File**.
3. Select [workflow.json](file:///home/muaz/projects/n8n-research-pipeline/workflow.json).
4. Configure credentials:
   - Tavily API key: in environment variable `TAVILY_API_KEY` or in the HTTP Request node.
   - OpenAI account credentials for the LLM node.
   - Gmail OAuth2 credentials for the Gmail node.
5. Activate the workflow.
