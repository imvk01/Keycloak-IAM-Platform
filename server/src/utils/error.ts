export interface AppError extends Error {
    codeStatus?: number;
  }
  
  export const errorHandler = (codeStatus: number, message: string): AppError => {
    const error = new Error(message) as AppError;
    error.codeStatus = codeStatus;
    return error;
  };