import React, { useState } from 'react';
import { loginUser } from '../api/auth'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = { email, password };
            const response = await loginUser(userData); // Make the API call
            const { token, role } = response; // Destructure token and role from response
            
            // Store the token (if needed)
            localStorage.setItem('token', token); // Or use your preferred method

            // Redirect based on role
            if (role === 'admin') {
                navigate('/admin'); // Redirect to admin page
            } else {
                navigate('/user'); // Redirect to user page
            }
        } catch (error) {
            if (error.response && error.response.data) {
                // Check for specific error messages
                setMessage(error.response.data.message || 'Login failed!'); // Set error message
            } else {
                setMessage('Login failed!'); // General error message
            }
        }
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
                {message && <p className="message">{message}</p>} {/* Display the message if exists */}
            </div>
        </div>
    );
};

export default Login;
