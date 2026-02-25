function isAuthenticated(req, res, next) {
  if (!req.session.userid) {
    return res.status(401).json({ message: "Not Authenticated" });
  }
  next();
}

// function isAuthorized(req,res,next){
//         if(req.session.role!="admin"){
//             return res.status(403).json({message:"Not Authorized"})
//         }
//         next()
//     }

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

module.exports = { isAuthenticated, allowRoles };
