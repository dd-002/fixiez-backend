// Check if the user is logged in
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized: Please log in" });
};

// Check if the user has a specific role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // If the role in the session isn't in the allowed list, deny access
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ 
        message: `Role: ${req.session.role} is not allowed to access this resource` 
      });
    }
    next();
  };
};

const validateSession = async (req, res, next) => {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId).select('passwordVersion');
    
    // If user changed password, the DB version will be higher than the session version
    if (!user || user.passwordVersion !== req.session.passwordVersion) {
      return req.session.destroy(() => {
        res.status(401).json({ message: "Session expired due to password change." });
      });
    }
  }
  next();
};