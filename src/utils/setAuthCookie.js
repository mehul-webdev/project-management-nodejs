import { cookieOptions } from "../config/cookieOptions.js";

/**
 * ✅ Set authentication cookie
 */
export const setAuthCookie = (res, token, options = {}) => {
  res.cookie("token", token, { ...cookieOptions, ...options });
};

/**
 * 🚪 Clear authentication cookie
 */
export const clearAuthCookie = (res, options = {}) => {
  res.clearCookie("token", { ...cookieOptions, ...options });
};
