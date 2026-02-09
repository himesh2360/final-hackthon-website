const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Issue title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Issue description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'roads',
            'water',
            'electricity',
            'sanitation',
            'streetlights',
            'drainage',
            'garbage',
            'public_safety',
            'parks',
            'other'
        ]
    },
    images: [{
        url: String,
        publicId: String
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, 'Location coordinates are required']
        },
        address: {
            type: String,
            default: ''
        }
    },
    status: {
        type: String,
        enum: ['reported', 'verified', 'in_progress', 'resolved', 'rejected'],
        default: 'reported'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    upvoteCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    statusHistory: [{
        status: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        comment: String,
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],
    resolvedAt: {
        type: Date
    },
    estimatedResolutionDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Create geospatial index for location-based queries
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1 });
issueSchema.index({ reporter: 1 });

module.exports = mongoose.model('Issue', issueSchema);
