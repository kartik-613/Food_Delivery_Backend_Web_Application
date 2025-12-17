const { User } = require('../models/user.model');

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }
    const user = await User.findById(userId)
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

module.exports = { getCurrentUser };
