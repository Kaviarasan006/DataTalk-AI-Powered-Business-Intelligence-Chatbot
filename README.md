# DataTalk — AI Business Intelligence Chatbot

> Upload any CSV or Excel file and chat with your data in plain English.  
> Get instant Plotly charts, AI insights, and Power BI-ready Excel reports.

---

## Features

- **Natural Language to Data** — Ask questions like "Which product had the highest revenue in Q3?" and get instant results
- **Auto Charts** — Bar, line, pie, scatter — the AI picks the best chart type automatically
- **AI Insights** — Plain-English explanations of every result
- **Excel BI Reports** — Export formatted multi-sheet Excel reports with charts and statistics
- **Conversation Memory** — Follow-up questions like "now filter by North region only" work seamlessly
- **Dark/Light Mode** — Toggle from the sidebar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Plotly.js, Axios, Lucide Icons |
| Backend | FastAPI, Python 3.11 |
| AI/LLM | Google Gemini 1.5 Flash (via LangChain) |
| Data Engine | Pandas, DuckDB |
| Visualizations | Plotly Express |
| Excel Export | openpyxl (multi-sheet, charts, formatting) |
| Deployment | Docker + Docker Compose |

---

## Setup (Local)

### Step 1 — Get a Grok API Key (Free)

1. Go to https://console.groq.com/keys
2. Click "Create API Key"
3. Copy the key

### Step 2 — Configure environment

Open `backend/.env` and replace the placeholder:

```
GROQ_API_KEY="your grok api key here"
```

### Step 3 — Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Step 4 — Start the Frontend

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000

---

## Setup (Docker — Recommended)

```bash
# Add your Gemini key to backend/.env first, then:
docker-compose up --build
```

Open http://localhost:3000

---

## How to Use

1. **Upload** your CSV or Excel file by dragging onto the upload zone
2. **Ask questions** in plain English:
   - "Show total revenue by category as a bar chart"
   - "Which salesperson closed the most deals?"
   - "What is the monthly trend of sales?"
   - "Find the top 5 products by profit margin"
   - "Compare performance across regions"
3. **Export** a full Excel report with the "Export Excel Report" button

---

## Sample Dataset

A sample sales dataset is included at `sample_data/sales_data.csv` with:
- 48 orders across 6 months
- Categories: Electronics, Clothing, Food, Home
- Regions: North, South, East, West
- Fields: Revenue, Profit, Discount, Quantity, Salesperson

---

## Project Structure

```
datatalk/
├── backend/
│   ├── main.py              # FastAPI app — upload, query, export
│   ├── requirements.txt
│   ├── .env                 # Add your Gemini API key here
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.js           # Full React app with chat UI
│   │   └── App.css          # Dark/light theme CSS
│   ├── public/index.html
│   ├── package.json
│   └── Dockerfile
├── sample_data/
│   └── sales_data.csv       # Test dataset
├── docker-compose.yml
└── README.md
```

---

## Extending the Project (Phase 2 Ideas)

- Add **PostgreSQL** support — connect to a real database instead of CSV upload
- Add **Power BI .pbix export** using `semantic-link` library
- Add **RAG on metadata** — let users ask "what data do I have?" before querying
- Add **multi-file joins** — upload two CSVs and ask questions across both
- Add **user authentication** with JWT and per-user session storage
- Deploy to **Render / Railway / AWS** with persistent storage

---

Built for Final Year Project — AI & Data Science
