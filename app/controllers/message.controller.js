const db = require("../models");
const Message = db.message;
const mongoose = require('mongoose');
const User = db.user;

exports.sendMessage = async (req, res) => {

    if(!req.body){
        res.status(400).send({ message: "Invalid request body!" });
        return;
    }

    if(!req.body.content){
        res.status(400).send({ message: "Content can't be empty!" });
        return;
    }

    if(!req.body.title){
        res.status(400).send({ message: "Title can't be empty!" });
        return;
    }

    if(!req.body.to){
        res.status(400).send({ message: "Must send to at least 1 user!" });
        return;
    }

    const message = new Message({
        title: req.body.title,
        content: req.body.content,
        from: req.user._id,
        to: req.body.to,
        sentAt: new Date()
    });

    const data = await message.save();
    
    // Populate user data for response, handling deleted users
    const populatedData = await Message.findById(data._id);
    await populateMessageUsers(populatedData);
    
    res.send(populatedData);
    return;
};

exports.getInbox = async (req, res) => {
    // For inbox, we filter by current user being in the 'to' array
    // No need to check authorization here since we're filtering by the current user
    const { sentAtFrom, sentAtTo, title, content } = req.query;
    const { page, size } = req.query;
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
    
    let filter = { to: req.user._id };
    
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (content) filter.content = { $regex: content, $options: 'i' };
    if (sentAtFrom || sentAtTo) {
        filter.sentAt = {};
        if (sentAtFrom) filter.sentAt.$gte = new Date(sentAtFrom);
        if (sentAtTo) filter.sentAt.$lte = new Date(sentAtTo);
    }
    
    try {
        const data = await Message.paginate(filter, { 
            offset, 
            limit
        });
        
        // Populate user data for each message, handling deleted users
        for (let message of data.docs) {
            await populateMessageUsers(message);
        }
        
        res.send({
            totalItems: data.totalDocs,
            messages: data.docs,
            totalPages: data.totalPages,
            currentPage: data.page
        });
    } catch (err) {
        res.status(500).send({ message: err.message || "Could not fetch messages." });
    }
};

exports.getOutbox = async (req, res) => {
    // For outbox, we filter by current user being the sender
    const { sentAtFrom, sentAtTo, title, content } = req.query;
    const { page, size } = req.query;
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
    
    let filter = { from: req.user._id };
    
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (content) filter.content = { $regex: content, $options: 'i' };
    if (sentAtFrom || sentAtTo) {
        filter.sentAt = {};
        if (sentAtFrom) filter.sentAt.$gte = new Date(sentAtFrom);
        if (sentAtTo) filter.sentAt.$lte = new Date(sentAtTo);
    }
    
    try {
        const data = await Message.paginate(filter, { 
            offset, 
            limit
        });
        
        // Populate user data for each message, handling deleted users
        for (let message of data.docs) {
            await populateMessageUsers(message);
        }
        
        res.send({
            totalItems: data.totalDocs,
            messages: data.docs,
            totalPages: data.totalPages,
            currentPage: data.page
        });
    } catch (err) {
        res.status(500).send({ message: err.message || "Could not fetch messages." });
    }
};

exports.getMessages = async (req, res) => {
    
    const { from, to, sentAtFrom, sentAtTo, title, content } = req.query;
    const { page, size } = req.query;
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
    
    let filter = {};
    
    if (from) {
        // Convert username to user ID if needed
        if (mongoose.Types.ObjectId.isValid(from)) {
            filter.from = from;
        } else {
            const user = await User.findOne({ username: from });
            if (user) {
                filter.from = user._id;
            }
        }
    }
    
    if (to) {
        // Convert username to user ID if needed
        if (mongoose.Types.ObjectId.isValid(to)) {
            filter.to = to;
        } else {
            const user = await User.findOne({ username: to });
            if (user) {
                filter.to = user._id;
            }
        }
    }
    
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (content) filter.content = { $regex: content, $options: 'i' };
    if (sentAtFrom || sentAtTo) {
        filter.sentAt = {};
        if (sentAtFrom) filter.sentAt.$gte = new Date(sentAtFrom);
        if (sentAtTo) filter.sentAt.$lte = new Date(sentAtTo);
    }
    
    try {
        const data = await Message.paginate(filter, { 
            offset, 
            limit
        });
        
        // Populate user data for each message, handling deleted users
        for (let message of data.docs) {
            await populateMessageUsers(message);
        }
        
        res.send({
            totalItems: data.totalDocs,
            messages: data.docs,
            totalPages: data.totalPages,
            currentPage: data.page
        });
    } catch (err) {
        res.status(500).send({ message: err.message || "Could not fetch messages." });
    }
};

exports.getMessage = async (req, res) => {
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ message: "Invalid message ID." });
    }
    
    const message = await Message.findById(req.params.id);

    if (!message) {
        return res.status(404).send({ message: "Message not found." });
    }

    // Populate user data, handling deleted users
    await populateMessageUsers(message);

    // Check if current user is a recipient
    const isRecipient = message.to.some(recipient => {
        const recipientId = typeof recipient === 'object' ? recipient._id : recipient;
        return recipientId.toString() === req.user._id.toString();
    });
    
    if (isRecipient) {
        res.send(message);
        return;
    } else if (message.from && typeof message.from === 'object' && message.from._id.toString() === req.user._id.toString()) {
        res.send(message);
        return;
    } else if (req.user.isAdmin) {
        res.send(message);
        return;
    } else {
        res.status(403).send({ message: "You are not authorized to view this message!" });
        return;
    }
};

// Helper function to populate user data, handling deleted users
async function populateMessageUsers(message) {
    // Handle sender
    if (message.from && mongoose.Types.ObjectId.isValid(message.from)) {
        const sender = await User.findById(message.from);
        if (sender) {
            message.from = {
                _id: sender._id,
                username: sender.username,
                email: sender.email
            };
        } else {
            // Sender was deleted
            message.from = {
                _id: message.from,
                username: "Deleted User",
                email: "deleted@user.com",
                isDeleted: true
            };
        }
    }
    
    // Handle recipients
    if (message.to && Array.isArray(message.to)) {
        const populatedRecipients = [];
        for (let recipient of message.to) {
            if (mongoose.Types.ObjectId.isValid(recipient)) {
                const user = await User.findById(recipient);
                if (user) {
                    populatedRecipients.push({
                        _id: user._id,
                        username: user.username,
                        email: user.email
                    });
                } else {
                    // Recipient was deleted
                    populatedRecipients.push({
                        _id: recipient,
                        username: "Deleted User",
                        email: "deleted@user.com",
                        isDeleted: true
                    });
                }
            } else {
                // Already populated or deleted user placeholder
                populatedRecipients.push(recipient);
            }
        }
        message.to = populatedRecipients;
    }
}