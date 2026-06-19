import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Lightbulb, PenTool, Share2, BarChart3, Home, User } from 'lucide-react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Ideate from './pages/Ideate';
import Create from './pages/Create';
import Distribute from './pages/Distribute';
import Analytics from './pages/Analytics';
import './App.css';

// Layout wrapper for all pages except Landing
function AppLayout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <NavLink to="/" className="logo-container">
          <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="logo-text">CreatorFlow AI</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/ideate" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Lightbulb size={20} />
            <span>Ideate Desk</span>
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <PenTool size={20} />
            <span>Studio</span>
          </NavLink>
          <NavLink to="/distribute" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Share2 size={20} />
            <span>Distribution</span>
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Analytics</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <User size={18} />
              </div>
            </div>
            <div className="user-info">
              <span className="user-name">WeCreate Team</span>
              <span className="user-role">Hackathon Mode</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  const [activePipelineId, setActivePipelineId] = useState('');

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard setActivePipelineId={setActivePipelineId} />} />
          <Route path="/ideate" element={<Ideate setActivePipelineId={setActivePipelineId} />} />
          <Route path="/create" element={<Create activePipelineId={activePipelineId} />} />
          <Route path="/distribute" element={<Distribute activePipelineId={activePipelineId} />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
