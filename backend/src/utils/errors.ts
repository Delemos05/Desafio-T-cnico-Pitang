export class AppError extends Error {
  public statusCode: number;
  public error: string;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.error = this.getErrorName(statusCode);
    
    Error.captureStackTrace(this, this.constructor);
  }

  private getErrorName(statusCode: number): string {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error'
    };
    
    return errorNames[statusCode] || 'Internal Server Error';
  }

  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      error: this.error
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(`Invalid state transition from ${from} to ${to}`, 400);
  }
}
