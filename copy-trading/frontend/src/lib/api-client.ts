import axios from 'axios';
import { logger } from './telemetry/logger';
import { v4 as uuidv4 } from 'uuid';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_LEARNLEDGER_API_URL || 'http://localhost:3001'
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const correlationId = uuidv4();
    config.headers['x-correlation-id'] = correlationId;

    logger.info({
      msg: 'API Request',
      method: config.method,
      url: config.url,
      correlationId,
      data: config.data
    });

    return config;
  },
  (error) => {
    logger.error({
      msg: 'Request setup failed',
      error: error.message
    });
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    logger.info({
      msg: 'API Response',
      status: response.status,
      url: response.config.url,
      correlationId: response.headers['x-correlation-id']
    });
    return response;
  },
  (error) => {
    logger.error({
      msg: 'API Error',
      status: error.response?.status,
      url: error.config?.url,
      correlationId: error.config?.headers?.['x-correlation-id'],
      error: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export { apiClient };