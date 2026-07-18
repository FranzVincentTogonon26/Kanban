import User from "../models/user.model.js";
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

    const user = await User.findUserById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized("User not found");
    }
    if (user.status?.toLowerCase() !== "active") {
      throw ApiError.unauthorized(
        "Your account is inactive. Contact administrator.",
      );
    }

    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (err) {
    if (err.isApiError) return next(err);
    next(ApiError.unauthorized("Invalid token"));
  }
};

export default authMiddleware;
