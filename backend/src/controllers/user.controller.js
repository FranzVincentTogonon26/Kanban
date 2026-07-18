import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const usersList = async (req, res, next) => {
  try {
    const isAdmin = await User.findUserById(req.user.id);
    if (!isAdmin.role.toLowerCase() === "admin")
      throw ApiError.forbidden("Only the admin can see members list");

    const users = await User.usersList();
    if (!users) {
      throw ApiError.notFound("No users found.");
    }

    return res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const isAdmin = await User.findUserById(req.user.id);
    if (!isAdmin.role.toLowerCase() === "admin")
      throw ApiError.forbidden("Only the admin can delete user");

    const user = await User.deleteUser(req.params.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { params } = req.body;

    const isAdmin = await User.findUserById(req.user.id);
    if (!isAdmin.role.toLowerCase() === "admin")
      throw ApiError.forbidden("Only the admin can update user");

    if (!params.data) {
      throw ApiError.badRequest("Status is required");
    }

    const validStatuses = ["active", "inactive", "suspended", "pending"];
    if (!validStatuses.includes(params.data)) {
      throw ApiError.badRequest("Invalid status value");
    }

    const user = await User.updateStatus(req.params.userId, params.data);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
