import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, MessageSquare, ChevronLeft, ChevronRight, Menu, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JobBoard from './components/JobBoard';
import Profile from './components/Profile';
import Interview from './components/Interview';
import Login from './components/Login';
import Signup from './components/Signup';
import InterviewHistory from './components/InterviewHistory';
import { Award } from 'lucide-react';

// Dashboard Layout Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'jobs');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30 flex">
      {/* Sidebar / Navigation */}
      <motion.div
        initial={{ width: 80 }}
        animate={{ width: isSidebarExpanded ? 240 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 flex flex-col z-50 overflow-hidden"
      >
        {/* Header / Logo */}
        <div className="h-20 flex items-center justify-center relative w-full border-b border-gray-800/50">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20 shrink-0">
            IH
          </div>
        </div>

        <nav className="flex flex-col gap-2 p-3 w-full flex-1 mt-4">
          <NavButton
            icon={LayoutDashboard}
            label="Job Board"
            active={activeTab === 'jobs'}
            expanded={isSidebarExpanded}
            onClick={() => setActiveTab('jobs')}
          />
          <NavButton
            icon={User}
            label="Profile"
            active={activeTab === 'profile'}
            expanded={isSidebarExpanded}
            onClick={() => setActiveTab('profile')}
          />
          <NavButton
            icon={MessageSquare}
            label="AI Interviewer"
            active={activeTab === 'chat'}
            expanded={isSidebarExpanded}
            onClick={() => setActiveTab('chat')}
          />
          <NavButton
            icon={Award}
            label="Performance"
            active={activeTab === 'history'}
            expanded={isSidebarExpanded}
            onClick={() => setActiveTab('history')}
          />
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          <button
            onClick={handleLogout}
            className={`w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center gap-4 group relative overflow-hidden`}
          >
            <LogOut className="w-6 h-6 shrink-0" />
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-14'}`}>
              Logout
            </span>
            {!isSidebarExpanded && (
              <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 z-50">
                Logout
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="w-full p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all flex items-center gap-4 group relative overflow-hidden"
          >
            {isSidebarExpanded ? <ChevronLeft className="w-6 h-6 shrink-0" /> : <ChevronRight className="w-6 h-6 shrink-0" />}

            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-14'}`}>
              Collapse
            </span>
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        animate={{ paddingLeft: isSidebarExpanded ? 240 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen flex-1 w-full"
      >
        <header className="h-16 border-b border-gray-800 flex items-center px-8 bg-gray-900/50 backdrop-blur-md sticky top-0 z-40 w-full">
          <h1 className="text-xl font-bold text-gray-200">
            {activeTab === 'jobs' && 'My Applications'}
            {activeTab === 'profile' && 'Smart Profile'}
            {activeTab === 'chat' && 'AI Interview Assistant'}
            {activeTab === 'history' && 'Performance History'}
          </h1>
        </header>

        <main className="p-8 w-full">
          {activeTab === 'jobs' && <JobBoard />}

          {activeTab === 'profile' && <Profile />}

          {activeTab === 'chat' && <Interview />}
          {activeTab === 'history' && <InterviewHistory />}
        </main>
      </motion.div>
    </div>
  );
}

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  // Simple auth check via localStorage
  const isAuthenticated = !!localStorage.getItem('authToken');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

const NavButton = ({ icon: Icon, label, active, expanded, onClick }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-xl transition-all group flex items-center gap-4 relative overflow-hidden
      ${active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }
    `}
  >
    <Icon className="w-6 h-6 shrink-0" />

    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-14'}`}>
      {label}
    </span>

    {!expanded && (
      <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 z-50">
        {label}
      </span>
    )}
  </button>
);

export default App;
