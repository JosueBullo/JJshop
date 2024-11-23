import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, CircularProgress, Box, Typography } from '@mui/material';

const UpdateProfile = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Optionally, you can load current user data on component mount
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const user = response.data.user;
                setUsername(user.username);
                setEmail(user.email);
                setProfileImage(user.profileImage || '');
            } catch (error) {
                setError('Failed to fetch user data');
            }
        };

        fetchUserData();
    }, []);

    const handleProfileUpdate = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5000/api/update-profile',
                { username, email, password, profileImage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLoading(false);
            alert('Profile updated successfully');
        } catch (err) {
            setLoading(false);
            setError('Error updating profile');
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>Update Profile</Typography>

            {error && <Typography color="error">{error}</Typography>}

            <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ marginBottom: 2 }}
            />

            <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ marginBottom: 2 }}
            />

            <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ marginBottom: 2 }}
            />

            <TextField
                label="Profile Image URL"
                fullWidth
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                sx={{ marginBottom: 2 }}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={handleProfileUpdate}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} /> : 'Update Profile'}
            </Button>
        </Box>
    );
};

export default UpdateProfile;
