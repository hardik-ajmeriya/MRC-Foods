const { protect, authorizeRoles } = require('./authMiddleware');

module.exports = protect;
module.exports.protect = protect;
module.exports.authorizeRoles = authorizeRoles;
