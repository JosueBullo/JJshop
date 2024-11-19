import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Snackbar,
    Alert,
    Grid,
    TablePagination, // Import TablePagination
} from '@mui/material';
import './AdminProductPage.css';

const AdminProductPage = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null,
    });
    const [editingProductId, setEditingProductId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [snackOpen, setSnackOpen] = useState(false);
    
    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error.response ? error.response.data : error.message);
            }
        };
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validation for required fields
        if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.image) {
            setErrorMessage('Please fill in all fields, including an image.');
            setSnackOpen(true);
            return;
        }

        // Prepare FormData
        const productData = new FormData();
        productData.append('name', formData.name);
        productData.append('description', formData.description);
        productData.append('price', formData.price);
        productData.append('category', formData.category);
        productData.append('image', formData.image);

        try {
            if (editingProductId) {
                // Update product
                await axios.put(`http://localhost:5000/api/products/${editingProductId}`, productData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setProducts(products.map((product) =>
                    product._id === editingProductId ? { ...product, ...formData } : product
                ));
                setEditingProductId(null);
            } else {
                // Create new product
                const response = await axios.post('http://localhost:5000/api/products', productData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setProducts([...products, response.data.product]);
            }
            setFormData({ name: '', description: '', price: '', category: '', image: null });
        } catch (error) {
            console.error('Error adding/updating product:', error.response ? error.response.data : error.message);
            setErrorMessage(error.response ? error.response.data.message : 'Error adding/updating product.');
            setSnackOpen(true);
        }
    };

    const handleEdit = (product) => {
        setEditingProductId(product._id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image: null,  // Reset image as a new one is required on edit
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${id}`);
                setProducts(products.filter((product) => product._id !== id));
            } catch (error) {
                console.error('Error deleting product:', error.response ? error.response.data : error.message);
            }
        }
    };

    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page
    };

    // Paginated products
    const paginatedProducts = products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div className="admin-product-page container">
            <Typography variant="h4" gutterBottom>
                Manage Products
            </Typography>
            {errorMessage && (
                <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
                    <Alert onClose={handleSnackClose} severity="error">
                        {errorMessage}
                    </Alert>
                </Snackbar>
            )}
            <div className="admin-product-layout">
                <div className="form-container">
                    <form onSubmit={handleSubmit} className="mb-4">
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Product Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <input
                                    type="file"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary">
                                    {editingProductId ? 'Update Product' : 'Add Product'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </div>
                <div className="product-list-container">
                    <Typography variant="h6" gutterBottom>
                        Product List
                    </Typography>
                    <TableContainer component={Paper} className="product-table">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedProducts.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.description}</TableCell>
                                        <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>
                                            <img src={`http://localhost:5000/${product.imageUrl}`} alt={product.name} className="img-thumbnail" style={{ width: '50px' }} />
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEdit(product)} variant="outlined" color="warning" className="me-2">
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleDelete(product._id)} variant="outlined" color="error">
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
                        count={products.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminProductPage;
