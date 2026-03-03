import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import axios from 'axios';

const { like, eachLike, string } = MatchersV3;

const provider = new PactV3({
  consumer: 'ECommerceFrontend',
  provider: 'ECommerceAPI',
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'info'
});

const PACT_BROKER_URL = process.env.PACT_BROKER_URL || 'https://api.dev.eyfabric.ey.com/pactbroker/test';
const PACT_BROKER_USERNAME = process.env.PACT_BROKER_USERNAME || 'pact';
const PACT_BROKER_PASSWORD = process.env.PACT_BROKER_PASSWORD || 'pact123';

describe('E-Commerce API Pact Consumer Tests', () => {
  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      await provider
        .given('user does not exist')
        .uponReceiving('a request to register a new user')
        .withRequest({
          method: 'POST',
          path: '/api/auth/register',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            email: 'newuser@example.com',
            password: 'password123',
            name: 'New User'
          }
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: like({
            message: 'User registered successfully',
            userId: string('123'),
            user: like({
              email: 'newuser@example.com',
              name: 'New User',
              role: 'customer'
            })
          })
        })
        .executeTest(async (mockServer) => {
          const api = axios.create({
            baseURL: mockServer.url,
            headers: { 'Content-Type': 'application/json' }
          });

          const response = await api.post('/api/auth/register', {
            email: 'newuser@example.com',
            password: 'password123',
            name: 'New User'
          });

          expect(response.status).toBe(201);
          expect(response.data.message).toBe('User registered successfully');
          expect(response.data.userId).toBeDefined();
          expect(response.data.user.email).toBe('newuser@example.com');
        });
    });

    it('should login with valid credentials', async () => {
      await provider
        .given('user exists')
        .uponReceiving('a request to login')
        .withRequest({
          method: 'POST',
          path: '/api/auth/login',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            email: 'customer@example.com',
            password: 'customer123'
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: like({
            message: 'Login successful',
            token: string('token_123_456'),
            user: like({
              email: 'customer@example.com',
              name: string('Test Customer'),
              role: 'customer'
            })
          })
        })
        .executeTest(async (mockServer) => {
          const api = axios.create({
            baseURL: mockServer.url,
            headers: { 'Content-Type': 'application/json' }
          });

          const response = await api.post('/api/auth/login', {
            email: 'customer@example.com',
            password: 'customer123'
          });

          expect(response.status).toBe(200);
          expect(response.data.message).toBe('Login successful');
          expect(response.data.token).toBeDefined();
          expect(response.data.user.email).toBe('customer@example.com');
        });
    });
  });

  describe('Products API', () => {
    it('should get all products', async () => {
      await provider
        .given('products exist')
        .uponReceiving('a request to get all products')
        .withRequest({
          method: 'GET',
          path: '/api/products'
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: eachLike({
            _id: string('123'),
            name: string('Laptop Pro'),
            description: string('High-performance laptop'),
            price: like(1299.99),
            category: string('Electronics'),
            stock: like(10)
          })
        })
        .executeTest(async (mockServer) => {
          const api = axios.create({
            baseURL: mockServer.url
          });

          const response = await api.get('/api/products');

          expect(response.status).toBe(200);
          expect(Array.isArray(response.data)).toBe(true);
          expect(response.data.length).toBeGreaterThan(0);
          expect(response.data[0]).toHaveProperty('name');
          expect(response.data[0]).toHaveProperty('price');
          expect(response.data[0]).toHaveProperty('category');
        });
    });

    it('should get products filtered by category', async () => {
      await provider
        .given('products exist')
        .uponReceiving('a request to get products by category')
        .withRequest({
          method: 'GET',
          path: '/api/products',
          query: {
            category: 'Electronics'
          }
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: eachLike({
            _id: string('123'),
            name: string('Laptop Pro'),
            description: string('High-performance laptop'),
            price: like(1299.99),
            category: 'Electronics',
            stock: like(10)
          })
        })
        .executeTest(async (mockServer) => {
          const api = axios.create({
            baseURL: mockServer.url
          });

          const response = await api.get('/api/products', {
            params: { category: 'Electronics' }
          });

          expect(response.status).toBe(200);
          expect(Array.isArray(response.data)).toBe(true);
          response.data.forEach(product => {
            expect(product.category).toBe('Electronics');
          });
        });
    });
  });

  afterAll(() => {
    console.log('\n✅ Pact consumer tests completed successfully!');
    console.log('   📁 Pact files generated in:', path.resolve(process.cwd(), 'pacts'));
    console.log('\n💡 Next steps:');
    console.log('   1. Verify provider meets contracts:');
    console.log('      cd ../backend && npm run test:pact:provider:local');
    console.log('\n   2. (Optional) Publish to broker:');
    console.log('      npm run pact:publish');
    console.log('      Then run: cd ../backend && npm run test:pact:provider\n');
  });
});
