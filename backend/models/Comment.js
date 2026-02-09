const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isOfficial: {
        type: Boolean,
        default: false
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }
}, {
    timestamps: true
});

commentSchema.index({ issue: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
