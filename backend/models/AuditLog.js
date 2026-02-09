const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'issue_created',
            'issue_updated',
            'issue_deleted',
            'status_changed',
            'department_assigned',
            'user_assigned',
            'comment_added',
            'upvote_added',
            'upvote_removed',
            'user_login',
            'user_register'
        ]
    },
    entityType: {
        type: String,
        required: true,
        enum: ['issue', 'user', 'comment', 'department']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
