import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navigation from './components/Navigation';
import Register from './pages/Register';
import NaturalLanguageQuery from './pages/NaturalLanguageQuery';
import LogsAnalytics from './pages/LogsAnalytics';
import ResetPassword from './pages/ResetPassword';
import UserManagement from './pages/UserManagement';
import TaskManager from './pages/TaskManager';
import { useAuthStore } from './stores/authStore';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2 text-primary-600">
          <FiLoader className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Navigation>
                <Dashboard />
              </Navigation>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/query" 
          element={
            <ProtectedRoute>
              <Navigation>
                <NaturalLanguageQuery />
              </Navigation>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/logs" 
          element={
            <ProtectedRoute>
              <Navigation>
                <LogsAnalytics />
              </Navigation>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <Navigation>
                <UserManagement />
              </Navigation>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Navigation>
                <TaskManager />
              </Navigation>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Navigation>
                <div className="p-6">
                  <h1 className="text-2xl font-semibold mb-4">Settings</h1>
                  <p>Settings page content will be implemented soon.</p>
                </div>
              </Navigation>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;