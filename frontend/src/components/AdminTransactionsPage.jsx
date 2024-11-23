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
      const response = await axios.patch(`http://localhost:5000/api/transactions/${transactionId}/status`, { status: newStatus });
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction._id === transactionId ? { ...transaction, status: response.data.transaction.status } : transaction
        )
      );
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
                  {transaction.user ? `${transaction.user.name} (${transaction.user.email})` : 'No user'}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && selectedTransaction.products?.length > 0 ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Products</Typography>
                {selectedTransaction.products.map((item, index) => (
                  <Box key={index} sx={{ marginBottom: 2 }}>
                    <Typography variant="body1">
                      <strong>{item.name}</strong> (Category: {item.category}) - ₱{formatCurrency(item.price)} x {item.quantity}
                    </Typography>
                    <Grid container spacing={2}>
                      {item.images.map((image, i) => (
                        <Grid item key={i} xs={6} sm={4} md={3}>
                          <img
                            src={image.url}
                            alt={`Product Image ${i + 1}`}
                            style={{ width: '100%', borderRadius: '8px' }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Grid>
            </Grid>
          ) : (
            <Typography>No product details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTransactionsPage;
