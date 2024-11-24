import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Box, TextField, Typography } from '@mui/material';
import Chart from 'chart.js/auto'; // Import chart.js for rendering

const AdminDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Fetch all transactions from the backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage (or use another method)
        
        if (!token) {
          console.error('No authorization token found.');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTransactions(response.data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on status and date range
  useEffect(() => {
    const filterTransactions = () => {
      const filtered = transactions.filter((transaction) => {
        const isCompleted = transaction.status === 'Completed';
        const transactionDate = new Date(transaction.createdAt);

        if (isNaN(transactionDate.getTime())) {
          console.error('Invalid date in transaction:', transaction.createdAt);
          return false;
        }

        const isInRange =
          (!startDate || transactionDate >= new Date(startDate)) &&
          (!endDate || transactionDate <= new Date(endDate));

        return isCompleted && isInRange;
      });

      setFilteredTransactions(filtered);
    };

    filterTransactions();
  }, [transactions, startDate, endDate]);

  // Prepare chart data for rendering
  const prepareChartData = () => {
    const dailySales = filteredTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString();
      const totalAmount = transaction.totalAmount;

      if (!acc[date]) {
        acc[date] = 0;
      }

      acc[date] += totalAmount;

      return acc;
    }, {});

    const chartLabels = Object.keys(dailySales);
    const chartData = Object.values(dailySales);

    return {
      labels: chartLabels,
      datasets: [
        {
          label: 'Sales (₱)',
          data: chartData,
          backgroundColor: 'rgba(34, 139, 34, 0.7)',
          borderColor: 'rgba(34, 139, 34, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = prepareChartData();

  return (
    <Box sx={{ padding: 2 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom style={{ color: 'black' }}>
        Sales Chart
      </Typography>

      {/* Date Range Filter */}
      <Box sx={{ marginBottom: 3 }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ marginRight: 2 }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Sales Chart */}
      <Box sx={{ marginBottom: 3 }}>
        <Bar data={chartData} />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
