class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // adds message property 
    this.code = errorCode;
  }
}

module.exports = HttpError;