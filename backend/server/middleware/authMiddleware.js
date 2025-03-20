import jwt from "jsonwebtoken";

// ✅ Authentication Middleware (Verifies JWT Token)
const authMiddleware = (req, res, next) => {
  let token = req.header("Authorization");

  // Check if token is provided
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied - No Token Provided" });
  }

  // Ensure "Bearer " is removed correctly
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user data (id, role) in req.user
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Invalid Token" });
  }
};

// ✅ Role-Based Authorization Middleware
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No User Data" });
    }

    // Check if the user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access Denied: Unauthorized Role" });
    }

    next();
  };
};

export default authMiddleware;
