import React, { Component } from 'react';

class Sidebar extends Component {
  render() {
    const { currentView, username, onNavigate, onLogout } = this.props;

    // Get initial of username for the avatar
    const initial = username ? username.charAt(0).toUpperCase() : 'U';

    return (
      <aside className="left-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">𝕏</div>
          <nav className="sidebar-nav" aria-label="Main Navigation">
            <button
              className={`sidebar-item ${currentView === 'feed' ? 'active' : ''}`}
              onClick={() => onNavigate('feed')}
            >
              <span className="sidebar-link-icon" aria-hidden="true">🏠</span>
              <span className="sidebar-link-text">Home</span>
            </button>

            <button
              className={`sidebar-item ${currentView === 'my-tweets' ? 'active' : ''}`}
              onClick={() => onNavigate('my-tweets')}
            >
              <span className="sidebar-link-icon" aria-hidden="true">📝</span>
              <span className="sidebar-link-text">My Tweets</span>
            </button>

            <button
              className={`sidebar-item ${currentView === 'followers' ? 'active' : ''}`}
              onClick={() => onNavigate('followers')}
            >
              <span className="sidebar-link-icon" aria-hidden="true">👥</span>
              <span className="sidebar-link-text">Followers</span>
            </button>

            <button
              className={`sidebar-item ${currentView === 'following' ? 'active' : ''}`}
              onClick={() => onNavigate('following')}
            >
              <span className="sidebar-link-icon" aria-hidden="true">👤</span>
              <span className="sidebar-link-text">Following</span>
            </button>

            <button
              className="sidebar-item"
              onClick={onLogout}
              style={{ color: 'var(--danger)', marginTop: '20px' }}
            >
              <span className="sidebar-link-icon" aria-hidden="true">🚪</span>
              <span className="sidebar-link-text">Logout</span>
            </button>
          </nav>
        </div>

        {username && (
          <div className="sidebar-profile">
            <div className="avatar" aria-hidden="true">
              {initial}
            </div>
            <div className="sidebar-profile-info">
              <span className="profile-name">{username}</span>
              <span className="profile-username">@{username.toLowerCase()}</span>
            </div>
          </div>
        )}
      </aside>
    );
  }
}

export default Sidebar;
