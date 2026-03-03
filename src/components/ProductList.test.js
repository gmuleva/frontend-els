import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductList from './ProductList';
import { productsAPI } from '../services/api';

jest.mock('../services/api');

describe('ProductList Component Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProducts = [
    {
      _id: '1',
      name: 'Laptop Pro',
      description: 'High-performance laptop',
      price: 1299.99,
      category: 'Electronics',
      stock: 10
    },
    {
      _id: '2',
      name: 'Wireless Mouse',
      description: 'Ergonomic mouse',
      price: 29.99,
      category: 'Electronics',
      stock: 50
    },
    {
      _id: '3',
      name: 'Office Chair',
      description: 'Comfortable chair',
      price: 299.99,
      category: 'Furniture',
      stock: 20
    }
  ];

  it('should display loading state initially', () => {
    productsAPI.getAll.mockImplementation(() => new Promise(() => {}));
    
    render(<ProductList />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading products...');
  });

  it('should fetch and display all products', async () => {
    productsAPI.getAll.mockResolvedValue({ data: mockProducts });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByTestId('products-grid')).toBeInTheDocument();
    });

    const productCards = screen.getAllByTestId('product-card');
    expect(productCards).toHaveLength(3);

    expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Office Chair')).toBeInTheDocument();

    expect(screen.getByText('$1299.99')).toBeInTheDocument();
  });

  it('should display error message when API fails', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Failed to load products'
        }
      }
    };

    productsAPI.getAll.mockRejectedValue(mockError);

    render(<ProductList />);

    await waitFor(() => {
      const errorElement = screen.getByTestId('error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Failed to load products');
    });
  });

  it('should display message when no products found', async () => {
    productsAPI.getAll.mockResolvedValue({ data: [] });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByTestId('no-products')).toBeInTheDocument();
      expect(screen.getByTestId('no-products')).toHaveTextContent('No products found');
    });
  });

  it('should have category filter dropdown', async () => {
    productsAPI.getAll.mockResolvedValue({ data: mockProducts });

    render(<ProductList />);

    await waitFor(() => {
      const categoryFilter = screen.getByTestId('category-filter');
      expect(categoryFilter).toBeInTheDocument();
    });

    const categoryFilter = screen.getByTestId('category-filter');
    expect(categoryFilter).toHaveValue('');
    
    const options = categoryFilter.querySelectorAll('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('All Categories');
    expect(options[1]).toHaveTextContent('Electronics');
  });
});
