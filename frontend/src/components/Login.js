import React, { useState } from 'react';
import { loginUser, googleLogin } from '../api/auth'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { GoogleLogin } from '@react-oauth/google'; // Import Google Login component
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState(''); // State for email
    const [password, setPassword] = useState(''); // State for password
    const [message, setMessage] = useState(''); // State for error/success messages
    const navigate = useNavigate(); // Initialize useNavigate

    // Handles the email/password login
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = { email, password }; // Create user data object
            const response = await loginUser(userData); // Call login API
            console.log('Login response:', response); // Log the response

            // Destructure token, role, and userId from response
            const { token, role, userId } = response; 

            // Store token and userId in localStorage
            localStorage.setItem('token', token); 
            localStorage.setItem('userId', userId); // Store userId

            // Redirect based on role
            if (role === 'admin') {
                navigate('/admin'); // Redirect to admin page
            } else {
                navigate('/user'); // Redirect to user page
            }
        } catch (error) {
            console.error('Login error:', error); // Log the error
            if (error.response && error.response.data) {
                setMessage(error.response.data.message || 'Login failed!'); // Set message based on error response
            } else {
                setMessage('Login failed!'); // General error message
            }
        }
    };

    // Handles the Google login
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const tokenId = credentialResponse.credential; // Get the token ID from Google response
            const res = await googleLogin({ tokenId }); // Call the googleLogin API
            const { token, role, userId } = res.data; // Destructure token, role, and userId from response

            // Store the token and userId in localStorage
            localStorage.setItem('token', token); 
            localStorage.setItem('userId', userId); // Store userId
            console.log(token)
            console.log(userId)
            // Redirect based on role
            if (role === 'admin') {
                navigate('/admin'); // Redirect to admin page
            } else {
                navigate('/user'); // Redirect to user page
            }
        } catch (error) {
            console.error("Google login error:", error); // Log error for debugging
            if (error.response && error.response.data) {
                setMessage(error.response.data.message || 'Google login failed!'); // Set error message
            } else {
                setMessage('Google login failed!'); // General error message
            }
        }
    };

    // Handles Google login failures
    const handleGoogleFailure = (error) => {
        console.error("Google login failed:", error); // Log the error for debugging
        setMessage('Google login failed!'); // Set error message
    };

    // Handle exit button click
    const handleExit = () => {
        navigate('/'); // Navigate to homepage or any other desired route
    };

    return (
        <div className="login-container">
            <div className="form-wrapper">
                <h2 className="form-title">Login to Your Account</h2>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="submit-button">Login</button>
                </form>

                {/* "Don't have an account?" link */}
                <div className="register-link">
                    <p>Don't have an account? <Link to="/register" className="link-text">Register here</Link></p>
                </div>

                {/* OR Divider */}
                <p className="or">OR</p>

                {/* Google Login */}
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onFailure={handleGoogleFailure}
                />
                {message && <p className="message">{message}</p>} {/* Display the message if exists */}

                {/* Exit Button */}
                <button className="exit-button" onClick={handleExit}>
                    Exit
                </button>
            </div>
        </div>
    );
};

export default Login;
