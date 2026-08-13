import React, { Component } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import MyTweets from './components/MyTweets';
import Connections from './components/Connections';
import TweetDetails from './components/TweetDetails';

class App extends Component {
  constructor(props) {
    super(props);
    let token = localStorage.getItem('jwtToken') || '';
    let username = localStorage.getItem('username') || '';
    if (token === 'undefined' || token === 'null') {
      token = '';
    }
    if (username === 'undefined' || username === 'null') {
      username = '';
    }

    this.state = {
      jwtToken: token,
      username: username,
      currentView: token ? 'feed' : 'login',
      selectedTweetId: null,
      followerCount: 0,
      followingCount: 0,
      myTweetsCount: 0,
    };
  }

  componentDidMount() {
    if (this.state.jwtToken) {
      this.fetchCounts();
    }
  }

  fetchCounts = async () => {
    const { jwtToken } = this.state;
    if (!jwtToken || jwtToken === 'undefined' || jwtToken === 'null') return;

    try {
      const headers = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      };

      // Fetch followers count
      const followersRes = await fetch('/user/followers/', { headers });
      if (followersRes.status === 401) {
        this.handleLogout();
        return;
      }
      let followerCount = 0;
      if (followersRes.ok) {
        const followers = await followersRes.json();
        followerCount = followers.length;
      }

      // Fetch following count
      const followingRes = await fetch('/user/following/', { headers });
      if (followingRes.status === 401) {
        this.handleLogout();
        return;
      }
      let followingCount = 0;
      if (followingRes.ok) {
        const following = await followingRes.json();
        followingCount = following.length;
      }

      // Fetch my tweets count
      const myTweetsRes = await fetch('/user/tweets/', { headers });
      if (myTweetsRes.status === 401) {
        this.handleLogout();
        return;
      }
      let myTweetsCount = 0;
      if (myTweetsRes.ok) {
        const tweets = await myTweetsRes.json();
        myTweetsCount = tweets.length;
      }

      this.setState({
        followerCount,
        followingCount,
        myTweetsCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
    }
  };

  handleLoginSuccess = (token, username) => {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('username', username);
    this.setState(
      {
        jwtToken: token,
        username: username,
        currentView: 'feed',
      },
      () => {
        this.fetchCounts();
      }
    );
  };

  handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    this.setState({
      jwtToken: '',
      username: '',
      currentView: 'login',
      selectedTweetId: null,
      followerCount: 0,
      followingCount: 0,
      myTweetsCount: 0,
    });
  };

  handleNavigate = (view) => {
    this.setState({ currentView: view });
  };

  handleSelectTweet = (tweetId) => {
    this.setState({ selectedTweetId: tweetId });
  };

  handleCloseModal = () => {
    this.setState({ selectedTweetId: null });
  };

  renderActiveView() {
    const { currentView, jwtToken, username } = this.state;

    switch (currentView) {
      case 'feed':
        return (
          <Feed
            jwtToken={jwtToken}
            username={username}
            onSelectTweet={this.handleSelectTweet}
            onTweetCreated={this.fetchCounts}
            onTokenExpired={this.handleLogout}
          />
        );
      case 'my-tweets':
        return (
          <MyTweets
            jwtToken={jwtToken}
            username={username}
            onSelectTweet={this.handleSelectTweet}
            onTweetDeleted={this.fetchCounts}
            onTokenExpired={this.handleLogout}
          />
        );
      case 'followers':
        return (
          <Connections
            type="followers"
            jwtToken={jwtToken}
            onTokenExpired={this.handleLogout}
          />
        );
      case 'following':
        return (
          <Connections
            type="following"
            jwtToken={jwtToken}
            onTokenExpired={this.handleLogout}
          />
        );
      default:
        return (
          <Feed
            jwtToken={jwtToken}
            username={username}
            onSelectTweet={this.handleSelectTweet}
            onTweetCreated={this.fetchCounts}
            onTokenExpired={this.handleLogout}
          />
        );
    }
  }

  render() {
    const { jwtToken, username, currentView, selectedTweetId, followerCount, followingCount, myTweetsCount } = this.state;

    // Unauthorized View (Login or Register)
    if (!jwtToken) {
      if (currentView === 'register') {
        return <Register onNavigate={this.handleNavigate} />;
      }
      return <Login onLoginSuccess={this.handleLoginSuccess} onNavigate={this.handleNavigate} />;
    }

    // Authorized Dashboard View
    return (
      <div className="app-container">
        <div className="dashboard-layout">
          {/* Left Sidebar */}
          <Sidebar
            currentView={currentView}
            username={username}
            onNavigate={this.handleNavigate}
            onLogout={this.handleLogout}
          />

          {/* Main Area */}
          <main aria-label="Main Feed Content">
            {this.renderActiveView()}
          </main>

          {/* Right Sidebar Widgets */}
          <aside className="right-sidebar" aria-label="Dashboard Stats">
            <div className="sidebar-widget">
              <h2 className="widget-title">Dashboard Info</h2>
              <div className="stat-item">
                <span className="stat-item-label">Account</span>
                <span className="stat-item-value">@{username.toLowerCase()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-item-label">Tweets</span>
                <span className="stat-item-value">{myTweetsCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-item-label">Followers</span>
                <span className="stat-item-value">{followerCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-item-label">Following</span>
                <span className="stat-item-value">{followingCount}</span>
              </div>
            </div>
            
            <div className="sidebar-widget">
              <h2 className="widget-title">How to use</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                Compose tweets from the <strong>Home</strong> page. Inspect tweets for replies & likes by clicking on them. Delete your own tweets in <strong>My Tweets</strong>.
              </p>
            </div>
          </aside>
        </div>

        {/* Tweet Details Modal */}
        {selectedTweetId && (
          <TweetDetails
            tweetId={selectedTweetId}
            jwtToken={jwtToken}
            onClose={this.handleCloseModal}
            onTokenExpired={this.handleLogout}
          />
        )}
      </div>
    );
  }
}

export default App;
