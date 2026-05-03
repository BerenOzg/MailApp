const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const schema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    isAdmin: Boolean
});

schema.plugin(mongoosePaginate);

const user = mongoose.model(
    "User",
    schema
);

module.exports = user;