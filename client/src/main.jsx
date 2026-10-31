
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Code2, GitPullRequest, ShieldCheck, Sparkles,
  ArrowRight, CheckCircle2, XCircle, Terminal, Info
} from 'lucide-react';
import './style.css';

function App() {
  const [scenarios, setScenarios] = useState([]);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [code, setCode] = useState(
    'function add(a, b) {\n  return a - b;\n}'
  );
  const [issue, setIssue] = useState(
    'The function should add two numbers, not subtract them.'
  );
  const [fixResult, setFixResult] = useState(null);
  const [fixBusy, setFixBusy] = useState(false);
  const [fixError, setFixError] = useState('');

  useEffect(() => {
    fetch('/api/scenarios')
      .then(async r => {
        if (!r.ok) throw new Error('API unavailable');
        return r.json();
      })
      .then(s => {
        setScenarios(s);
        setSelected(s[0]?.id || '');
      })
      .catch(e => setError(e.message));
  }, []);

  const active = scenarios.find(s => s.id === selected);

  async function analyze() {
    setBusy(true);
    setError('');
    setResult(null);

    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: selected })
      });

      if (!r.ok) {
        throw new Error(`Analysis request failed (${r.status})`);
      }

      const data = await r.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function generateFix() {
    setFixBusy(true);
    setFixError('');
    setFixResult(null);

    try {
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, issue })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Request failed');
      }

      setFixResult(data);
    } catch (e) {
      setFixError(e.message);
    } finally {
      setFixBusy(false);
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Code2 size={19} /></div>
          <span>FixForge</span>
        </div>

        <div className="side-label">WORKSPACE</div>

        <div className="nav active">
          <GitPullRequest size={17} /> Debug workspace
        </div>

        <div className="nav">
          <ShieldCheck size={17} /> Controlled validation
        </div>

        <div className="side-bottom">
          <span className="dot"/>
            FixForge
          <small>Gemini-powered JavaScript debugging</small>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <div className="eyebrow">DEVELOPER TOOLS / DEBUGGING</div>
            <h1>Debug with clarity.</h1>
            <p className="sub">
              Investigate JavaScript bugs, review AI-generated fixes,
              and validate predefined scenarios.
            </p>
          </div>

          <span className="pill">
            <Sparkles size={14} /> AI-assisted
          </span>
        </header>

        {/* CUSTOM AI DEBUGGER */}
        <section className="panel">
          <div className="section-top">
            <div>
              <div className="section-label">01 / AI CODE FIXER</div>
              <h2>Fix your JavaScript code</h2>
            </div>
            <span className="pill">
              <Sparkles size={14} /> Gemini
            </span>
          </div>

          <p className="sub small">
            Paste JavaScript code and describe the bug.
            Gemini will suggest a corrected implementation.
          </p>

          <div className="custom-editor">
            <label htmlFor="code-input">JavaScript code</label>
            <textarea
              id="code-input"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              rows={10}
              placeholder="Paste your JavaScript code here..."
            />

            <label htmlFor="issue-input">Bug description</label>
            <textarea
              id="issue-input"
              value={issue}
              onChange={e => setIssue(e.target.value)}
              rows={3}
              placeholder="Describe what is wrong with your code..."
            />
          </div>

          <button
            className="primary"
            disabled={fixBusy || !code.trim() || !issue.trim()}
            onClick={generateFix}
          >
            {fixBusy ? 'Generating fix...' : 'Generate AI Fix'}
            <ArrowRight size={17} />
          </button>

          {fixError && (
            <div className="error">{fixError}</div>
          )}

          {fixResult && (
            <div className="custom-result">
              <h2>AI-generated correction</h2>

              <div className="code-grid">
                <div>
                  <div className="code-title">
                    <XCircle size={15} /> Original
                  </div>
                  <pre><code>{fixResult.originalCode}</code></pre>
                </div>

                <div>
                  <div className="code-title fixed">
                    <CheckCircle2 size={15} /> Suggested fix
                  </div>
                  <pre><code>{fixResult.fixedCode}</code></pre>
                </div>
              </div>

              <h2>Gemini explanation</h2>
              <p className="explanation">{fixResult.explanation}</p>

              <p className="note">
                <Info size={15} />
                AI-generated suggestion — not automatically tested or verified.
              </p>
            </div>
          )}
        </section>

        {/* PREDEFINED DEBUGGING SCENARIOS */}
        <section className="panel">
          <div className="section-top">
            <div>
              <div className="section-label">02 / SELECT ISSUE</div>
              <h2>Choose a debugging scenario</h2>
            </div>
            <span className="muted">{scenarios.length} fixtures</span>
          </div>

          <div className="options">
            {scenarios.map(s => (
              <button
                key={s.id}
                className={'option ' + (selected === s.id ? 'selected' : '')}
                onClick={() => {
                  setSelected(s.id);
                  setResult(null);
                }}
              >
                <span className="option-title">{s.title}</span>
                <span className="option-meta">{s.category}</span>
              </button>
            ))}
          </div>

          <div className="issue">
            <strong>Bug report</strong>
            <p>{active?.issue || 'Loading scenarios...'}</p>
          </div>

          <button
            className="primary"
            disabled={busy || !selected}
            onClick={analyze}
          >
            {busy ? 'Analyzing...' : 'Analyze & validate fix'}
            <ArrowRight size={17} />
          </button>
        </section>

        {error && <div className="error">{error}</div>}

        {result && (
          <>
            <section className="panel">
              <div className="section-label">03 / CODE REVIEW</div>
              <h2>Proposed fix</h2>

              <p className="sub small">
                Compare the original implementation with the corrected fixture.
              </p>

              <div className="code-grid">
                <div>
                  <div className="code-title">
                    <XCircle size={15} /> Original
                  </div>
                  <pre><code>{result.original}</code></pre>
                </div>

                <div>
                  <div className="code-title fixed">
                    <CheckCircle2 size={15} /> Patched
                  </div>
                  <pre><code>{result.fixed}</code></pre>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="section-label">04 / VALIDATION</div>
              <h2>Automated test results</h2>

              <div className="stats">
                <div>
                  <span>Before patch</span>
                  <strong>
                    {result.summary.beforePassed}/{result.summary.total}
                  </strong>
                </div>

                <div>
                  <span>After patch</span>
                  <strong className="green">
                    {result.summary.afterPassed}/{result.summary.total}
                  </strong>
                </div>

                <div>
                  <span>Validation</span>
                  <strong className="status">Controlled</strong>
                </div>
              </div>

              <div className="test-list">
                {result.after.map(t => (
                  <div className="test" key={t.name}>
                    <CheckCircle2
                      size={17}
                      className={t.passed ? 'green' : 'red'}
                    />
                    <span>{t.name}</span>
                    <strong>{t.passed ? 'PASS' : 'FAIL'}</strong>
                  </div>
                ))}
              </div>

              <p className="note">
                <Info size={15} /> {result.validation}
              </p>
            </section>

            <section className="panel">
              <div className="section-label">05 / EXPLANATION</div>
              <h2>Root cause analysis</h2>

              <p className="explanation">{result.ai.text}</p>

              <div className="ai-tag">
                {result.ai.mode === 'gemini'
                  ? 'Generated with Gemini'
                  : 'Deterministic explanation'}
                {result.ai.warning ? ' · API fallback' : ''}
              </div>
            </section>
          </>
        )}

        <footer>
          <Terminal size={15} />
          Built for reproducible debugging · No arbitrary code execution
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
