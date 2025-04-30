// Custom HTTP error class
export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message); // Call parent constructor
    this.name = 'HttpError'; // Set the error name for identification
    this.statusCode = statusCode; // Store the HTTP status code

    // Maintain proper stack trace (needed for V8 environments like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    } else {
      // Fallback for environments without captureStackTrace
      Object.setPrototypeOf(this, HttpError.prototype);
    }
  }
}