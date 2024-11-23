import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MUIDataTable from 'mui-datatables';
import { TextField, Button, Snackbar, Alert, Grid } from '@mui/material';
import './AdminProductPage.css';

const AdminProductPage = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [],
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data); // Ensure response.data is an array
      } catch (error) {
        console.error('Error fetching products:', error.response ? error.response.data : error.message);
      }
    };
    fetchProducts();
  }, []);

  // Handle form submission for adding/editing products
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.description || !formData.price || !formData.category || formData.images.length === 0) {
      setErrorMessage('Please fill in all fields, including at least one image.');
      setSnackOpen(true);
      return;
    }

    // Prepare FormData
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('description', formData.description);
    productData.append('price', formData.price);
    productData.append('category', formData.category);
    formData.images.forEach((image) => {
      productData.append('images', image); // Append each image
    });

    try {
      if (editingProductId) {
        await axios.put(`http://localhost:5000/api/products/${editingProductId}`, productData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProducts(products.map((product) =>
          product._id === editingProductId ? { ...product, ...formData } : product
        ));
        setEditingProductId(null);
      } else {
        const response = await axios.post('http://localhost:5000/api/products', productData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProducts([...products, response.data.product]);
      }
      setFormData({ name: '', description: '', price: '', category: '', images: [] });
    } catch (error) {
      console.error('Error adding/updating product:', error.response ? error.response.data : error.message);
      setErrorMessage(error.response ? error.response.data.message : 'Error adding/updating product.');
      setSnackOpen(true);
    }
  };

  // Handle edit button click
  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: [], // Assuming no images are preselected for editing
    });
  };

  // Handle delete of a single product
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

  const handleBulkDelete = async () => {
    if (window.confirm('Are you sure you want to delete the selected products?')) {
      if (selectedProducts.length === 0) {
        setErrorMessage('No products selected for deletion.');
        setSnackOpen(true);
        return;
      }
  
      try {
        // Sending the selected product IDs in the request body
        const response = await axios.post('http://localhost:5000/api/products/bulk-delete', {
          ids: selectedProducts, // Ensure selectedProducts is an array of IDs
        });
  
        // Update the state to remove deleted products
        setProducts(products.filter((product) => !selectedProducts.includes(product._id)));
        setSelectedProducts([]); // Reset selected products after delete
      } catch (error) {
        console.error('Error during bulk delete:', error.response ? error.response.data : error.message);
        setErrorMessage(error.response ? error.response.data.message : 'Error deleting products.');
        setSnackOpen(true);
      }
    }
  };
  // Handle Snackbar close
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  // Columns for the MUI DataTable
  const columns = [
    {
      name: 'name',
      label: 'Name',
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => <strong>{value}</strong>,
      },
    },
    'description',
    'price',
    'category',
    {
      name: 'images',
      label: 'Images',
      options: {
        // customBodyRender: (value) => {
        //   if (Array.isArray(value)) {
        //     return (
        //       <div>
        //         {value.map((img, idx) => (
        //           <img key={idx} src={img.url} alt="Product" style={{ width: '50px', marginRight: '10px' }} />
        //         ))}
        //       </div>
        //     );
        //   }
        //   return null;
        // },
        customBodyRender: (value) => {
            if (Array.isArray(value) && value.length > 0) {
                return (
                    <div>
                        {value.map((img, idx) => (
                            <img key={idx} src={img.url || img} alt="Product" style={{ width: '50px', marginRight: '10px' }} />
                        ))}
                    </div>
                );
            }
            return <span>No image</span>;
        },
        
      },
    },
    {
      name: 'actions',
      label: 'Actions',
      options: {
        customBodyRender: (value, tableMeta) => (
          <div>
            <Button onClick={() => handleEdit(products[tableMeta.rowIndex])} variant="outlined" color="warning" className="me-2">
              Edit
            </Button>
            <Button onClick={() => handleDelete(products[tableMeta.rowIndex]._id)} variant="outlined" color="error">
              Delete
            </Button>
          </div>
        ),
      },
    },
  ];

  const options = {
    filterType: 'checkbox',
    onRowsSelect: (currentRowsSelected) => {
      // Get selected product IDs based on row selection
      const selectedIds = currentRowsSelected.map((row) => products[row.dataIndex]._id); // Use row.dataIndex instead of row.index
      setSelectedProducts(selectedIds);
    },
  };

  return (
    <div className="admin-product-page container">
      <h1>Manage Products</h1>
      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>

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
              multiple
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, images: [...e.target.files] })}
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" color="primary">
          {editingProductId ? 'Update Product' : 'Add Product'}
        </Button>
      </form>

      <Button onClick={handleBulkDelete} variant="contained" color="secondary">
        Bulk Delete
      </Button>

      <MUIDataTable
        title={'Product List'}
        data={products}
        columns={columns}
        options={options}
      />
    </div>
  );
};

export default AdminProductPage;
