const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Community = require("../models/Community");

router.post("/vote", async (req, res) => {
    const { postId, type } = req.body;

    // Validate input
    if (!postId || !["upvote", "downvote"].includes(type)) {
        return res.status(400).json({ error: "Invalid request data" });
    }

    try {
        // Convert postId to ObjectId
        const postIdObjectId = mongoose.Types.ObjectId(postId);

        // Log the postId being searched for debugging
        console.log("Request to vote: postId=" + postId + ", type=" + type);

        // Find the community containing the post in the 'communityDB' collection
        const community = await Community.findOne({ "posts.id": postIdObjectId }).exec();

        // Log the result of the community query
        console.log("Found community: ", community ? community.name : "Not found");

        if (!community) {
            return res.status(404).json({ error: "Community not found" });
        }

        // Loop through the posts array to find the correct post by comparing ObjectIds
        let post = null;
        let postIndex = -1;
        for (let i = 0; i < community.posts.length; i++) {
            if (community.posts[i].id.equals(postIdObjectId)) {
                post = community.posts[i];
                postIndex = i;
                break;
            }
        }

        // Log the result of the post search
        console.log("Found post: ", postIndex !== -1 ? post.title : "Not found");

        if (postIndex === -1) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Update the upvotes or downvotes based on the type
        if (type === "upvote") {
            post.upvotes += 1;
        } else if (type === "downvote") {
            post.downvotes += 1;
        }

        // Save the updated community document
        await community.save();

        // Return the updated vote count
        res.status(200).json({ success: true, updatedCount: type === "upvote" ? post.upvotes : post.downvotes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;