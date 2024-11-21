import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // For styling success/error
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate(); // Hook for redirection

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(''); // Clear previous message

        try {
            const userData = { username, email, password };
            const response = await registerUser(userData);

            if (response.success) {
                // Update message to inform about verification email
                setMessage(`Registration successful! Please check your email (${email}) to verify your account.`);
                setMessageType('success'); // Set message type for styling

                // Redirect to Login after successful registration
                setTimeout(() => {
                    navigate('/login');
                }, 2000); // Redirect after 2 seconds to allow message display
            } else {
                setMessage(response.message || 'Registration failed!');
                setMessageType('error');
            }
        } catch (error) {
            console.error(error); // Log error for debugging
            setMessage(error.response?.data?.message || 'Registration failed!');
            setMessageType('error');
        } finally {
            setIsSubmitting(false); // Re-enable button
        }
    };

    // Handle exit button click
    const handleExit = () => {
        navigate('/'); // Redirect to homepage or any other desired route
    };

    return (
        <div className="register-container">
            <h2>Create an Account</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>

            {/* "Already have an account?" link */}
            <div className="login-link">
                <p>Already have an account? <span onClick={() => navigate('/login')} className="link-text">Login here</span></p>
            </div>

            {/* Exit Button */}
            <button className="exit-button" onClick={handleExit}>
                Exit
            </button>

            {/* Display success/error message */}
            {message && (
                <p className={`message ${messageType}`}>{message}</p> // Conditional styling
            )}
        </div>
    );
};

export default Register;
