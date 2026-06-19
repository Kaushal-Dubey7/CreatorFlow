import React, { useEffect, useState } from 'react';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Eye, ThumbsUp, Share2, MessageSquare, RefreshCw, ArrowLeft, ArrowUpRight } from 'lucide-react';

function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/analytics`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="glass-panel spinner-container" style={{ marginTop: '2rem' }}>
        <div className="spinner"></div>
        <p>Loading analytics platform...</p>
      </div>
    );
  }

  const { overview, posts, chart_data } = data || {
    overview: { total_views: 106000, views_change: 12.3, total_likes: 7300, likes_change: 8.7, total_shares: 1870, shares_change: 15.2, total_comments: 724, comments_change: -2.1 },
    posts: [],
    chart_data: []
  };

  // Helper to draw the SVG line chart
  const renderChart = () => {
    if (!chart_data || chart_data.length === 0) return null;
    
    const width = 800;
    const height = 200;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...chart_data.map(d => d.views)) * 1.15;
    const points = chart_data.map((d, i) => {
      const x = padding + (i / (chart_data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.views / maxVal) * chartHeight;
      return { x, y, views: d.views, day: d.day };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-purple-light)" />
            <stop offset="100%" stopColor="var(--accent-cyan)" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + ratio * chartHeight;
          return (
            <line
              key={idx}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Under Area */}
        <path d={areaD} fill="url(#area-grad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#line-grad)" strokeWidth="3" strokeLinecap="round" />

        {/* Data points & labels */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--bg-secondary)"
              stroke="var(--accent-cyan)"
              strokeWidth="2"
              className="chart-dot"
            />
            {/* Tooltip on hover */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize="10"
              fontWeight="600"
              style={{ opacity: 0.8 }}
            >
              {p.views.toLocaleString()}
            </text>
            {/* Day label */}
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="11"
              fontWeight="500"
            >
              {p.day}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="analytics-container" style={{ textAlign: 'left' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Workspace</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Real-time cross-platform metrics, audience engagement charts, and post breakdown.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <button className="btn-secondary" onClick={fetchAnalytics}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Sync
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="stats-row grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
            <Eye size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Total Views</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_views.toLocaleString()}</span>
            <span style={{ fontSize: '0.75rem', color: overview.views_change >= 0 ? '#34D399' : '#F87171', display: 'block', fontWeight: 500 }}>
              {overview.views_change >= 0 ? '+' : ''}{overview.views_change}% this week
            </span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: '12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-purple-light)', borderRadius: '12px' }}>
            <ThumbsUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Total Likes</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_likes.toLocaleString()}</span>
            <span style={{ fontSize: '0.75rem', color: overview.likes_change >= 0 ? '#34D399' : '#F87171', display: 'block', fontWeight: 500 }}>
              {overview.likes_change >= 0 ? '+' : ''}{overview.likes_change}% this week
            </span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
            <Share2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Total Shares</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_shares.toLocaleString()}</span>
            <span style={{ fontSize: '0.75rem', color: overview.shares_change >= 0 ? '#34D399' : '#F87171', display: 'block', fontWeight: 500 }}>
              {overview.shares_change >= 0 ? '+' : ''}{overview.shares_change}% this week
            </span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)', borderRadius: '12px' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Total Comments</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{overview.total_comments.toLocaleString()}</span>
            <span style={{ fontSize: '0.75rem', color: overview.comments_change >= 0 ? '#34D399' : '#F87171', display: 'block', fontWeight: 500 }}>
              {overview.comments_change >= 0 ? '+' : ''}{overview.comments_change}% this week
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart Panel */}
      <div className="glass-panel chart-panel" style={{ textAnchor: 'middle', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} style={{ color: 'var(--accent-cyan)' }} /> 7-Day Performance Flow (Views)
        </h3>
        <div style={{ flex: 1, position: 'relative' }}>
          {renderChart()}
        </div>
      </div>

      {/* Published Content list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Published Content & Briefs</h3>
        
        <div className="posts-table-container">
          <table className="posts-table">
            <thead>
              <tr>
                <th>Video Title</th>
                <th>Platforms</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Shares</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{post.title}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {post.platforms && post.platforms.length > 0 ? (
                        post.platforms.map((plat) => (
                          <span key={plat} className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            {plat}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Draft (unpublished)</span>
                      )}
                    </div>
                  </td>
                  <td>{post.views ? post.views.toLocaleString() : '-'}</td>
                  <td>{post.likes ? post.likes.toLocaleString() : '-'}</td>
                  <td>{post.shares ? post.shares.toLocaleString() : '-'}</td>
                  <td>
                    {post.status === 'live' ? (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Live</span>
                    ) : (
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Draft</span>
                    )}
                  </td>
                  <td>
                    <a href={`https://example.com/staged/${post.id}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}>
                      Preview <ArrowUpRight size={12} />
                    </a>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No published content packages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
