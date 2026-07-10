const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Server Error:", err);
  }

  if (err.code === "23505") {
    return res.status(409).json({ message: "Resource already exists." });
  }

  res.status(statusCode).json({
    message:
      statusCode >= 500
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ message: "Resource not found." });
};

export { errorHandler, notFoundHandler };
