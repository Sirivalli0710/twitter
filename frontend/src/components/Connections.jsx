import React, { Component } from 'react';

class Connections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connections: [],
      isLoading: true,
      errorMsg: '',
    };
  }

  componentDidMount() {
    this.fetchConnections();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.type !== this.props.type) {
      this.fetchConnections();
    }
  }

  fetchConnections = async () => {
    const { type, jwtToken } = this.props;
    this.setState({ isLoading: true, errorMsg: '' });

    const endpoint = type === 'followers' ? '/user/followers/' : '/user/following/';

    try {
      const response = await fetch(endpoint, {
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
        throw new Error(`Failed to load ${type}`);
      }

      const data = await response.json();
      this.setState({ connections: data, isLoading: false });
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      this.setState({ errorMsg: `Could not load ${type}.`, isLoading: false });
    }
  };

  render() {
    const { connections, isLoading, errorMsg } = this.state;
    const { type } = this.props;

    const title = type === 'followers' ? 'Followers' : 'Following';

    return (
      <div className="main-content">
        <div className="view-header">
          <h2>{title}</h2>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading {type}...</div>
        ) : errorMsg ? (
          <div className="error-message" style={{ margin: '20px' }}>{errorMsg}</div>
        ) : connections.length === 0 ? (
          <div className="empty-state">
            <p>{type === 'followers' ? "No one is following you yet." : "You are not following anyone yet."}</p>
          </div>
        ) : (
          <div className="connection-list">
            {connections.map((conn, idx) => {
              const nameInit = conn.name ? conn.name.charAt(0).toUpperCase() : 'U';
              return (
                <div key={idx} className="connection-item">
                  <div className="avatar" aria-hidden="true">
                    {nameInit}
                  </div>
                  <div className="connection-info">
                    <span className="connection-name">{conn.name}</span>
                    <span className="profile-username">@{conn.name.replace(/\s+/g, '').toLowerCase()}</span>
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

export default Connections;
