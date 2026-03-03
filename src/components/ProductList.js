import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = category ? { category } : {};
      const response = await productsAPI.getAll(params);
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  if (loading) {
    return <div data-testid="loading">Loading products...</div>;
  }

  if (error) {
    return <div data-testid="error" className="error-message" role="alert">{error}</div>;
  }

  return (
    <div className="product-list-container">
      <h2>Products</h2>
      
      <div className="filter-section">
        <label htmlFor="category-filter">Filter by Category:</label>
        <select 
          id="category-filter"
          value={category} 
          onChange={handleCategoryChange}
          data-testid="category-filter"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      <div className="products-grid" data-testid="products-grid">
        {products.length === 0 ? (
          <p data-testid="no-products">No products found</p>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card" data-testid="product-card">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p className="product-category">Category: {product.category}</p>
              <p className="product-stock">Stock: {product.stock}</p>
              <button className="add-to-cart-btn">Add to Cart</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
