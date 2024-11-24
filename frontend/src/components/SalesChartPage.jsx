import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Box, TextField, Typography, Grid, Card, CardContent } from '@mui/material';
import Chart from 'chart.js/auto';

const AdminSalesCharts = () => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Fetch transactions with "Completed" status
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token'); // Authorization token
        if (!token) {
          console.error('No authorization token found.');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const completedTransactions = response.data.filter(
          (transaction) => transaction.status === 'Completed'
        );
        setTransactions(completedTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions by date range
  useEffect(() => {
    const filterByDateRange = () => {
      const filtered = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.purchaseDate); // Use purchaseDate
        const isInRange =
          (!startDate || transactionDate >= new Date(startDate)) &&
          (!endDate || transactionDate <= new Date(endDate));
        return isInRange;
      });
      setFilteredTransactions(filtered);
    };

    filterByDateRange();
  }, [transactions, startDate, endDate]);

  // Utility: Aggregate monthly sales
  const getMonthlySalesData = () => {
    const monthlySales = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.purchaseDate).toLocaleString('default', { month: 'long' }); // Use purchaseDate
      acc[month] = (acc[month] || 0) + transaction.totalAmount;
      return acc;
    }, {});

    return {
      labels: Object.keys(monthlySales),
      datasets: [
        {
          label: 'Monthly Sales (₱)',
          data: Object.values(monthlySales),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Utility: Prepare chart data for filtered sales
  const getFilteredSalesData = () => {
    const dailySales = filteredTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.purchaseDate).toLocaleDateString(); // Use purchaseDate
      acc[date] = (acc[date] || 0) + transaction.totalAmount;
      return acc;
    }, {});

    return {
      labels: Object.keys(dailySales),
      datasets: [
        {
          label: 'Filtered Sales (₱)',
          data: Object.values(dailySales),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <Box sx={{ padding: 3, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 4 }}>
        Sales Charts
      </Typography>

      {/* Monthly Sales Chart */}
      <Card sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Sales
          </Typography>
          <Box sx={{ height: 400 }}>
            <Line
              data={getMonthlySalesData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Date Range Filter */}
      <Box sx={{ marginBottom: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Filtered Sales Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtered Sales
          </Typography>
          <Box sx={{ height: 400 }}>
            <Bar
              data={getFilteredSalesData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSalesCharts;
