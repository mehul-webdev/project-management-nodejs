import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  console.log("here in middleware");
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
