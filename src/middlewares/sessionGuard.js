// middleware/sessionGuard.js

export const validateSession = (req, res, next) => {
  // If the user is NOT authenticated but a session cookie exists, 
  // it means deserializeUser returned 'false' (version mismatch)
  if (req.cookies['connect.sid'] && !req.isAuthenticated()) {
    
    // 1. Destroy the stale session on the server
    return req.session.destroy((err) => {
      // 2. Clear the cookie on the client
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
      });

      // 3. Optional: Redirect to login with a specific message
      return res.status(401).json({ 
        message: "Session expired. Your password was changed or your account was updated." 
      });
    });
  }

  next();
};