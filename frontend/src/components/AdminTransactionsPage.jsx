import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from '@mui/material';

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [updating, setUpdating] = useState(false);

  const formatCurrency = (value) => (typeof value === 'number' ? value.toFixed(2) : '0.00');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/transactions');
        setTransactions(response.data);
      } catch (err) {
        setError(err.response ? err.response.data.message : 'Error fetching transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const updateTransactionStatus = async (transactionId, newStatus) => {
    setUpdating(true);

    try {
      // Optimistically update the status in the UI
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction._id === transactionId ? { ...transaction, status: newStatus } : transaction
        )
      );

      // Retrieve token from localStorage
      const token = localStorage.getItem('token'); // Get token from localStorage

      // Check if token exists, if not, alert the user
      if (!token) {
        alert('You need to log in first');
        return;
      }

      // Send the update request to the backend with the token in the Authorization header
      const response = await axios.patch(
        `http://localhost:5000/api/transactions/${transactionId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } } // Include token in the Authorization header
      );

      // If successful, show a confirmation message
      alert('Transaction status updated successfully!');
    } catch (err) {
      console.error('Error updating transaction status:', err.message);
      alert('Failed to update transaction status');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Admin Transactions
      </Typography>
      <Paper sx={{ overflow: 'hidden', width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{transaction._id}</TableCell>
                <TableCell>
                  {transaction.user ? transaction.user.email : 'No user'}
                </TableCell>
                <TableCell>₱{formatCurrency(transaction.totalAmount)}</TableCell>
                <TableCell>{transaction.paymentMethod}</TableCell>
                <TableCell>{transaction.status || 'Pending'}</TableCell>
                <TableCell>
                  <Select
                    value={transaction.status || 'Pending'}
                    onChange={(e) => updateTransactionStatus(transaction._id, e.target.value)}
                    sx={{ minWidth: 120 }}
                    disabled={updating}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Processing">Processing</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                  <Button
                    onClick={() => handleViewDetails(transaction)}
                    sx={{ ml: 2 }}
                    variant="outlined"
                    disabled={updating}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Transaction Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && selectedTransaction.products?.length > 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" color="textSecondary" sx={{ marginBottom: 2 }}>
                  Products
                </Typography>
                {selectedTransaction.products.map((item, index) => {
                  // Calculate the total price for each product (price * quantity)
                  const productTotal = item.price * item.quantity;
                  return (
                    <Card key={index} sx={{ display: 'flex', marginBottom: 3, borderRadius: '12px' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <CardMedia
                            component="img"
                            image={item.images[0]?.url || '/default-image.jpg'} // Add fallback image
                            alt={`Product Image ${index + 1}`}
                            sx={{
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: '8px',
                              boxShadow: 3,
                              transition: 'transform 0.3s ease',
                              '&:hover': { transform: 'scale(1.05)' }, // Hover effect
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                          <CardContent sx={{ flex: 1 }}>
                            <Typography variant="h6">{item.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              Category: {item.category}
                            </Typography>
                            <Typography variant="body1" color="primary" sx={{ marginY: 1 }}>
                              ₱{formatCurrency(productTotal)} {/* Display the total price */}
                            </Typography>
                            <Divider />
                          </CardContent>
                        </Grid>
                      </Grid>
                    </Card>
                  );
                })}
                <Typography variant="h6" color="primary" sx={{ marginTop: 2 }}>
                  Total Amount: ₱{formatCurrency(selectedTransaction.totalAmount)} {/* Display overall total amount */}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography>No product details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTransactionsPage;
