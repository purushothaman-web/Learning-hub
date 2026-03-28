import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopicLayout } from './components/TopicLayout';
import { Playground } from './components/Playground';
import { Dashboard } from './components/Dashboard';
import { ChatWidget } from './components/ChatWidget';
import './index.css';

import { LandingPage } from './components/LandingPage';
import { Welcome } from './components/Welcome';
import { Onboarding } from './components/Onboarding';
import { PathSuggestion } from './components/PathSuggestion';
import { CustomizePath } from './components/CustomizePath';

import { useState, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth >= 1024);
  const isSpecialPage = location.pathname === '/dashboard' || location.pathname === '/playground';

  // Responsive and Route tracking
  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Check on route change
    if (window.innerWidth < 1024 || isSpecialPage) {
      setIsSidebarExpanded(false);
    } else {
      setIsSidebarExpanded(true);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  return (
    <div className={`app-shell ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <Sidebar isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  useEffect(() => {
    document.title = 'Learning Hub Studio | Master Full-Stack Dev Skills';
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* App Internal Pages with Sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/suggestion" element={<PathSuggestion />} />
          <Route path="/customize" element={<CustomizePath />} />
          <Route path="/topic/:id" element={<TopicLayout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/playground" element={<Playground />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </Router>
  );
}

export default App;
