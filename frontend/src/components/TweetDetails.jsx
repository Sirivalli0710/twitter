import React, { Component } from 'react';

class TweetDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tweetDetails: null,
      likesList: [],
      repliesList: [],
      activeTab: 'replies', // 'replies' | 'likes'
      isLoading: true,
      errorMsg: '',
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tweetId !== this.props.tweetId) {
      this.fetchData();
    }
  }

  fetchData = async () => {
    const { tweetId, jwtToken } = this.props;
    if (!tweetId) return;

    this.setState({ isLoading: true, errorMsg: '' });

    try {
      const headers = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      };

      // Fetch tweet details (likes count, replies count, text, time)
      const detailsRes = await fetch(`/tweets/${tweetId}/`, { headers });
      
      if (detailsRes.status === 401) {
        this.props.onTokenExpired();
        return;
      }

      if (!detailsRes.ok) {
        const errText = await detailsRes.text();
        throw new Error(errText || 'Failed to fetch tweet details');
      }

      const detailsData = await detailsRes.json();

      // Fetch likes list (usernames who liked)
      const likesRes = await fetch(`/tweets/${tweetId}/likes/`, { headers });
      let likesListData = [];
      if (likesRes.ok) {
        const likesJson = await likesRes.json();
        likesListData = likesJson.likes || [];
      }

      // Fetch replies list
      const repliesRes = await fetch(`/tweets/${tweetId}/replies/`, { headers });
      let repliesListData = [];
      if (repliesRes.ok) {
        const repliesJson = await repliesRes.json();
        repliesListData = repliesJson.replies || [];
      }

      this.setState({
        tweetDetails: detailsData,
        likesList: likesListData,
        repliesList: repliesListData,
        isLoading: false,
      });

    } catch (error) {
      console.error('Error fetching tweet details:', error);
      this.setState({
        errorMsg: error.message || 'Failed to load details. You might not be following this user.',
        isLoading: false,
      });
    }
  };

  handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      this.props.onClose();
    }
  };

  render() {
    const { tweetDetails, likesList, repliesList, activeTab, isLoading, errorMsg } = this.state;
    const { onClose } = this.props;

    return (
      <div className="modal-overlay" onClick={this.handleBackdropClick} role="dialog" aria-modal="true">
        <div className="modal-card">
          <div className="modal-header">
            <h2 id="modal-title">Tweet Thread</h2>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              &times;
            </button>
          </div>

          <div className="modal-body">
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading thread...</div>
            ) : errorMsg ? (
              <div className="error-message">{errorMsg}</div>
            ) : (
              <div>
                {tweetDetails && (
                  <div className="tweet-detail-section">
                    <div className="details-author-sec">
                      <div className="avatar">
                        T
                      </div>
                      <div>
                        <div style={{ fontWeight: '700' }}>Tweet Detail</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>View replies & likes</div>
                      </div>
                    </div>

                    <p className="details-tweet-text">{tweetDetails.tweet}</p>
                    <div className="details-tweet-time">
                      {tweetDetails.dateTime}
                    </div>

                    <div className="details-stats-bar">
                      <div className="details-stat">
                        <span>{tweetDetails.likes}</span> Likes
                      </div>
                      <div className="details-stat">
                        <span>{tweetDetails.replies}</span> Replies
                      </div>
                    </div>
                  </div>
                )}

                <div className="modal-tabs" role="tablist">
                  <button
                    role="tab"
                    aria-selected={activeTab === 'replies'}
                    className={`modal-tab btn-secondary ${activeTab === 'replies' ? 'active' : ''}`}
                    onClick={() => this.setState({ activeTab: 'replies' })}
                  >
                    Replies ({repliesList.length})
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'likes'}
                    className={`modal-tab btn-secondary ${activeTab === 'likes' ? 'active' : ''}`}
                    onClick={() => this.setState({ activeTab: 'likes' })}
                  >
                    Likes ({likesList.length})
                  </button>
                </div>

                <div className="modal-tab-content">
                  {activeTab === 'replies' ? (
                    <div className="modal-list">
                      {repliesList.length === 0 ? (
                        <p className="empty-state">No replies yet.</p>
                      ) : (
                        repliesList.map((reply, idx) => (
                          <div key={idx} className="modal-list-item">
                            <div className="reply-item-author">{reply.name}</div>
                            <div className="reply-item-text">{reply.reply}</div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="modal-list">
                      {likesList.length === 0 ? (
                        <p className="empty-state">No likes yet.</p>
                      ) : (
                        likesList.map((username, idx) => (
                          <div key={idx} className="modal-list-item" style={{ fontWeight: '600' }}>
                            @{username}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default TweetDetails;
