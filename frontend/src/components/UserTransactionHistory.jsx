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
  TableContainer,
  Avatar,
  Divider,
  Tooltip,
  Chip,
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

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
        <Divider sx={{ marginBottom: 2 }} />
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Transaction ID</TableCell>
                <TableCell align="center">Total Amount</TableCell>
                <TableCell align="center">Payment Method</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Purchase Date</TableCell>
                <TableCell align="center">Products</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell align="center">{transaction._id}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`₱${formatCurrency(transaction.totalAmount)}`}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">{transaction.paymentMethod}</TableCell>
                  <TableCell align="center">
                    <Tooltip title={transaction.status || 'Pending'}>
                      <Chip
                        label={transaction.status || 'Pending'}
                        color={transaction.status === 'Completed' ? 'success' : 'warning'}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {new Date(transaction.purchaseDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {transaction.products?.map((product, index) => (
                      <Box key={index} display="flex" alignItems="center">
                        <Avatar
                          sx={{ width: 24, height: 24, marginRight: 1 }}
                          alt={product.product?.name || 'Unknown Product'}
                          src={product.product?.image || ''}
                        />
                        <Typography variant="body2">
                          {product.product?.name || 'Product is out of stock'} (x{product.quantity || 0})
                        </Typography>
                      </Box>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
};

export default UserTransactionsPage;
