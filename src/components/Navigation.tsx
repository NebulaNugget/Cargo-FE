import { useState, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu,
  FiGrid,
  FiTerminal,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiUser,
  FiUsers
} from 'react-icons/fi';
import { Shield } from 'lucide-react';
import { authService } from '../services/authService';

const DRAWER_WIDTH = '240px';

interface NavigationProps {
  children: ReactNode;
}

interface NavItem {
  text: string;
  path: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { text: 'Dashboard', path: '/dashboard', icon: <FiGrid className="w-5 h-5" /> },
  { text: 'Natural Language Query', path: '/query', icon: <FiTerminal className="w-5 h-5" /> },
  { text: 'Logs & Analytics', path: '/logs', icon: <FiBarChart2 className="w-5 h-5" /> },
 { text: 'User Management', path: '/users', icon: <FiUsers className="w-5 h-5" /> },
  { text: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  
];

export default function Navigation({ children }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [clientName, setClientName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get user data from localStorage
    const firstName = localStorage.getItem('first_name') || '';
    const lastName = localStorage.getItem('last_name') || '';
    const username = localStorage.getItem('username') || '';
    const clientNameFromStorage = localStorage.getItem('client_name') || '';
    
    // Set user name (prefer full name, fallback to username)
    setUserName(firstName && lastName ? `${firstName} ${lastName}` : username);
    setClientName(clientNameFromStorage);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const drawer = (
    <div className="h-full flex flex-col bg-white z-1000">
      <div className="h-16 flex items-center px-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg mx-auto ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 454.46 430.12" className="w-8 h-8">
            <g>
              <path d="M312.6 410.71L401.27 322l9.44-9.44 33.91-33.91c25-22.12-17.92-21.09-36-21l-13.1.09-31.17.21-48 .32-101.29 101.29-144.5-144.5 144.5-144.5 107 107 .27-.12v.39l90.42-.6c25.81-.17 60.93 2.68 29-28.65l-31-31-98.15-98.17a66.73 66.73 0 0 0-94.1 0l-3.44 3.44-3.44-3.44a66.74 66.74 0 0 0-94.1 0l-98.11 98.11a66.74 66.74 0 0 0 0 94.1l3.44 3.44-3.44 3.44a66.74 66.74 0 0 0 0 94.1l98.11 98.11a66.74 66.74 0 0 0 94.1 0l3.44-3.44 3.44 3.44a66.74 66.74 0 0 0 94.1 0zM336.18 144l-97.27-97.3 3.44-3.44a33 33 0 0 1 46.39 0l98.11 98.11q1.09 1.09 2.05 2.25l-52.72.35zM384 291.62l-95.24 95.24a33 33 0 0 1-46.39 0l-3.44-3.44L330.36 292l53.63-.35zM46.7 191.21l-3.44-3.44a33 33 0 0 1 0-46.39l98.11-98.11a33 33 0 0 1 46.39 0l3.44 3.44-144.5 144.5zm0 47.71l144.5 144.5-3.44 3.44a33 33 0 0 1-46.39 0l-98.11-98.11a33 33 0 0 1 0-46.39l3.44-3.44z" fill="white" fillRule="evenodd"/>
            </g>
          </svg>
        </div>
         <div className="text-center">
          <h1 className="text-md mt-5 mr-2 font-bold text-blue-500">CARBONATION CO-PILOT</h1>
        </div>
        </div>
      </div>
      <div className="h-px bg-gray-200" />
      <nav className="p-2 flex-grow">
        {navItems.map((item) => (
          <button
            key={item.text}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === item.path
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            {item.text}
          </button>
        ))}
      </nav>
      
      {/* Mobile-only footer with brand name */}
      <div className="lg:hidden p-4 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md mr-2">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Carbonation Co-Pilot</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={handleDrawerToggle}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[${DRAWER_WIDTH}] z-30 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {drawer}
      </div>

      {/* Desktop drawer */}
      <div className={`hidden lg:block fixed top-0 left-0 bottom-0 w-[${DRAWER_WIDTH}] border-r border-gray-200`}>
        {drawer}
      </div>

      {/* Main content */}
      <div className={`lg:pl-[${DRAWER_WIDTH}]`}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center">
              <button
                onClick={handleDrawerToggle}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 mr-2"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              
           
              
              {/* Desktop header with logo, brand name and client name */}
              <div className="hidden lg:flex items-center">
                {/* Logo and Brand Section */}
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg mx-auto ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 454.46 430.12" className="w-8 h-8">
            <g>
              <path d="M312.6 410.71L401.27 322l9.44-9.44 33.91-33.91c25-22.12-17.92-21.09-36-21l-13.1.09-31.17.21-48 .32-101.29 101.29-144.5-144.5 144.5-144.5 107 107 .27-.12v.39l90.42-.6c25.81-.17 60.93 2.68 29-28.65l-31-31-98.15-98.17a66.73 66.73 0 0 0-94.1 0l-3.44 3.44-3.44-3.44a66.74 66.74 0 0 0-94.1 0l-98.11 98.11a66.74 66.74 0 0 0 0 94.1l3.44 3.44-3.44 3.44a66.74 66.74 0 0 0 0 94.1l98.11 98.11a66.74 66.74 0 0 0 94.1 0l3.44-3.44 3.44 3.44a66.74 66.74 0 0 0 94.1 0zM336.18 144l-97.27-97.3 3.44-3.44a33 33 0 0 1 46.39 0l98.11 98.11q1.09 1.09 2.05 2.25l-52.72.35zM384 291.62l-95.24 95.24a33 33 0 0 1-46.39 0l-3.44-3.44L330.36 292l53.63-.35zM46.7 191.21l-3.44-3.44a33 33 0 0 1 0-46.39l98.11-98.11a33 33 0 0 1 46.39 0l3.44 3.44-144.5 144.5zm0 47.71l144.5 144.5-3.44 3.44a33 33 0 0 1-46.39 0l-98.11-98.11a33 33 0 0 1 0-46.39l3.44-3.44z" fill="white" fillRule="evenodd"/>
            </g>
          </svg>
        </div>
              <div className="text-center">
          <h1 className="text-xl font-bold text-blue-500 mt-5 ml-2">CARBONATION CO-PILOT</h1>
        </div>
                {clientName && (
                  <div className="px-3 py-1 bg-blue-50 rounded-lg border mt-5 mr-7 border-blue-100">
                    <span className="text-sm font-medium text-blue-700">{clientName}</span>
                  </div>
                )}
              </div>
              
              {/* Mobile client name */}
              <div className="lg:hidden ml-3">
                {clientName && (
                  <div className="px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-xs font-medium text-blue-700">{clientName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile menu */}
            <div className="relative ml-auto">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center justify-center space-x-2 py-1 px-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100"
              >
                <span className="hidden sm:inline text-sm font-medium">{userName}</span>
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <FiUser className="w-4 h-4" />
                </div>
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500 mt-1">{localStorage.getItem('email') || ''}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}