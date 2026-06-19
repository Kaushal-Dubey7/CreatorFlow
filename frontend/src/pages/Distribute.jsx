import React, { useEffect, useState } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { Share2, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Play, Laptop, CloudLightning } from 'lucide-react';

function Distribute({ activePipelineId }) {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['youtube', 'instagram']);
  
  // Publishing states: 'idle' | 'publishing' | 'completed' | 'error'
  const [pubState, setPubState] = useState('idle');
  const [currentPublishingIndex, setCurrentPublishingIndex] = useState(-1);
  const [pubProgress, setPubProgress] = useState({}); // platform: status
  const [error, setError] = useState('');

  const platformsList = [
    { id: 'youtube', name: 'YouTube Shorts', desc: 'Auto-formats to 9:16 vertical layout', apiName: 'YouTube API' },
    { id: 'instagram', name: 'Instagram Reels', desc: 'Syncs draft with hook subtitle overlay', apiName: 'Instagram API' },
    { id: 'linkedin', name: 'LinkedIn Video', desc: 'Posts text brief + video attachments', apiName: 'LinkedIn API' },
    { id: 'tiktok', name: 'TikTok Mobile', desc: 'Pins keywords to sound tags', apiName: 'TikTok API' },
    { id: 'x', name: 'X / Twitter Post', desc: 'Trims script to fit 280-char thread', apiName: 'X Developer API' },
  ];

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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, [activePipelineId]);

  const handleTogglePlatform = (id) => {
    if (pubState !== 'idle') return;
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleStartPublishing = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one social platform to distribute to.');
      return;
    }

    setPubState('publishing');
    setError('');

    // Initialize progress object
    const initialProgress = {};
    selectedPlatforms.forEach(p => {
      initialProgress[p] = 'connecting';
    });
    setPubProgress(initialProgress);

    try {
      // Staggered UI updates for each platform
      for (let i = 0; i < selectedPlatforms.length; i++) {
        const plat = selectedPlatforms[i];
        setCurrentPublishingIndex(i);
        
        // 1. Connecting
        setPubProgress(prev => ({ ...prev, [plat]: 'connecting' }));
        await delay(600);

        // 2. Uploading
        setPubProgress(prev => ({ ...prev, [plat]: 'uploading' }));
        await delay(600);

        // 3. Publishing
        setPubProgress(prev => ({ ...prev, [plat]: 'publishing' }));
        await delay(500);

        // 4. Success
        setPubProgress(prev => ({ ...prev, [plat]: 'success' }));
      }

      // Call backend to complete the pipeline state change
      const res = await fetch(`${API_URL}/api/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipeline_id: activePipelineId,
          platforms: selectedPlatforms
        })
      });

      if (res.ok) {
        setPubState('completed');
      } else {
        const data = await res.json();
        setError(data.detail || 'Publishing API reported an error.');
        setPubState('error');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to publishing endpoint failed.');
      setPubState('error');
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        <p>Loading distribution portal...</p>
      </div>
    );
  }

  return (
    <div className="distribute-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Distribution Desk</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Distribute your formatted video and script package across all connected networks.</p>
        </div>
      </div>

      {pubState === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Active Post Summary */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple-light)', marginBottom: '8px' }}>
              Publishing Bundle Target:
            </h3>
            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{pipeline?.title}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Topic: <strong style={{ color: 'var(--text-primary)' }}>{pipeline?.topic}</strong></p>
          </div>

          {/* Platforms Selector */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Select Destination Platforms</h3>
            <div className="platforms-grid">
              {platformsList.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <div 
                    key={platform.id} 
                    className={`platform-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTogglePlatform(platform.id)}
                  >
                    <div className="platform-checkbox">
                      ✓
                    </div>
                    <div className="platform-logo-wrapper">
                      <Share2 size={24} />
                    </div>
                    <span className="platform-name">{platform.name}</span>
                    <span className="platform-desc" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
                      {platform.desc}
                    </span>
                    <span className="platform-status" style={{ marginTop: '10px' }}>
                      {isSelected ? 'Ready to Sync' : 'Excluded'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trigger Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
            <button className="btn-primary" onClick={handleStartPublishing} style={{ padding: '12px 32px' }}>
              Publish to Selected Channels <CloudLightning size={18} />
            </button>
          </div>
        </div>
      )}

      {pubState === 'publishing' && (
        <div className="glass-panel publishing-status-panel">
          <div className="spinner" style={{ width: '50px', height: '50px', marginBottom: '1.5rem' }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Simulating Platform Publishing...</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '500px' }}>
            Uploading script assets and registering media attachments via staging APIs.
          </p>

          <div className="publishing-list">
            {selectedPlatforms.map((plat) => {
              const info = platformsList.find(p => p.id === plat);
              const status = pubProgress[plat];
              return (
                <div key={plat} className="publishing-item">
                  <div className="pub-platform-info">
                    <Share2 size={18} style={{ color: status === 'success' ? 'var(--status-success)' : 'var(--text-muted)' }} />
                    <span style={{ fontWeight: 600 }}>{info?.name}</span>
                  </div>
                  <div className="pub-status-badge">
                    {status === 'connecting' && <span style={{ color: 'var(--text-muted)' }}><RefreshCw className="spin" size={14} style={{ display: 'inline', marginRight: '6px' }} />Connecting API...</span>}
                    {status === 'uploading' && <span style={{ color: 'var(--accent-cyan)' }}><RefreshCw className="spin" size={14} style={{ display: 'inline', marginRight: '6px' }} />Uploading assets...</span>}
                    {status === 'publishing' && <span style={{ color: 'var(--accent-purple-light)' }}><RefreshCw className="spin" size={14} style={{ display: 'inline', marginRight: '6px' }} />Finalizing post...</span>}
                    {status === 'success' && <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Published!</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pubState === 'completed' && (
        <div className="glass-panel publishing-status-panel" style={{ border: '1px solid var(--status-success)', background: 'rgba(16, 185, 201, 0.01)' }}>
          <div className="success-confetti-container">
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1rem', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle2 size={48} style={{ alignSelf: 'center' }} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Staging Deployment Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.5 }}>
              Congratulations! Your content has been published to all selected social media platforms simultaneously. Staged links generated and active.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                Back to Command Center
              </button>
              <button className="btn-primary" onClick={() => navigate('/analytics')}>
                View Analytics & Stats <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {pubState === 'error' && (
        <div className="glass-panel publishing-status-panel" style={{ border: '1px solid var(--status-error)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <AlertCircle size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Publishing Interrupted</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{error}</p>
          <button className="btn-primary" onClick={() => setPubState('idle')} style={{ marginTop: '1.5rem' }}>
            Modify Platforms & Retry
          </button>
        </div>
      )}
    </div>
  );
}

export default Distribute;
