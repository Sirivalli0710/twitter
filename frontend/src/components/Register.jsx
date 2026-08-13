import React, { Component } from 'react';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      name: '',
      gender: 'male', // default value
      showPassword: false,
      errorMsg: '',
      successMsg: '',
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
    const { username, password, name, gender } = this.state;

    if (!username.trim() || !password.trim() || !name.trim() || !gender) {
      this.setState({ errorMsg: 'All fields are required' });
      return;
    }

    if (password.length < 6) {
      this.setState({ errorMsg: 'Password is too short' });
      return;
    }

    this.setState({ isSubmitting: true, errorMsg: '', successMsg: '' });

    try {
      const response = await fetch('/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, name, gender }),
      });

      const data = await response.text();

      if (response.ok) {
        this.setState({
          successMsg: data || 'User created successfully! Redirecting to login...',
          username: '',
          password: '',
          name: '',
          gender: 'male',
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.props.onNavigate('login');
        }, 2000);
      } else {
        this.setState({ errorMsg: data || 'Registration failed.' });
      }
    } catch (error) {
      this.setState({ errorMsg: 'Something went wrong. Please check your connection.' });
      console.error('Registration error:', error);
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    const { username, password, name, gender, showPassword, errorMsg, successMsg, isSubmitting } = this.state;

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">𝕏</div>
          <h1 className="auth-title">Create your account</h1>

          {errorMsg && (
            <div className="error-message" role="alert" id="register-error">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="success-message" role="alert" id="register-success">
              {successMsg}
            </div>
          )}

          <form onSubmit={this.handleSubmit} novalidate>
            <div className="form-group">
              <label htmlFor="name-input">Full Name</label>
              <input
                id="name-input"
                name="name"
                type="text"
                className="form-control"
                placeholder="Enter full name"
                value={name}
                onChange={this.handleChange}
                autocomplete="name"
                required
              />
            </div>

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
              <label htmlFor="password-input">Password (minimum 6 characters)</label>
              <div className="password-input-wrapper">
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={this.handleChange}
                  autocomplete="new-password"
                  required
                  minlength="6"
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

            <div className="form-group">
              <label htmlFor="gender-select">Gender</label>
              <select
                id="gender-select"
                name="gender"
                className="form-control"
                value={gender}
                onChange={this.handleChange}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Sign up'}
            </button>
          </form>

          <p className="auth-link">
            Have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); this.props.onNavigate('login'); }}>
              Log in
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default Register;
