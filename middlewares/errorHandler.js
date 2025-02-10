class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
  }
}

const errorHandler = (err, req, res, next) => {    
    
  if (!err) {
    return res.status(500).json({ error: "Internal Server Error!" });
  }

  if (err instanceof CustomError) {
    console.log("Inside error");
    
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: err.message });
};

export { CustomError, errorHandler };