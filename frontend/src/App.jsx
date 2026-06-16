import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import {
  Upload, Send, Download, Database, Sparkles,
  BarChart2, Table2, Code2, ChevronDown, ChevronUp,
  FileSpreadsheet, Zap, TrendingUp, AlertCircle, X, Moon, Sun
} from "lucide-react";
import "./App.css";

const API = "http://localhost:8000";

function App() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dark, setDark] = useState(true);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef();
  const chatRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      addSystemMsg("❌ Only CSV and Excel (.xlsx, .xls) files are supported.", "error");
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await axios.post(`${API}/upload`, form);
      setSession(data);
      setMessages([]);
      addSystemMsg(
        `✅ **${data.filename}** loaded — ${data.rows.toLocaleString()} rows × ${data.columns.length} columns.\n\nAsk me anything about your data!`,
        "success"
      );
    } catch (e) {
      addSystemMsg(`❌ Upload failed: ${e.response?.data?.detail || e.message}`, "error");
    }
    setUploading(false);
  };

  const addSystemMsg = (text, type = "info") => {
    setMessages((m) => [...m, { role: "system", text, type, id: Date.now() }]);
  };

  const sendQuestion = async () => {
    const q = input.trim();
    if (!q || !session || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q, id: Date.now() }]);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/query`, {
        session_id: session.session_id,
        question: q,
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", id: Date.now(), ...data },
      ]);
    } catch (e) {
      addSystemMsg(`❌ ${e.response?.data?.detail || "Query failed. Try rephrasing."}`, "error");
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const exportExcel = async () => {
    if (!session) return;
    setExporting(true);
    try {
      const res = await axios.post(
        `${API}/export/excel`,
        { session_id: session.session_id },
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DataTalk_Report_${session.filename?.split(".")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      addSystemMsg("❌ Export failed.", "error");
    }
    setExporting(false);
  };

  const suggestions = [
    "Show total sales by category",
    "Which month had the highest revenue?",
    "Top 10 products by quantity sold",
    "Show monthly trend as a line chart",
    "What is the average order value?",
    "Find any outliers in the data",
  ];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Zap size={22} className="brand-icon" />
          <span className="brand-name">DataTalk</span>
        </div>

        <div
          className={`upload-zone ${dragging ? "dragging" : ""} ${uploading ? "uploading" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current.click()}
        >
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" hidden onChange={(e) => handleFile(e.target.files[0])} />
          {uploading ? (
            <div className="upload-loading"><div className="spinner" /><span>Processing...</span></div>
          ) : (
            <>
              <Upload size={28} className="upload-icon" />
              <p className="upload-title">{session ? "Upload new file" : "Drop your data here"}</p>
              <p className="upload-sub">CSV or Excel · any size</p>
            </>
          )}
        </div>

        {session && (
          <div className="session-info">
            <div className="session-header">
              <Database size={14} />
              <span className="session-filename">{session.filename}</span>
            </div>
            <div className="session-meta">
              <span>{session.rows?.toLocaleString()} rows</span>
              <span>·</span>
              <span>{session.columns?.length} columns</span>
            </div>
            <div className="schema-list">
              {session.columns?.map((col) => (
                <div key={col} className="schema-col">
                  <span className="col-name">{col}</span>
                  <span className="col-type">{session.schema?.[col]?.type?.replace("object", "text").replace("int64", "int").replace("float64", "float")}</span>
                </div>
              ))}
            </div>
            <button className="export-btn" onClick={exportExcel} disabled={exporting}>
              <Download size={14} />
              {exporting ? "Exporting..." : "Export Excel Report"}
            </button>
          </div>
        )}

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={() => setDark(!dark)}>
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="chat-area" ref={chatRef}>
          {messages.length === 0 && !session && (
            <div className="empty-state">
              <div className="empty-hero">
                <Sparkles size={48} className="empty-icon" />
                <h1>Chat with your data</h1>
                <p>Upload a CSV or Excel file, then ask questions in plain English.<br />Get instant charts, insights, and Power BI-ready reports.</p>
              </div>
              <div className="feature-grid">
                {[
                  { icon: <BarChart2 size={20} />, title: "Auto Charts", desc: "Bar, line, pie — AI picks the best" },
                  { icon: <TrendingUp size={20} />, title: "AI Insights", desc: "Plain-English explanations" },
                  { icon: <FileSpreadsheet size={20} />, title: "Excel Export", desc: "Formatted BI-ready reports" },
                  { icon: <Database size={20} />, title: "Any Data", desc: "Sales, HR, finance, more" },
                ].map((f) => (
                  <div key={f.title} className="feature-card">
                    <div className="feature-icon">{f.icon}</div>
                    <div className="feature-text">
                      <strong>{f.title}</strong>
                      <span>{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.length === 0 && session && (
            <div className="suggestions-area">
              <p className="suggestions-label">Try asking:</p>
              <div className="suggestions-grid">
                {suggestions.map((s) => (
                  <button key={s} className="suggestion-chip" onClick={() => { setInput(s); inputRef.current?.focus(); }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} dark={dark} />
          ))}

          {loading && (
            <div className="msg-row assistant">
              <div className="msg-bubble assistant">
                <div className="thinking">
                  <span /><span /><span />
                </div>
                <span className="thinking-label">Analyzing your data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="input-area">
          <div className={`input-box ${!session ? "disabled" : ""}`}>
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder={session ? "Ask anything about your data..." : "Upload a file to start chatting..."}
              value={input}
              disabled={!session || loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuestion(); } }}
              rows={1}
            />
            <button
              className={`send-btn ${(!input.trim() || !session || loading) ? "disabled" : ""}`}
              onClick={sendQuestion}
              disabled={!input.trim() || !session || loading}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </main>
    </div>
  );
}

function Message({ msg, dark }) {
  const [showCode, setShowCode] = useState(false);
  const [showTable, setShowTable] = useState(false);

  if (msg.role === "user") {
    return (
      <div className="msg-row user">
        <div className="msg-bubble user">{msg.text}</div>
      </div>
    );
  }

  if (msg.role === "system") {
    return (
      <div className={`msg-row system ${msg.type}`}>
        <div className={`msg-bubble system ${msg.type}`}>
          <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }} />
        </div>
      </div>
    );
  }

  // Assistant message
  const chartData = msg.chart ? JSON.parse(msg.chart) : null;
  const layout = chartData?.layout || {};
  const themedLayout = {
    ...layout,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Inter, sans-serif", size: 12, color: dark ? "#94a3b8" : "#475569" },
    title: { ...layout.title, font: { size: 15, color: dark ? "#e2e8f0" : "#1e293b" } },
    xaxis: { ...layout.xaxis, gridcolor: dark ? "#1e293b" : "#f1f5f9", tickcolor: dark ? "#475569" : "#94a3b8" },
    yaxis: { ...layout.yaxis, gridcolor: dark ? "#1e293b" : "#f1f5f9", tickcolor: dark ? "#475569" : "#94a3b8" },
    margin: { l: 50, r: 20, t: 50, b: 50 },
  };

  return (
    <div className="msg-row assistant">
      <div className="msg-bubble assistant">
        {/* Insight */}
        <div className="insight-block">
          <Sparkles size={14} className="insight-icon" />
          <p className="insight-text">{msg.insight}</p>
        </div>

        {/* Chart */}
        {chartData && (
          <div className="chart-wrap">
            <Plot
              data={chartData.data}
              layout={themedLayout}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%", height: "340px" }}
            />
          </div>
        )}

        {/* Table toggle */}
        {msg.table && msg.table.length > 0 && (
          <div className="result-section">
            <button className="toggle-btn" onClick={() => setShowTable(!showTable)}>
              <Table2 size={13} />
              {showTable ? "Hide" : "Show"} data table ({msg.row_count} rows)
              {showTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showTable && (
              <div className="table-wrap">
                <table className="result-table">
                  <thead>
                    <tr>{msg.columns?.map((c) => <th key={c}>{c.replace(/_/g, " ")}</th>)}</tr>
                  </thead>
                  <tbody>
                    {msg.table.slice(0, 20).map((row, i) => (
                      <tr key={i}>{msg.columns?.map((c) => <td key={c}>{row[c] ?? "—"}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Code toggle */}
        {msg.code && (
          <div className="result-section">
            <button className="toggle-btn" onClick={() => setShowCode(!showCode)}>
              <Code2 size={13} />
              {showCode ? "Hide" : "Show"} generated code
              {showCode ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showCode && (
              <pre className="code-block"><code>{msg.code}</code></pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
