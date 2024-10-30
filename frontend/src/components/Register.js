import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default role
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // For styling success/error
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(''); // Clear previous message

        try {
            const userData = { username, email, password, role };
            const response = await registerUser(userData);

            if (response.success) {
                // Update message to inform about verification email
                setMessage(`Registration successful! Please check your email (${email}) to verify your account.`);
                setMessageType('success'); // Set message type for styling
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
                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    required
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit" className="btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
            {message && (
                <p className={`message ${messageType}`}>{message}</p> // Conditional styling
            )}
        </div>
    );
};

export default Register;
