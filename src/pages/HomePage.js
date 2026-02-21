import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function HomePage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="home-page fade-in">
      <header className="home-header">
        <h1>Resume Dashboard</h1>
        <p className="home-tagline">Create, manage, and share your professional resume</p>
        <nav className="home-nav">
          {user ? (
            <>
              {isAdmin() ? (
                <Link to="/admin/overview" className="btn btn-primary">Admin Dashboard</Link>
              ) : (
                <Link to="/dashboard/resumes" className="btn btn-primary">My Resumes</Link>
              )}
              <Link to="/dashboard/profile" className="btn btn-secondary">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Log In</Link>
              <Link to="/register" className="btn btn-secondary">Sign Up</Link>
            </>
          )}
        </nav>
      </header>
      <main className="home-main">
        <section className="card home-card fade-in-up">
          <h2>Features</h2>
          <ul>
            <li>Create and edit resumes with a structured form</li>
            <li>Submit resumes for admin review and moderation</li>
            <li>Publish resumes publicly with shareable links</li>
            <li>Track views and downloads with analytics</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
