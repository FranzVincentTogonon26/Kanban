import jwtToken from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("authorization")?.startsWith("Bearer ")
      ? req.header("authorization").split(" ")[1]
      : null;

    if (!token) {
      throw ApiError.unauthorized("No token provided");
    }

    const decoded = jwtToken.verify(token);
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (err) {
    if (err.isApiError) return next(err);
    next(ApiError.unauthorized("Invalid token"));
  }
};

export default authMiddleware;
