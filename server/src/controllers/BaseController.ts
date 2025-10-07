import { Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * Base Controller Class
 * Provides common functionality for all controllers
 */
export abstract class BaseController {
  protected logRequest(req: Request, action: string) {
    logger.info(`${action} request`, {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id,
      lawFirmId: req.user?.lawFirmId,
      ip: req.ip,
    });
  }

  protected sendSuccess(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  protected sendError(res: Response, error: string, statusCode: number = 400, details?: any) {
    logger.error('Controller error', { error, details, statusCode });
    return res.status(statusCode).json({
      success: false,
      message: error,
      error: details || error,
      timestamp: new Date().toISOString(),
    });
  }

  protected sendNotFound(res: Response, resource: string = 'Resource') {
    return this.sendError(res, `${resource} not found`, 404);
  }

  protected sendUnauthorized(res: Response, message: string = 'Unauthorized access') {
    return this.sendError(res, message, 401);
  }

  protected sendForbidden(res: Response, message: string = 'Access forbidden') {
    return this.sendError(res, message, 403);
  }

  protected sendValidationError(res: Response, errors: any) {
    return this.sendError(res, 'Validation failed', 422, errors);
  }
}
