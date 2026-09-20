export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static notFound(message: string): AppError {
    return new AppError(ErrorCode.NOT_FOUND, message, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(ErrorCode.CONFLICT, message, 409);
  }

  static validation(message: string, details?: any): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 422, details);
  }

  static unauthorized(message: string): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
  }

  static forbidden(message: string): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message, 403);
  }

  static businessRuleViolation(message: string): AppError {
    return new AppError(ErrorCode.BUSINESS_RULE_VIOLATION, message, 422);
  }

  static invalidStateTransition(message: string): AppError {
    return new AppError(ErrorCode.INVALID_STATE_TRANSITION, message, 409);
  }

  static internalError(message: string): AppError {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
  }
}

