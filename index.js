const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authenticateJWT = require('./services/authMiddle');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const client = require('prom-client');

// Import routes
const authRoutes = require('./routes/authRoutes');
const policyRoutes = require('./routes/policyRoutes');
const policiesRoutes = require('./routes/policiesRoutes');
const claimRouter = require('./routes/claimRoutes');

dotenv.config();

const app = express();
const register = new client.Registry();
const collectDefaultMetrics = client.collectDefaultMetrics;

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Custom metric example
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

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Stateless API',
      version: '1.0.0',
      description: 'API Documentation for Stateless Project',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
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
  apis: ['./routes/*.js'], // Path to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
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

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Use routers
app.use('/user', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/dashboard/policies', policiesRoutes);
app.use('/api/claims', claimRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});