import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';



const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = localStorage.getItem('token');
    
    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };
    
    return (
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo">Document Scanner</Link>
          
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="nav-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className={`nav-link ${location.pathname === '/signup' ? 'active' : ''}`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
    );
  };

export default Header;