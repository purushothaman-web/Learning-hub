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

const AppLayout = () => {
  return (
    <div className="app-shell">
      <Sidebar />
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
