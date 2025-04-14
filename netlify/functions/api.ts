import express, { Router } from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes';

const api = express();

// Setup middleware
api.use(express.json());
api.use(express.urlencoded({ extended: false }));

// CORS middleware
api.use((req, res, next) => {
  const allowedOrigins = [
    'https://manasvi0109.github.io',
    'http://localhost:5000',
    'http://localhost:3000'
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Register routes
const router = Router();
registerRoutes(router);
api.use('/.netlify/functions/api', router);

// Export handler for serverless
export const handler = serverless(api);
