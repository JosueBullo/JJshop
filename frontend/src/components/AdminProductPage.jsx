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
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error(
          'Error fetching products:',
          error.response ? error.response.data : error.message
        );
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    // Validate all fields are filled
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category ||
      formData.images.length === 0
    ) {
      setErrorMessage('Please fill in all fields, including at least one image.');
      setSnackOpen(true);
      return;
    }
  
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('description', formData.description);
    productData.append('price', formData.price);
    productData.append('category', formData.category);
  
    // Convert the FileList to an array before using .forEach()
    Array.from(formData.images).forEach((image) => {
      productData.append('images', image);
    });
  
    try {
      if (editingProductId) {
        // Update an existing product
        await axios.put(
          `http://localhost:5000/api/products/${editingProductId}`,
          productData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setProducts(
          products.map((product) =>
            product._id === editingProductId ? { ...product, ...formData } : product
          )
        );
        setEditingProductId(null);
      } else {
        // Create a new product
        const response = await axios.post(
          'http://localhost:5000/api/products',
          productData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setProducts([...products, response.data.product]);
      }
      setFormData({ name: '', description: '', price: '', category: '', images: [] });
    } catch (error) {
      console.error(
        'Error adding/updating product:',
        error.response ? error.response.data : error.message
      );
      setErrorMessage(
        error.response ? error.response.data.message : 'Error adding/updating product.'
      );
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
      images: [],
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        setProducts(products.filter((product) => product._id !== id));
      } catch (error) {
        console.error(
          'Error deleting product:',
          error.response ? error.response.data : error.message
        );
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
        await axios.post('http://localhost:5000/api/products/bulk-delete', {
          ids: selectedProducts,
        });
        setProducts(
          products.filter((product) => !selectedProducts.includes(product._id))
        );
        setSelectedProducts([]);
      } catch (error) {
        console.error(
          'Error during bulk delete:',
          error.response ? error.response.data : error.message
        );
        setErrorMessage(
          error.response ? error.response.data.message : 'Error deleting products.'
        );
        setSnackOpen(true);
      }
    }
  };

  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const toggleDescription = (productId) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [productId]: !prevState[productId],
    }));
  };

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
    {
      name: 'description',
      label: 'Description',
      options: {
        customBodyRender: (value, tableMeta) => {
          const productId = products[tableMeta.rowIndex]._id;
          const isExpanded = expandedDescriptions[productId];

          return (
            <div>
              <Button
                onClick={() => toggleDescription(productId)}
                size="small"
                variant="text"
                color="primary"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
              {isExpanded && (
                <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  {value}
                </div>
              )}
            </div>
          );
        },
      },
    },
    {
      name: 'price',
      label: 'Price',
    },
    {
      name: 'category',
      label: 'Category',
    },
    {
      name: 'images',
      label: 'Images',
      options: {
        customBodyRender: (value) => {
          if (Array.isArray(value) && value.length > 0) {
            return (
              <div>
                {value.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url || img}
                    alt="Product"
                    style={{ width: '50px', marginRight: '10px' }}
                  />
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
            <Button
              onClick={() => handleEdit(products[tableMeta.rowIndex])}
              variant="outlined"
              color="warning"
            >
              Edit
            </Button>
            <Button
              onClick={() => handleDelete(products[tableMeta.rowIndex]._id)}
              variant="outlined"
              color="error"
            >
              Delete
            </Button>
          </div>
        ),
      },
    },
  ];

  const options = {
    filterType: 'checkbox',
    onRowsSelect: (currentRowsSelected, allRowsSelected) => {
      const selectedIds = allRowsSelected.map((row) => products[row.dataIndex]._id);
      setSelectedProducts(selectedIds);
    },
    onRowsDelete: () => {
      setSelectedProducts([]);
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
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Price"
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
              onChange={(e) => setFormData({ ...formData, images: e.target.files })}
              multiple
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="mt-3"
            >
              {editingProductId ? 'Update Product' : 'Add Product'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Button
        variant="outlined"
        color="error"
        onClick={handleBulkDelete}
        disabled={selectedProducts.length === 0}
        className="mb-3"
      >
        Delete Selected
      </Button>

      <MUIDataTable
        title={'Products List'}
        data={products}
        columns={columns}
        options={options}
      />
    </div>
  );
};

export default AdminProductPage;
