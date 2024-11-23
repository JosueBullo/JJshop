import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchUserTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
          alert('You need to log in first');
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/transactions/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(response.data);
      } catch (err) {
        setError(err.response ? err.response.data.message : 'Error fetching transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTransactions();
  }, []);

  const formatCurrency = (value) => (typeof value === 'number' ? value.toFixed(2) : '0.00');

  if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            User Dashboard
          </Typography>
          <IconButton edge="end" color="inherit" onClick={handleMenuClick}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem component={Link} to="/user">Product Page</MenuItem>
            <MenuItem component={Link} to="/update-profile">Update Profile</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          My Transaction History
        </Typography>
        <Paper sx={{ overflow: 'hidden', width: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Products</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {transactions.map((transaction) => (
    <TableRow key={transaction._id}>
      <TableCell>{transaction._id}</TableCell>
      <TableCell>₱{formatCurrency(transaction.totalAmount)}</TableCell>
      <TableCell>{transaction.paymentMethod}</TableCell>
      <TableCell>{transaction.status || 'Pending'}</TableCell>
      <TableCell>{new Date(transaction.purchaseDate).toLocaleDateString()}</TableCell>
      <TableCell>
        {transaction.products?.map((product, index) => (
          product && product.product ? (
            <Typography key={index}>
              {product.product?.name || 'Unknown Product'} (x{product.quantity || 0})
            </Typography>
          ) : (
            <Typography key={index}>
              Unknown Product (x{product.quantity || 0})
            </Typography>
          )
        ))}
      </TableCell>
    </TableRow>
  ))}
</TableBody>

          </Table>
        </Paper>
      </Box>
    </div>
  );
};

export default UserTransactionsPage;
