const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const schema = new mongoose.Schema({
        title: String,
        from: mongoose.Schema.Types.Mixed, // Can be ObjectId, string, or object for deleted users
        to: [mongoose.Schema.Types.Mixed], // Can be ObjectIds, strings, or objects for deleted users
        content: String,
        sentAt: Date,
        fromDeleted: { type: Boolean, default: false }, // Flag for deleted sender
        toDeleted: [{ type: Boolean, default: false }], // Flags for deleted recipients
    },
    { timestamps: true 
});

// Virtual for getting sender username
schema.virtual('fromUsername').get(function() {
    if (typeof this.from === 'string') {
        return this.from;
    }
    if (this.from && typeof this.from === 'object') {
        return this.from.username || 'Deleted User';
    }
    return 'Unknown User';
});

// Virtual for getting recipient usernames
schema.virtual('toUsernames').get(function() {
    if (!this.to) return [];
    return this.to.map(recipient => {
        if (typeof recipient === 'string') {
            return recipient;
        }
        if (recipient && typeof recipient === 'object') {
            return recipient.username || 'Deleted User';
        }
        return 'Unknown User';
    });
});

// Ensure virtuals are serialized
schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

schema.plugin(mongoosePaginate);

const message = mongoose.model(
    "message",
    schema
);

module.exports = message;
