import React, { Component } from 'react';

class MyTweets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tweets: [],
      isLoading: true,
      errorMsg: '',
    };
  }

  componentDidMount() {
    this.fetchMyTweets();
  }

  fetchMyTweets = async () => {
    const { jwtToken } = this.props;
    this.setState({ isLoading: true, errorMsg: '' });

    try {
      const response = await fetch('/user/tweets/', {
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
        throw new Error('Failed to load your tweets');
      }

      const data = await response.json();
      this.setState({ tweets: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching my tweets:', error);
      this.setState({ errorMsg: 'Could not load your tweets.', isLoading: false });
    }
  };

  handleDeleteTweet = async (event, tweetId) => {
    event.stopPropagation(); // prevent opening details modal
    
    if (!window.confirm('Are you sure you want to delete this tweet?')) {
      return;
    }

    const { jwtToken } = this.props;

    try {
      const response = await fetch(`/tweets/${tweetId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        this.props.onTokenExpired();
        return;
      }

      if (response.ok) {
        // Refresh my tweets and also tell parent to refresh counts
        this.fetchMyTweets();
        if (this.props.onTweetDeleted) {
          this.props.onTweetDeleted();
        }
      } else {
        const text = await response.text();
        alert(`Failed to delete tweet: ${text}`);
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
      alert('Network error when deleting tweet');
    }
  };

  render() {
    const { tweets, isLoading, errorMsg } = this.state;
    const { onSelectTweet, username } = this.props;
    const authorInit = username ? username.charAt(0).toUpperCase() : 'U';

    return (
      <div className="main-content">
        <div className="view-header">
          <h2>My Tweets</h2>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading your tweets...</div>
        ) : errorMsg ? (
          <div className="error-message" style={{ margin: '20px' }}>{errorMsg}</div>
        ) : tweets.length === 0 ? (
          <div className="empty-state">
            <p>You haven't posted any tweets yet. Start writing on the Home page!</p>
          </div>
        ) : (
          <div className="tweet-list">
            {tweets.map((tweet, index) => (
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
                    <span className="tweet-author">{username}</span>
                    <span className="tweet-username">@{username?.toLowerCase()}</span>
                    <span className="tweet-dot" aria-hidden="true">·</span>
                    <span className="tweet-time">{tweet.dateTime}</span>
                    
                    {tweet.tweetId && (
                      <div className="tweet-delete-container">
                        <button
                          className="btn-icon-delete"
                          onClick={(e) => this.handleDeleteTweet(e, tweet.tweetId)}
                          aria-label="Delete tweet"
                          title="Delete tweet"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="tweet-text">{tweet.tweet}</p>
                  <div className="tweet-footer">
                    <span className="tweet-stat">
                      ❤️ {tweet.likes} Likes
                    </span>
                    <span className="tweet-stat">
                      💬 {tweet.replies} Replies
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default MyTweets;
