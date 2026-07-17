import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './controllers/auth.controller';
import productRoutes from './controllers/product.controller';
import cartRoutes from './controllers/cart.controller';
import orderRoutes from './controllers/order.controller';
import contactRoutes from './controllers/contact.controller';
import cmsRoutes from './controllers/cms.controller';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/cms', cmsRoutes);

// Root/Health route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'CameraRent API Gateway',
    timestamp: new Date(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    service: 'CameraRent API Gateway - Subendpoints Active',
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
