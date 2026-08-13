import React, { Component } from 'react';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false,
      errorMsg: '',
      isSubmitting: false,
    };
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  togglePasswordVisibility = () => {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword,
    }));
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { username, password } = this.state;

    if (!username.trim() || !password.trim()) {
      this.setState({ errorMsg: 'Username and password are required' });
      return;
    }

    this.setState({ isSubmitting: true, errorMsg: '' });

    try {
      const response = await fetch('/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.text();

      if (response.ok) {
        // Parse JWT Token from JSON
        const parsedData = JSON.parse(data);
        this.props.onLoginSuccess(parsedData.jwtToken, username);
      } else {
        this.setState({ errorMsg: data || 'Login failed. Please try again.' });
      }
    } catch (error) {
      this.setState({ errorMsg: 'Something went wrong. Please check your connection.' });
      console.error('Login error:', error);
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    const { username, password, showPassword, errorMsg, isSubmitting } = this.state;

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">𝕏</div>
          <h1 className="auth-title">Log in to Twitter Clone</h1>

          {errorMsg && (
            <div className="error-message" role="alert" id="login-error">
              {errorMsg}
            </div>
          )}

          <form onSubmit={this.handleSubmit} novalidate>
            <div className="form-group">
              <label htmlFor="username-input">Username</label>
              <input
                id="username-input"
                name="username"
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={this.handleChange}
                autocomplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password-input">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={this.handleChange}
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={this.togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); this.props.onNavigate('register'); }}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default Login;
