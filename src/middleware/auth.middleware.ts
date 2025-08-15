import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * API Key Authentication Middleware
 * Validates API key from X-API-Key header or api_key query parameter
 */
export const authenticateApiKey: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const headerKey = req.headers['x-api-key'];
  const queryKey = req.query.api_key as string | undefined;
  const apiKey = (Array.isArray(headerKey) ? headerKey[0] : headerKey) || queryKey;
  const validApiKey = process.env.API_KEY;

  // Check if API key is configured
  if (!validApiKey) {
    return res.status(500).json({
      error: 'API key not configured on server',
      message: 'Please set API_KEY environment variable'
    });
  }

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide API key in X-API-Key header or api_key query parameter'
    });
  }

  // Validate API key
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  // Store API key in request for potential logging
  (req as any).apiKey = apiKey;
  next();
};

/**
 * Optional API key middleware for endpoints that can work with or without auth
 */
export const optionalApiKey: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const headerKey = req.headers['x-api-key'];
  const queryKey = req.query.api_key as string | undefined;
  const apiKey = (Array.isArray(headerKey) ? headerKey[0] : headerKey) || queryKey;
  const validApiKey = process.env.API_KEY;

  if (apiKey && validApiKey && apiKey === validApiKey) {
    (req as any).apiKey = apiKey;
  }

  next();
};
