import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import { configureSecurity, apiRateLimiter } from './shared/middleware/security';
import { requestLogger } from './shared/middleware/logger';
import { errorHandler } from './shared/middleware/errorHandler';

// Route imports
import healthRoutes from './shared/routes/health.routes';
import familyRoutes from './modules/family/routes/family.routes';
import schemeRoutes from './modules/schemes/routes/scheme.routes';
import applicationRoutes from './modules/applications/routes/application.routes';
import eligibilityRoutes from './modules/eligibility/routes/eligibility.routes';
import benefitRoutes from './modules/benefits/routes/benefit.routes';
import verificationRoutes from './modules/verification/routes/verification.routes';
import dataQualityRoutes from './modules/data-quality/routes/data-quality.routes';
import notificationRoutes from './modules/notifications/routes/notification.routes';
import dashboardRoutes from './modules/dashboard/routes/dashboard.routes';

const app = express();

// Security and utility middleware
app.use(configureSecurity());
app.use(express.json({ limit: '1mb' })); // Prevent huge payloads
app.use(requestLogger);
app.use('/api/', apiRateLimiter); // Apply rate limiter to /api routes

// Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount routes
app.use('/', healthRoutes);
app.use('/api/v1/families', familyRoutes);
app.use('/api/v1/schemes', schemeRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/eligibility', eligibilityRoutes);
app.use('/api/v1/benefits', benefitRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/data-quality', dataQualityRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Fallback for 404
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`
    }
  });
});

// Global error handler
app.use(errorHandler);

export default app;
