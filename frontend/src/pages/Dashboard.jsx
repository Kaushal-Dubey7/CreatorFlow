import React, { useEffect, useState } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Eye, ThumbsUp, Share2, MessageSquare, Play, RefreshCw } from 'lucide-react';

function Dashboard({ setActivePipelineId }) {
  const [pipelines, setPipelines] = useState([]);
  const [stats, setStats] = useState({ total_views: 0, total_likes: 0, total_shares: 0, total_comments: 0 });
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch pipelines
      const pipesRes = await fetch(`${API_URL}/api/pipelines`);
      const pipesData = await pipesRes.json();
      setPipelines(pipesData.pipelines);

      // Fetch analytics
      const statsRes = await fetch(`${API_URL}/api/analytics`);
      const statsData = await statsRes.json();
      setStats(statsData.overview);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartFlow = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/ideate?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleCardClick = (pipe) => {
    setActivePipelineId(pipe.id);
    if (pipe.status === 'ideating') {
      navigate('/ideate');
    } else if (pipe.status === 'creating') {
      navigate('/create');
    } else if (pipe.status === 'ready') {
      navigate('/distribute');
    } else {
      navigate('/analytics');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ideating':
        return <span className="badge badge-purple">Ideating</span>;
      case 'creating':
        return <span className="badge badge-warning">Creating</span>;
      case 'ready':
        return <span className="badge badge-cyan">Ready to Publish</span>;
      case 'published':
        return <span className="badge badge-success">Published</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="dashboard-container" style={{ textAlign: 'left' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Creator Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Welcome back. Manage your content pipelines and watch engagement grow.</p>
        </div>
        <button className="btn-secondary" onClick={fetchData} title="Refresh data">
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="stats-row grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
            <Eye size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Views</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.total_views ? stats.total_views.toLocaleString() : '106,000'}</span>
            <span style={{ fontSize: '0.75rem', color: '#34D399', display: 'block', fontWeight: 500 }}>+12.3% this week</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: '12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-purple-light)', borderRadius: '12px' }}>
            <ThumbsUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Likes</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.total_likes ? stats.total_likes.toLocaleString() : '7,300'}</span>
            <span style={{ fontSize: '0.75rem', color: '#34D399', display: 'block', fontWeight: 500 }}>+8.7% this week</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
            <Share2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Shares</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.total_shares ? stats.total_shares.toLocaleString() : '1,870'}</span>
            <span style={{ fontSize: '0.75rem', color: '#34D399', display: 'block', fontWeight: 500 }}>+15.2% this week</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', borderRadius: '12px' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Comments</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.total_comments ? stats.total_comments.toLocaleString() : '724'}</span>
            <span style={{ fontSize: '0.75rem', color: '#F87171', display: 'block', fontWeight: 500 }}>-2.1% this week</span>
          </div>
        </div>
      </div>

      {/* Quick Launch and Main pipelines */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Active Pipelines */}
        <section className="pipeline-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="section-header">
            <h2 className="section-title">Active Pipelines</h2>
          </div>

          {loading && pipelines.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px' }}></div>
              Loading content pipelines...
            </div>
          ) : (
            <div className="pipeline-grid" style={{ gridTemplateColumns: '1fr' }}>
              {pipelines.map((pipe) => (
                <div key={pipe.id} className="glass-card" onClick={() => handleCardClick(pipe)} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifySelf: 'stretch', gap: 'var(--spacing-lg)', cursor: 'pointer', padding: '1.25rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="card-topic">{pipe.topic}</span>
                      {getStatusBadge(pipe.status)}
                    </div>
                    <h3 className="card-title" style={{ marginTop: '0.25rem', fontSize: '1.2rem' }}>{pipe.title}</h3>
                    
                    {/* Progress Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                      <div className="progress-bar-container" style={{ margin: 0, flex: 1 }}>
                        <div className="progress-bar-fill" style={{ width: `${pipe.progress}%` }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{pipe.progress}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '1.25rem', height: '80px' }}>
                    {pipe.platforms && pipe.platforms.length > 0 && (
                      <div className="platforms-list" style={{ marginRight: '1rem' }}>
                        {pipe.platforms.map((plat) => (
                          <div key={plat} className="platform-icon-sm" title={plat}>
                            {plat.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                      {pipe.status === 'published' ? 'View' : 'Continue'} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {pipelines.length === 0 && (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active pipelines. Start a new one below!
                </div>
              )}
            </div>
          )}
        </section>

        {/* Quick Launch Panel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 className="section-title">New Pipeline</h2>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Launch a new content operations flow. Input a keyword or trend topic to get started.
            </p>
            <form onSubmit={handleStartFlow} className="input-group">
              <label className="input-label" htmlFor="topic-input">Content Topic</label>
              <input
                id="topic-input"
                type="text"
                placeholder="e.g. Future of Coding, Remote Work Tips"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="text-input"
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Plus size={18} /> Start Flow
              </button>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;
