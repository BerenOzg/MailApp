const db = require("../models");
const User = db.user;
const mongoose = require('mongoose');

const findRecipients = async (req, res, next) => {
    if(!req.body.to){
        res.status(400).send({ message: "Must send to at least 1 user!" });
        return;
    }

    // Convert usernames to user IDs if needed
    const recipientIds = [];
    for (const recipient of req.body.to) {
        if (mongoose.Types.ObjectId.isValid(recipient)) {
            // It's already a valid ObjectId
            recipientIds.push(recipient);
        } else {
            // It's a username, find the user
            const user = await User.findOne({ username: recipient });
            if (!user) {
                return res.status(400).send({ message: `User with username '${recipient}' does not exist!` });
            }
            recipientIds.push(user._id);
        }
    }

    // Verify all users exist
    const users = await User.find({ _id: { $in: recipientIds } });
    if(users.length !== recipientIds.length){
        return res.status(400).send({ message: "One or more recipients do not exist!" });
    }

    // Replace the to field with user IDs
    req.body.to = recipientIds;
    next();
};

const verifyRecipients = {
    findRecipients
};
module.exports = verifyRecipients;