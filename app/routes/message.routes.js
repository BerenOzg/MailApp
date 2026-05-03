const { authJwt } = require("../middlewares");
const verifyRecipients = require("../middlewares/verifyRecipients");

module.exports = app => {
    const message = require("../controllers/message.controller.js");

    var router = require("express").Router();

    router.post("/send", 
        [authJwt.verifyToken, verifyRecipients.findRecipients],
        message.sendMessage);

    router.get("/inbox", 
        [authJwt.verifyToken], 
        message.getInbox);

    router.get("/outbox", 
        [authJwt.verifyToken], 
        message.getOutbox);
    
    router.get("/all", 
        [authJwt.verifyToken, authJwt.isAdmin], 
        message.getMessages);

    router.get("/:id", 
        [authJwt.verifyToken], 
        message.getMessage);

    app.use('/api/messages', router);
}