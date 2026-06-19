import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb, PenTool, Share2 } from 'lucide-react';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Header / Nav */}
      <header className="landing-nav">
        <div className="logo-container" style={{ margin: 0 }}>
          <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="logo-text">CreatorFlow AI</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#workflow" className="landing-nav-link">Workflow</a>
        </div>
        <div>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Start Creating <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-tag">HACKFLUENCE 2026 Prototype</div>
        <h1 className="hero-title">
          From Idea to Published —<br />In Minutes, Not Hours
        </h1>
        <p className="hero-subtitle">
          The AI-native content operations workspace that replaces ChatGPT + Canva + Notion + Buffer. 
          Ideate topics, generate video scripts, design custom thumbnails, and distribute instantly.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }} onClick={() => navigate('/dashboard')}>
            Enter Dashboard <ArrowRight size={20} />
          </button>
          <a href="#workflow" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
            See How it Works
          </a>
        </div>

        {/* Workflow Visualizer */}
        <div id="workflow" className="workflow-visual glass-panel" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            The CreatorFlow Pipeline
          </h3>
          <div className="flow-container">
            <div className="flow-step">
              <div className="step-icon-wrapper">
                <Lightbulb size={32} className="pulsing-glow" style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <span className="step-title">1. Ideate</span>
              <span className="step-desc">AI scans social trends and drafts a custom brief & hook</span>
            </div>

            <div className="flow-connector">
              <div className="flow-connector-active"></div>
            </div>

            <div className="flow-step">
              <div className="step-icon-wrapper">
                <PenTool size={32} style={{ color: 'var(--accent-purple-light)' }} />
              </div>
              <span className="step-title">2. Create</span>
              <span className="step-desc">Refine the video script and auto-generate thumbnails</span>
            </div>

            <div className="flow-connector">
              <div className="flow-connector-active" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="flow-step">
              <div className="step-icon-wrapper">
                <Share2 size={32} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <span className="step-title">3. Distribute</span>
              <span className="step-desc">Publish to YouTube, TikTok, IG, LinkedIn, & X at once</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '3rem' }}>
          Everything a Creator Needs in One Command Center
        </h2>
        <div className="grid-3">
          <div className="glass-card" style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
              <Lightbulb size={28} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Trend Spotter</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Input any keyword or topic to generate immediate content hooks, outlines, and script ideas calibrated to capture attention.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-purple-light)', marginBottom: '1rem' }}>
              <PenTool size={28} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Script & Image Editor</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Edit generated scripts live. Choose styled visual layouts to instantly output high-definition thumbnail graphics.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
              <Share2 size={28} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Simulated Auto-Publish</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Select target social platforms and watch your content distribute with custom, animated multi-platform publish pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>© 2026 CreatorFlow AI. Built by Team WeCreate for HACKFLUENCE.</p>
      </footer>
    </div>
  );
}

export default Landing;
