import React, { useEffect, useState } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowRight, Image, RefreshCw, PenTool, Layout, FileText } from 'lucide-react';

function Create({ activePipelineId }) {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState(null);
  const [script, setScript] = useState('');
  const [title, setTitle] = useState('');
  const [thumbnailStyle, setThumbnailStyle] = useState('gradient');
  const [thumbnailSvg, setThumbnailSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activePipelineId) {
      setLoading(false);
      return;
    }

    const fetchPipeline = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/pipelines/${activePipelineId}`);
        if (res.ok) {
          const data = await res.json();
          setPipeline(data);
          setScript(data.content_brief?.script || data.script || '');
          setTitle(data.title || '');
          
          // Generate initial thumbnail
          fetchThumbnail(data.title || '', 'gradient');
        }
      } catch (err) {
        console.error('Failed to load pipeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, [activePipelineId]);

  const fetchThumbnail = async (thumbnailTitle, styleName) => {
    setImageLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: thumbnailTitle,
          style: styleName
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setThumbnailSvg(data.svg);
      }
    } catch (err) {
      console.error('Failed to fetch thumbnail:', err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleStyleChange = (style) => {
    setThumbnailStyle(style);
    fetchThumbnail(title, style);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Auto-update thumbnail when title changes (with a debounced feel, or simple change)
    fetchThumbnail(newTitle, thumbnailStyle);
  };

  const handleSavePipeline = async (shouldRedirect = false) => {
    if (!activePipelineId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/pipelines/${activePipelineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          script: script,
          status: 'ready',
          progress: 75
        }),
      });
      if (res.ok) {
        if (shouldRedirect) {
          navigate('/distribute');
        } else {
          alert('Changes saved successfully!');
        }
      }
    } catch (err) {
      console.error('Failed to update pipeline:', err);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (!activePipelineId) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>No Active Pipeline Selected</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Please go to the dashboard to select an existing pipeline or start a new content generation flow.
        </p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-panel spinner-container" style={{ marginTop: '2rem' }}>
        <div className="spinner"></div>
        <p>Loading editor workspace...</p>
      </div>
    );
  }

  return (
    <div className="create-container" style={{ textAlign: 'left' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Creator Studio</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Edit script drafts, refine titles, and style visual thumbnail overlays.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button className="btn-secondary" onClick={() => handleSavePipeline(false)} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button className="btn-primary" onClick={() => handleSavePipeline(true)} disabled={saving}>
            Proceed to Distribute <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="editor-layout">
        
        {/* Left column: Script & Title Editor */}
        <div className="script-editor-container">
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layout size={18} style={{ color: 'var(--accent-cyan)' }} /> Content Settings
            </h3>
            
            <div className="input-group">
              <label className="input-label" htmlFor="title-field">Video Title (Thumb Overlay)</label>
              <input
                id="title-field"
                type="text"
                className="text-input"
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter compelling video title"
              />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--accent-purple-light)' }} /> Video Script Editor
            </h3>
            <textarea
              className="editor-textarea"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Edit script here..."
            />
          </div>
        </div>

        {/* Right column: Thumbnail Generator */}
        <div className="preview-container">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Image size={18} style={{ color: 'var(--accent-cyan)' }} /> Visual Thumbnail Generator
            </h3>

            {/* SVG Canvas wrapper */}
            <div className="thumbnail-canvas-container">
              {imageLoading ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 10 }}>
                  <RefreshCw className="spin" size={32} style={{ color: 'var(--accent-cyan)' }} />
                </div>
              ) : null}
              {thumbnailSvg ? (
                <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: thumbnailSvg }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Thumbnail Preview
                </div>
              )}
            </div>

            {/* Style Selector */}
            <div style={{ marginTop: '1.25rem' }}>
              <span className="input-label" style={{ marginBottom: '6px', display: 'block' }}>Overlay Design Theme</span>
              <div className="style-selector">
                <button
                  className={`style-btn ${thumbnailStyle === 'gradient' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('gradient')}
                >
                  Gradient Glow
                </button>
                <button
                  className={`style-btn ${thumbnailStyle === 'minimal' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('minimal')}
                >
                  Dark Minimal
                </button>
                <button
                  className={`style-btn ${thumbnailStyle === 'bold' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('bold')}
                >
                  Flame Bold
                </button>
              </div>
            </div>

            {/* Regenerate CTA */}
            <button
              className="btn-secondary"
              style={{ width: '100%', marginTop: '1.25rem' }}
              onClick={() => fetchThumbnail(title, thumbnailStyle)}
              disabled={imageLoading}
            >
              <RefreshCw size={16} className={imageLoading ? 'spin' : ''} /> Regenerate Thumbnail Graphic
            </button>
          </div>

          {/* Quick tips card */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(6, 182, 212, 0.02)', borderColor: 'rgba(6, 182, 212, 0.1)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>Pro Creator Tip</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Hook the viewer in the first 3 seconds. Adjust lines in your script on the left, and match the thumbnail title on the right to align branding.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Create;
