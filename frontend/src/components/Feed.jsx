import React, { Component } from 'react';

class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tweets: [],
      newTweetText: '',
      isSubmitting: false,
      isLoading: true,
      errorMsg: '',
    };
  }

  componentDidMount() {
    this.fetchFeed();
  }

  fetchFeed = async () => {
    const { jwtToken } = this.props;
    this.setState({ isLoading: true, errorMsg: '' });

    try {
      const response = await fetch('/user/tweets/feed/', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        this.props.onTokenExpired();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load feed');
      }

      const data = await response.json();
      this.setState({ tweets: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching feed:', error);
      this.setState({ errorMsg: 'Could not load feed.', isLoading: false });
    }
  };

  handleTextChange = (e) => {
    this.setState({ newTweetText: e.target.value });
  };

  handleComposeSubmit = async (e) => {
    e.preventDefault();
    const { newTweetText } = this.state;
    const { jwtToken } = this.props;

    if (!newTweetText.trim()) return;

    this.setState({ isSubmitting: true });

    try {
      const response = await fetch('/user/tweets/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweet: newTweetText }),
      });

      if (response.status === 401) {
        this.props.onTokenExpired();
        return;
      }

      if (response.ok) {
        this.setState({ newTweetText: '' });
        // Refresh feed (and also let parent know a new tweet was created to update lists if needed)
        this.fetchFeed();
        if (this.props.onTweetCreated) {
          this.props.onTweetCreated();
        }
      } else {
        alert('Failed to post tweet');
      }
    } catch (error) {
      console.error('Error creating tweet:', error);
      alert('Network error when posting tweet');
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    const { tweets, newTweetText, isSubmitting, isLoading, errorMsg } = this.state;
    const { onSelectTweet } = this.props;

    return (
      <div className="main-content">
        <div className="view-header">
          <h2>Home</h2>
        </div>

        {/* Compose Tweet Box */}
        <form onSubmit={this.handleComposeSubmit} className="compose-card">
          <div className="avatar" aria-hidden="true">
            {this.props.username ? this.props.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flexGrow: 1 }}>
            <textarea
              className="compose-textarea"
              placeholder="What's happening?"
              value={newTweetText}
              onChange={this.handleTextChange}
              maxlength="280"
              required
              aria-label="Compose a new tweet"
            />
            <div className="compose-actions">
              <span style={{ marginRight: '15px', alignSelf: 'center', color: newTweetText.length > 250 ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {newTweetText.length}/280
              </span>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !newTweetText.trim() || newTweetText.length > 280}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>

        {/* Tweet List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading tweets...</div>
        ) : errorMsg ? (
          <div className="error-message" style={{ margin: '20px' }}>{errorMsg}</div>
        ) : tweets.length === 0 ? (
          <div className="empty-state">
            <p>No tweets in your feed. Follow users to see their tweets!</p>
          </div>
        ) : (
          <div className="tweet-list">
            {tweets.map((tweet, index) => {
              const authorInit = tweet.username ? tweet.username.charAt(0).toUpperCase() : 'T';
              return (
                <div
                  key={index}
                  className="tweet-card"
                  onClick={() => tweet.tweetId && onSelectTweet(tweet.tweetId)}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      tweet.tweetId && onSelectTweet(tweet.tweetId);
                    }
                  }}
                >
                  <div className="avatar" aria-hidden="true">
                    {authorInit}
                  </div>
                  <div className="tweet-body">
                    <div className="tweet-header">
                      <span className="tweet-author">{tweet.username}</span>
                      <span className="tweet-username">@{tweet.username?.toLowerCase()}</span>
                      <span className="tweet-dot" aria-hidden="true">·</span>
                      <span className="tweet-time">{tweet.dateTime}</span>
                    </div>
                    <p className="tweet-text">{tweet.tweet}</p>
                    <div className="tweet-footer">
                      <span className="tweet-stat">
                        💬 Details
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default Feed;
