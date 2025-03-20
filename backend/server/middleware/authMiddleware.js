import jwt from "jsonwebtoken";

// Authentication Middleware (Verifies JWT Token)
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = decoded; // Stores user data (id, role) in req.user
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// Role-Based Authorization Middleware
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access Denied: Unauthorized Role" });
    }
    next();
  };
};

export default authMiddleware;
