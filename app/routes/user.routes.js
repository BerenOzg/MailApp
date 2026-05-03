const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/test/add", [authJwt.verifyToken, authJwt.isAdmin], controller.addUser);
  
  app.get("/api/test/all", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllUsers);

  app.delete("/api/test/delete/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteUser);

  app.get("/api/test/:id", [authJwt.verifyToken], controller.getUserById);
  
  app.put("/api/test/:id", [authJwt.verifyToken], controller.updateUser);
};