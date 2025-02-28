import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Document Scanner</h1>
      <p className="home-subtitle">
        Easily extract information from your documents using our advanced AI-powered scanner.
        Login or sign up to start scanning and organizing your documents.
      </p>
      
      <div className="cta-buttons">
        <Link to="/login" className="btn btn-primary">Login</Link>
        <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
      </div>
    </div>
  );
};

export default Home;