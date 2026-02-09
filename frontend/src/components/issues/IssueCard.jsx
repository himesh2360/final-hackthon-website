import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiMessageSquare, FiChevronRight, FiThumbsUp, FiShare2 } from 'react-icons/fi';

const STATUS_STYLES = {
    reported: { bg: '#EF4444', text: 'Reported' },
    verified: { bg: '#3B82F6', text: 'Verified' },
    in_progress: { bg: '#F59E0B', text: 'In Progress' },
    resolved: { bg: '#10B981', text: 'Resolved' },
    rejected: { bg: '#6B7280', text: 'Rejected' }
};

const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const IssueCard = memo(({ issue, onUpvote }) => {
    const statusBadge = STATUS_STYLES[issue.status] || STATUS_STYLES.reported;
    const userName = issue.user?.name || 'Anonymous';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="refined-issue-card">
            {/* Header with User Info */}
            <div className="card-header-refined">
                {/* Avatar */}
                <div className="avatar-refined">
                    {userInitial}
                </div>

                {/* User Info */}
                <div className="user-info-refined">
                    <div className="user-name-row">
                        <span className="user-name-refined">
                            {userName}
                        </span>
                        {/* Status Badge */}
                        <span
                            className="status-badge-refined"
                            style={{ background: statusBadge.bg, boxShadow: `0 4px 12px ${statusBadge.bg}44` }}
                        >
                            <span className="status-dot"></span>
                            {statusBadge.text}
                        </span>
                    </div>
                    <div className="card-meta-refined">
                        <span>{formatDate(issue.createdAt)}</span>
                        {issue.location?.address && (
                            <>
                                <span style={{ opacity: 0.5 }}>•</span>
                                <FiMapPin size={12} />
                                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {issue.location.address.split(',')[0]}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Section */}
            {issue.images && issue.images.length > 0 && (
                <div className="image-container-refined">
                    <img
                        src={issue.images[0].url}
                        alt={issue.title}
                        className="image-refined"
                        loading="lazy"
                    />
                    {/* Details Button */}
                    <Link
                        to={`/issues/${issue._id}`}
                        className="details-btn-refined"
                    >
                        Details <FiChevronRight size={12} />
                    </Link>
                    {/* Image Counter */}
                    {issue.images.length > 1 && (
                        <div className="image-counter-refined">
                            1/{issue.images.length}
                        </div>
                    )}
                </div>
            )}

            {/* Footer / Body */}
            <div className="card-footer-refined">
                {/* Title & Category */}
                <div className="title-category-row">
                    <h3 className="title-refined">
                        {issue.title}
                    </h3>
                    <span className="category-tag-refined">
                        {issue.category?.replace('_', ' ') || 'Other'}
                    </span>
                </div>

                {/* Actions */}
                <div className="actions-row-refined">
                    {/* Upvote */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpvote && onUpvote(issue._id);
                        }}
                        className={`action-btn-refined ${issue.hasUpvoted ? 'active' : ''}`}
                    >
                        <FiThumbsUp size={16} />
                        <span>{issue.upvoteCount || 0}</span>
                    </button>

                    {/* Comments */}
                    <div className="action-btn-refined">
                        <FiMessageSquare size={16} />
                        <span>{issue.commentCount || 0}</span>
                    </div>

                    {/* Share */}
                    <button
                        className="action-btn-refined share-btn-refined"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FiShare2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
});

export default IssueCard;
