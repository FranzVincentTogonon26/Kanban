import ApiError from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  // Convert PostgreSQL unique constraint error to an ApiError
  if (err.code === "23505") {
    err = ApiError.conflict(
      "Resource already exists.",
      "RESOURCE_ALREADY_EXISTS",
    );
  }

  // Convert non-ApiError exceptions into a generic 500 error
  if (!(err instanceof ApiError)) {
    err = ApiError.internal();
  }

  // Log only server errors
  if (err.statusCode >= 500) {
    console.error("Server Error:", err);
  }

  res.status(err.statusCode).json({
    success: false,
    status: err.statusCode,
    code: err.code,
    message: err.message,
  });
};

export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound("Resource not found."));
};
