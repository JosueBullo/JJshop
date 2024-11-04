import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            setError('Error fetching users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdateUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        const userPayload = { username, email, role };
        if (selectedUser) {
            // Update existing user
            try {
                await axios.put(`http://localhost:5000/api/users/${selectedUser._id}`, userPayload, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
            } catch (error) {
                setError('Error updating user. Please try again.');
            }
        } else {
            // Add new user
            userPayload.password = password; // Only include password when adding a new user
            try {
                await axios.post('http://localhost:5000/api/users', userPayload, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
            } catch (error) {
                setError('Error adding user. Please try again.');
            }
        }
        resetForm();
        fetchUsers();
        setActionLoading(false);
    };

    const handleEditUser = (user) => {
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        setSelectedUser(user);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        setActionLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            fetchUsers();
        } catch (error) {
            setError('Error deleting user. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('user');
        setSelectedUser(null);
        setError(null);
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="container mt-4">
            <h1>User Management</h1>
            <form onSubmit={handleAddOrUpdateUser} className="mb-4">
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {!selectedUser && (
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    )}
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select" required>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                        {actionLoading ? 'Saving...' : selectedUser ? 'Update User' : 'Add User'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={actionLoading}>
                        Cancel
                    </button>
                </div>
            </form>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button className="btn btn-warning btn-sm" onClick={() => handleEditUser(user)} disabled={actionLoading}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user._id)} disabled={actionLoading}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
