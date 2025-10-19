// config/cookieOptions.js
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true for HTTPS (Render)
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-site cookies
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  path: "/", // 👈 ensures cookie is valid for all routes
};
