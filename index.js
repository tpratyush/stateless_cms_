const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connectToDatabase } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const policyRoutes = require('./routes/policyRoutes');
const policiesRoutes = require('./routes/policiesRoutes');
const claimRoutes = require('./routes/claimRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

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
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/user', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/dashboard/policies', policiesRoutes);
app.use('/api/claims', claimRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;

// Connect to the database and start the server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
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