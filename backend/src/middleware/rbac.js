export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: insufficient role' });
  }
  next();
};

export const requireOwnerOrAdmin = (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const isOwner = req.task?.assignedTo?.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};