import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navigation from './components/Navigation';
import Register from './pages/Register';
import NaturalLanguageQuery from './pages/NaturalLanguageQuery';
import LogsAnalytics from './pages/LogsAnalytics';
import { authService } from './services/authService';
import ResetPassword from './pages/ResetPassword';
import UserManagement from './pages/UserManagement';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
 const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // If token is invalid, logout
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

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
          path="/settings" 
          element={
            <ProtectedRoute>
              <Navigation>
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                  <p className="mt-4 text-gray-600">This page is under construction.</p>
                </div>
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;