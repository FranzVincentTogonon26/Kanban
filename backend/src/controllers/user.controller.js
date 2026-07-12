import User from "../models/user.model";

const searchUsers = async (req, res, next) => {
  try {
    const query = (req.query.q || "").trim();
    if (query.legth < 2) return res.json({ users: [] });

    const users = await User.searchUsers(query);
    res.json({ users: users });
  } catch (err) {
    next(err);
  }
};

export { searchUsers };
