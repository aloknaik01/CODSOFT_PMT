class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;   // field-level validation errors array
    this.success = false;
  }
}

export default ApiError;