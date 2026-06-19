import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, Brain, ArrowRight, CheckCircle2, ChevronRight, PenTool } from 'lucide-react';

function Ideate({ setActivePipelineId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const [pipelineId, setPipelineId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const keywordParam = searchParams.get('keyword');
    if (keywordParam) {
      setTopic(keywordParam);
      // Auto-trigger generation if coming from dashboard quick-launch
      triggerIdeate(keywordParam);
    }
  }, [searchParams]);

  const triggerIdeate = async (keywordToUse) => {
    const activeKeyword = keywordToUse || topic;
    if (!activeKeyword.trim()) return;

    setLoading(true);
    setError('');
    setBrief(null);

    try {
      const res = await fetch(`${API_URL}/api/ideate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: activeKeyword }),
      });
      const data = await res.json();
      
      if (res.ok && data.brief) {
        setBrief(data.brief);
        setPipelineId(data.pipeline_id);
        setActivePipelineId(data.pipeline_id);
      } else {
        setError(data.error || 'Failed to generate ideas. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = () => {
    if (pipelineId) {
      navigate('/create');
    }
  };

  return (
    <div className="ideate-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Ideation Desk</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Analyze trends and generate structured content hooks, talking points, and video scripts.</p>
        </div>
      </div>

      {/* Input panel */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label" htmlFor="topic-field">Brainstorm Topic / Target Keyword</label>
            <input
              id="topic-field"
              type="text"
              className="text-input"
              placeholder="e.g. AI tools for productivity, high ticket sales strategies, daily coding tips"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            className="btn-primary" 
            style={{ padding: '14px 28px', height: '52px' }} 
            onClick={() => triggerIdeate()}
            disabled={loading || !topic.trim()}
          >
            <Sparkles size={18} /> {loading ? 'Analyzing...' : 'Generate Idea'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-panel spinner-container">
          <div className="spinner"></div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>Claude AI is drafting content...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Analyzing topics, building engaging hooks, and writing a 60-second video script.</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'var(--status-error)', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--text-primary)' }}>
          <p style={{ fontWeight: 600 }}>Error encountered:</p>
          <p style={{ color: 'var(--status-error)', marginTop: '4px' }}>{error}</p>
        </div>
      )}

      {/* Content Brief Display */}
      {brief && (
        <div className="glass-panel" style={{ padding: '2.5rem', animation: 'scale-up 0.4s ease' }}>
          <div className="brief-display">
            <div className="brief-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Brain size={12} /> AI Strategy Output
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pipeline ID: <strong>{pipelineId}</strong></span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 'var(--spacing-md)' }}>
                {brief.title}
              </h2>
            </div>

            <div className="grid-2" style={{ gap: '2rem' }}>
              <div>
                {/* Hook Section */}
                <div className="brief-section">
                  <h4 className="brief-section-title">The Hook</h4>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.5, fontStyle: 'italic', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderLeft: '3px solid var(--accent-cyan)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                    "{brief.hook}"
                  </p>
                </div>

                {/* Key Talking Points */}
                <div className="brief-section">
                  <h4 className="brief-section-title">Key Talking Points</h4>
                  <ul className="talking-points-list">
                    {brief.talkingPoints && brief.talkingPoints.map((point, index) => (
                      <li key={index} className="talking-point-item">
                        <CheckCircle2 size={18} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Video Script Section */}
              <div className="brief-section" style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 className="brief-section-title">Video Script (60s)</h4>
                <div className="script-box" style={{ flex: 1, minHeight: '220px' }}>
                  {brief.script}
                </div>
              </div>
            </div>

            {/* Next Steps CTA */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <button className="btn-primary" onClick={handleCreateFlow} style={{ padding: '12px 30px' }}>
                Push to Editor & Create Thumbnail <PenTool size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ideate;
