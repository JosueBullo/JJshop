// frontend/UserTransactionHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';

const UserTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to format currency values
  const formatCurrency = (value) => (typeof value === 'number' ? value.toFixed(2) : '0.00');
  useEffect(() => {
    const fetchUserTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId'); // Make sure userId is stored in localStorage
  
        if (!token || !userId) {
          alert('You need to log in first');
          return;
        }
  
        // Make the API request to get transactions for the logged-in user
        const response = await axios.get(`http://localhost:5000/api/transactions/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the header
          },
        });
  
        setTransactions(response.data); // Set the transaction data from the response
      } catch (err) {
        setError(err.response ? err.response.data.message : 'Error fetching transactions');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserTransactions(); // Fetch transactions when the component mounts
  }, []); // Empty dependency array to run once on mount
  
  if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default UserTransactionsPage;
