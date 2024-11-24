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
  Tooltip,
  Chip,
} from '@mui/material';

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [updating, setUpdating] = useState(false);

  const formatCurrency = (value) => (typeof value === 'number' ? value.toFixed(2) : '0.00');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString(); // Format: MM/DD/YYYY
  };

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
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction._id === transactionId ? { ...transaction, status: newStatus } : transaction
        )
      );
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in first');
        return;
      }
      await axios.patch(
        `http://localhost:5000/api/transactions/${transactionId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
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

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  if (error) return <Typography color="error" textAlign="center">{error}</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Transactions
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Transaction ID</TableCell>
              <TableCell align="center">User Email</TableCell>
              <TableCell align="center">Total Amount</TableCell>
              <TableCell align="center">Payment Method</TableCell>
              <TableCell align="center">Purchase Date</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell align="center">{transaction._id}</TableCell>
                <TableCell align="center">{transaction.user?.email || 'N/A'}</TableCell>
                <TableCell align="center">
                  <Chip label={`₱${formatCurrency(transaction.totalAmount)}`} color="primary" />
                </TableCell>
                <TableCell align="center">{transaction.paymentMethod}</TableCell>
                <TableCell align="center">{formatDate(transaction.purchaseDate)}</TableCell>
                <TableCell align="center">
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
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Transaction Details">
                    <Button
                      variant="contained"
                      onClick={() => handleViewDetails(transaction)}
                      disabled={updating}
                    >
                      Details
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          <Typography>Purchase Date: {formatDate(selectedTransaction?.purchaseDate)}</Typography>
          {selectedTransaction && selectedTransaction.products?.length > 0 ? (
            <Grid container spacing={2}>
              {selectedTransaction.products.map((product, index) => (
                <Card key={index} sx={{ display: 'flex', marginBottom: 2 }}>
                  <CardMedia
                    component="img"
                    image={product.images?.[0]?.url || '/default-image.jpg'}
                    alt={product.name || 'Product Image'}
                    sx={{ width: 160, height: 120, borderRadius: '8px' }}
                  />
                  <CardContent>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Category: {product.category}
                    </Typography>
                    <Typography variant="body1" color="primary">
                      Price: ₱{formatCurrency(product.price)} x {product.quantity} = ₱
                      {formatCurrency(product.price * product.quantity)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
              <Typography variant="h6" align="right" color="primary" sx={{ mt: 2, width: '100%' }}>
                Total Amount: ₱{formatCurrency(selectedTransaction.totalAmount)}
              </Typography>
            </Grid>
          ) : (
            <Typography>No product details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTransactionsPage;
