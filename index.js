const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connectToDatabase } = require('./config/db');
const authenticateJWT = require('./services/authMiddle');
const client = require('prom-client');

// Import routes
const authRoutes = require('./routes/authRoutes');
const policyRoutes = require('./routes/policyRoutes');
const policiesRoutes = require('./routes/policiesRoutes');
const claimRoutes = require('./routes/claimRoutes');

dotenv.config();

const app = express();
const register = new client.Registry();
const collectDefaultMetrics = client.collectDefaultMetrics;

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Custom metric for HTTP request duration
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  registers: [register],
});

// Middleware to record the duration of requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    httpRequestDurationMicroseconds.observe({ method: req.method, route: req.path, code: res.statusCode }, duration);
  });

  next();
});

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware for request details
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'CMS API',
      version: '1.0.0',
      description: 'CMS API Information',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Front-end routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/dashboard', authenticateJWT, (req, res) => {
  res.render('dashboard', { page: 'dashboard' });
});

app.get('/dashboard/account', authenticateJWT, (req, res) => {
  res.render('account', { page: 'account', dashboard: true });
});

app.get('/policies', authenticateJWT, (req, res) => {
  res.render('policies', { page: 'policies' });
});

app.get('/dashboard/claims', authenticateJWT, (req, res) => {
  res.render('claim', { page: 'claims', dashboard: true });
});

// API routes
app.use('/user', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/dashboard/policies', policiesRoutes);
app.use('/api/claims', claimRoutes);

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3002;

// Connect to the database and start the server
connectToDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
      console.log(`Swagger documentation is available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database. Server not started.', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  // Optionally, you can decide to exit the process here
  // process.exit(1);
});

module.exports = app; // For testing purposes