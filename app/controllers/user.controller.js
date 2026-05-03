const db = require("../models");
const mongoose = require('mongoose');
const User = db.user;
const Message = db.message;

var bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.getAllUsers = async (req, res) => {

  const { username, email, isAdmin } = req.query;
  const { page, size } = req.query;
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

  let filter = {};

  if(username) filter.username = { $regex: username, $options: 'i' };
  if(email) filter.email = email;
  if(isAdmin) filter.isAdmin = isAdmin;

  try {
    const data = await User.paginate(filter, { offset, limit });
    res.send({
      totalUsers: data.totalDocs,
      users: data.docs,
      totalPages: data.totalPages,
      currentPage: data.page
    });
  } catch(err) {
    res.status(500).send(err.message || "Failed to fetch users.");
  }
};

exports.getUserById = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ message: "Invalid user ID." });
  }

  try {
    const data = await User.findById(req.params.id);
    if(!data) return res.status(404).send("User not found.");

    if(!(req.user.isAdmin || req.user.username === data.username)) {
      const restrictedData = { 
        username: data.username, 
        //email: data.email,
        isAdmin: data.isAdmin
      };
      return res.send(restrictedData);
    }

    res.send({
      username: data.username, 
      email: data.email,
      isAdmin: data.isAdmin
    });
    
  } catch(err) {
    res.status(500).send(err.message || "Failed to fetch the user.");
  }
};

exports.updateUser = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ message: "Invalid user ID." });
  }

  const user = await User.findById(req.params.id);
  //const user = req.user;
  if (!user) {
    return res.status(404).send({ message: "User not found." });
  }

  if(!req.user.isAdmin && req.user.username !== user.username) {
    return res.status(400).send({ message: "You are not authorized to update this user!" });
  }

  const { username, email, isAdmin } = req.body;
  user.username = username ?? user.username;
  user.email = email ?? user.email;
  user.isAdmin = isAdmin ?? user.isAdmin;
  //if(password) user.password = bcrypt.hashSync(req.body.password, 8);

  try {
    await user.save();
    res.send({ message: "User updated successfully." });
  } catch (err) {
    res.status(500).send(err.message || "Failed to update user.");
  }
};

exports.addUser = async (req, res) => {
  const { username, email, isAdmin, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send({ message: "Username, email and password are required!" });
  }

  const user = new User({
    username,
    email,
    isAdmin: isAdmin || false,
    password: bcrypt.hashSync(password, 8)
  });

  try {
    await user.save();
    res.send({ message: "User was registered successfully!" });
  } catch (err) {
    res.status(500).send(err.message || "Failed to register user.");
  }
};

exports.deleteUser = async (req, res) => {
    console.log("deleteUser function called with ID:", req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        console.log("Invalid user ID provided");
        return res.status(400).send({ message: "Invalid user ID." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        console.log("User not found");
        return res.status(404).send({ message: "User not found." });
    }

    // Prevent self-deletion
    if (req.user._id.toString() === req.params.id) {
        console.log("Attempted self-deletion");
        return res.status(400).send({ message: "You cannot delete your own account!" });
    }

    try {
        console.log("Starting user deletion process");
        
        // Create a "deleted user" placeholder
        const deletedUserPlaceholder = {
            _id: user._id,
            username: "Deleted User",
            email: "deleted@user.com",
            isAdmin: false,
            isDeleted: true
        };

        // Update messages where this user is the sender
        const senderUpdateResult = await Message.updateMany(
            { from: user._id },
            { 
                $set: { 
                    from: deletedUserPlaceholder,
                    fromDeleted: true 
                } 
            }
        );
        console.log("Updated messages where user was sender:", senderUpdateResult.modifiedCount);

        // Update messages where this user is a recipient
        const messagesWithUserAsRecipient = await Message.find({ to: user._id });
        console.log("Found messages with user as recipient:", messagesWithUserAsRecipient.length);
        
        for (const message of messagesWithUserAsRecipient) {
            // Replace the user ID with the deleted user placeholder
            const updatedTo = message.to.map(recipient => {
                if (recipient.toString() === user._id.toString()) {
                    return deletedUserPlaceholder;
                }
                return recipient;
            });
            
            await Message.findByIdAndUpdate(message._id, {
                to: updatedTo
            });
        }
        console.log("Updated recipient lists for messages");

        // Delete the actual user
        await User.findByIdAndDelete(req.params.id);
        console.log("User deleted successfully");

        res.send({ message: "User deleted successfully. Messages have been updated to show 'Deleted User'." });
    } catch (err) {
        console.error("Error in deleteUser:", err);
        res.status(500).send(err.message || "Failed to delete user.");
    }
};