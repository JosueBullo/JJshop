import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    Container, 
    TextField, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    CircularProgress,
    Typography,
    TablePagination
} from '@mui/material';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container component="main" maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                User Management
            </Typography>
            <form onSubmit={handleAddOrUpdateUser} style={{ marginBottom: '20px' }}>
                <TextField
                    variant="outlined"
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <TextField
                    variant="outlined"
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {!selectedUser && (
                    <TextField
                        variant="outlined"
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                )}
                <FormControl variant="outlined" fullWidth margin="normal" required>
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        label="Role"
                    >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : selectedUser ? 'Update User' : 'Add User'}
                </Button>
                <Button type="button" variant="outlined" onClick={resetForm} disabled={actionLoading} style={{ marginLeft: '10px' }}>
                    Cancel
                </Button>
            </form>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Profile</TableCell>
                            <TableCell>Actions</TableCell> {/* Actions column */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => (
                            <TableRow key={user._id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    {/* Profile related content */}
                                    {user.profileImage ? (
                                        <img 
                                            src={`http://localhost:5000/uploads/${user.profileImage}`} 
                                            alt="Profile" 
                                            style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
                                        />
                                    ) : (
                                        <Typography>No Profile Image</Typography>
                                    )}
                                </TableCell>
                                <TableCell> {/* Actions column */}
                                    <Button 
                                        variant="contained" 
                                        color="warning" 
                                        size="small" 
                                        onClick={() => handleEditUser(user)} 
                                        disabled={actionLoading}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        color="error" 
                                        size="small" 
                                        onClick={() => handleDeleteUser(user._id)} 
                                        disabled={actionLoading} 
                                        style={{ marginLeft: '10px' }}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Container>
    );
};

export default AdminUsers;
