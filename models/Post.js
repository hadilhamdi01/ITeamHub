const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    media: { type: String }, 
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);