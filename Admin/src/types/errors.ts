export interface ApiError extends Error {
    response?: {
      data?: {
        message?: string;
        statusCode?: number;
      };
      status?: number;
    };
  }