const allowStaffOrAdmin = (req, res, next) => {
  const role = req.user?.role;

  if (role === 'staff' || role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden. Staff or admin access required.'
  });
};

module.exports = {
  allowStaffOrAdmin
};
