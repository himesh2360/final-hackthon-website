import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowUp, FiMessageSquare, FiMapPin, FiClock, FiUser, FiArrowLeft, FiSend } from 'react-icons/fi';
import IssueMap from '../components/issues/IssueMap';
import { issuesAPI, commentsAPI, upvotesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const IssueDetail = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [commenting, setCommenting] = useState(false);

    useEffect(() => {
        loadIssue();
        loadComments();
    }, [id]);

    const loadIssue = async () => {
        try {
            const response = await issuesAPI.getById(id);
            setIssue(response.data.issue);
        } catch (error) {
            console.error('Error loading issue:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            const response = await commentsAPI.getByIssue(id);
            setComments(response.data.comments);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const handleUpvote = async () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        try {
            const response = await upvotesAPI.toggle(id);
            setIssue(prev => ({
                ...prev,
                upvoteCount: response.data.upvoteCount,
                hasUpvoted: response.data.upvoted
            }));
        } catch (error) {
            console.error('Error toggling upvote:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || commenting) return;

        setCommenting(true);
        try {
            const response = await commentsAPI.create(id, newComment);
            setComments(prev => [response.data.comment, ...prev]);
            setNewComment('');
            setIssue(prev => ({
                ...prev,
                commentCount: (prev.commentCount || 0) + 1
            }));
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setCommenting(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCategory = (cat) => {
        return cat?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="skeleton" style={{ height: '400px', marginBottom: '24px' }}></div>
                    <div className="skeleton" style={{ height: '200px' }}></div>
                </div>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <h2>Issue not found</h2>
                        <Link to="/issues" className="btn btn-primary">Back to Issues</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <Link to="/issues" className="btn btn-ghost" style={{ marginBottom: '20px' }}>
                    <FiArrowLeft /> Back to Issues
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                    {/* Main Content */}
                    <div>
                        {/* Issue Header */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            {issue.images && issue.images.length > 0 && (
                                <img
                                    src={issue.images[0].url}
                                    alt={issue.title}
                                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                                />
                            )}

                            <div className="card-body">
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                                    <h1 style={{ fontSize: '1.75rem', flex: 1 }}>{issue.title}</h1>
                                    <span className={`badge badge-${issue.status}`}>
                                        {issue.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                                    <span className="category-badge">{formatCategory(issue.category)}</span>

                                    <span className="issue-meta-item">
                                        <FiUser />
                                        {issue.reporter?.name || 'Anonymous'}
                                    </span>

                                    <span className="issue-meta-item">
                                        <FiClock />
                                        {formatDate(issue.createdAt)}
                                    </span>

                                    {issue.location?.address && (
                                        <span className="issue-meta-item">
                                            <FiMapPin />
                                            {issue.location.address}
                                        </span>
                                    )}
                                </div>

                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
                                    {issue.description}
                                </p>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        className={`upvote-btn ${issue.hasUpvoted ? 'active' : ''}`}
                                        onClick={handleUpvote}
                                    >
                                        <FiArrowUp />
                                        {issue.upvoteCount || 0} Upvotes
                                    </button>

                                    <span className="upvote-btn">
                                        <FiMessageSquare />
                                        {issue.commentCount || 0} Comments
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        {issue.statusHistory && issue.statusHistory.length > 0 && (
                            <div className="card" style={{ marginBottom: '24px' }}>
                                <div className="card-body">
                                    <h3 style={{ marginBottom: '20px' }}>Status Timeline</h3>
                                    <div className="timeline">
                                        {issue.statusHistory.map((history, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-dot" style={{
                                                    background: history.status === 'resolved'
                                                        ? 'var(--status-resolved)'
                                                        : 'var(--primary)'
                                                }}></div>
                                                <div className="timeline-content">
                                                    <div className="timeline-title">
                                                        Status changed to: {history.status.replace('_', ' ')}
                                                    </div>
                                                    {history.comment && (
                                                        <p style={{ color: 'var(--text-secondary)', margin: '8px 0' }}>
                                                            {history.comment}
                                                        </p>
                                                    )}
                                                    <div className="timeline-date">
                                                        {formatDate(history.changedAt)}
                                                        {history.changedBy?.name && ` by ${history.changedBy.name}`}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="card">
                            <div className="card-body">
                                <h3 style={{ marginBottom: '20px' }}>Comments</h3>

                                {isAuthenticated ? (
                                    <form onSubmit={handleComment} style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Add a comment..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={!newComment.trim() || commenting}
                                            >
                                                <FiSend />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="alert alert-info" style={{ marginBottom: '24px' }}>
                                        <Link to="/login">Sign in</Link> to leave a comment
                                    </div>
                                )}

                                {comments.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                                        No comments yet. Be the first to comment!
                                    </p>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment._id} className="comment">
                                            <div className="comment-avatar">
                                                {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="comment-body">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.user?.name || 'User'}</span>
                                                    {comment.isOfficial && (
                                                        <span className="comment-badge">Official Response</span>
                                                    )}
                                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <p className="comment-text">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Location Map */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-body">
                                <h3 style={{ marginBottom: '16px' }}>Location</h3>
                                {issue.location?.coordinates && (
                                    <IssueMap
                                        issues={[issue]}
                                        center={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                                        zoom={15}
                                        height="250px"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Issue Info */}
                        <div className="card">
                            <div className="card-body">
                                <h3 style={{ marginBottom: '16px' }}>Issue Info</h3>

                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Priority</span>
                                    <p style={{ fontWeight: '500', textTransform: 'capitalize' }}>{issue.priority}</p>
                                </div>

                                {issue.assignedDepartment && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Assigned Department</span>
                                        <p style={{ fontWeight: '500' }}>{issue.assignedDepartment.name}</p>
                                    </div>
                                )}

                                {issue.estimatedResolutionDate && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Expected Resolution</span>
                                        <p style={{ fontWeight: '500' }}>{formatDate(issue.estimatedResolutionDate)}</p>
                                    </div>
                                )}

                                {issue.resolvedAt && (
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Resolved On</span>
                                        <p style={{ fontWeight: '500', color: 'var(--status-resolved)' }}>
                                            {formatDate(issue.resolvedAt)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
