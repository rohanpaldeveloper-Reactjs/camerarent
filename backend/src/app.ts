import express from 'express';
import cors from 'cors';
import authRoutes from './controllers/auth.controller';
import productRoutes from './controllers/product.controller';
import cartRoutes from './controllers/cart.controller';
import orderRoutes from './controllers/order.controller';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Root/Health route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'CineRent API Gateway',
    timestamp: new Date(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    service: 'CineRent API Gateway - Subendpoints Active',
    timestamp: new Date(),
  });
});

// Fallback 404 Route
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express Error Handler caught:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred.',
  });
});

export default app;
