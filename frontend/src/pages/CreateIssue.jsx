import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiMapPin, FiCheck, FiCamera, FiFileText, FiAlertCircle } from 'react-icons/fi';
// Lazy load the map component to prevent main thread blocking
const IssueMap = lazy(() => import('../components/issues/IssueMap'));
import { issuesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    { value: 'roads', label: '🛣️ Roads & Potholes' },
    { value: 'water', label: '💧 Water Supply' },
    { value: 'electricity', label: '⚡ Electricity' },
    { value: 'sanitation', label: '🧹 Sanitation' },
    { value: 'streetlights', label: '💡 Street Lights' },
    { value: 'drainage', label: '🌊 Drainage' },
    { value: 'garbage', label: '🗑️ Garbage Collection' },
    { value: 'public_safety', label: '🚨 Public Safety' },
    { value: 'parks', label: '🌳 Parks & Recreation' },
    { value: 'pollution', label: '💨 Pollution' },
    { value: 'other', label: '📋 Other' }
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: '#22C55E' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
    { value: 'critical', label: 'Critical', color: '#DC2626' }
];

const CreateIssue = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('medium');
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gettingLocation, setGettingLocation] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const getCurrentLocation = () => {
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coords = [position.coords.latitude, position.coords.longitude];
                setLocation(coords);

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
                    );
                    const data = await response.json();
                    if (data.display_name) {
                        setAddress(data.display_name);
                    }
                } catch {
                    // Ignore geocoding errors
                }

                setGettingLocation(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                setError('Unable to get your location. Please select on the map.');
                setGettingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleMapClick = async (coords) => {
        setLocation(coords);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
            );
            const data = await response.json();
            if (data.display_name) {
                setAddress(data.display_name);
            }
        } catch {
            // Ignore
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        const newFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...files]);
        setPreviewUrls(prev => [...prev, ...newFiles.map(f => f.preview)]);
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!location) {
            setError('Please select a location on the map or use current location');
            return;
        }

        if (images.length === 0) {
            setError('Please add at least one photo of the issue');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('priority', priority);
            formData.append('location[lat]', location[0]);
            formData.append('location[lng]', location[1]);
            formData.append('location[address]', address);

            images.forEach(image => {
                formData.append('images', image);
            });

            const response = await issuesAPI.create(formData);
            navigate(`/issues/${response.data.issue._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create issue. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ paddingBottom: '40px' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }} className="animate-fade-in-up">
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 8px 30px rgba(239, 68, 68, 0.4)'
                    }}>
                        <FiCamera style={{ fontSize: '2rem', color: 'white' }} />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Report an Issue</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Help improve your community by reporting civic problems
                    </p>
                </div>

                {/* Progress Steps */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '40px'
                }} className="animate-fade-in-up stagger-1">
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '100px',
                            height: '4px',
                            borderRadius: '2px',
                            background: step >= s ? 'var(--primary)' : 'var(--bg-elevated)',
                            transition: 'background 0.3s ease'
                        }} />
                    ))}
                </div>

                {error && (
                    <div className="alert alert-error animate-fade-in-up">
                        <FiAlertCircle />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Photos */}
                    {step === 1 && (
                        <div className="card animate-fade-in-up">
                            <div className="card-body">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FiCamera style={{ color: '#EF4444', fontSize: '1.25rem' }} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Add Photos</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            Take clear photos showing the issue
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="image-upload"
                                    onClick={() => document.getElementById('image-input').click()}
                                >
                                    <FiUpload className="image-upload-icon" />
                                    <p className="image-upload-text">Click to upload images or drag and drop</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Maximum 5 images, 5MB each • JPG, PNG
                                    </p>
                                </div>

                                <input
                                    id="image-input"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />

                                {previewUrls.length > 0 && (
                                    <div className="image-preview">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="image-preview-item">
                                                <img src={url} alt={`Preview ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="image-preview-remove"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setStep(2)}
                                        disabled={images.length === 0}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="card animate-fade-in-up">
                            <div className="card-body">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: 'rgba(37, 99, 235, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FiFileText style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Issue Details</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            Describe the problem in detail
                                        </p>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Issue Title *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Large pothole on Main Street"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        maxLength={100}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setCategory(cat.value)}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: 'var(--radius-lg)',
                                                    border: category === cat.value
                                                        ? '2px solid var(--primary)'
                                                        : '1px solid var(--border-color)',
                                                    background: category === cat.value
                                                        ? 'rgba(37, 99, 235, 0.15)'
                                                        : 'var(--bg-elevated)',
                                                    color: category === cat.value
                                                        ? 'var(--primary-light)'
                                                        : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Detailed Description *</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Describe the issue in detail. Include information like:&#10;• How long has this been a problem?&#10;• How does it affect the community?&#10;• Any safety concerns?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Priority Level</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {PRIORITIES.map(p => (
                                            <button
                                                key={p.value}
                                                type="button"
                                                onClick={() => setPriority(p.value)}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: 'var(--radius-full)',
                                                    border: priority === p.value
                                                        ? `2px solid ${p.color}`
                                                        : '1px solid var(--border-color)',
                                                    background: priority === p.value
                                                        ? `${p.color}20`
                                                        : 'var(--bg-elevated)',
                                                    color: priority === p.value
                                                        ? p.color
                                                        : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => setStep(1)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setStep(3)}
                                        disabled={!title || !category || !description}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <div className="card animate-fade-in-up">
                            <div className="card-body">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: 'rgba(34, 197, 94, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FiMapPin style={{ color: '#22C55E', fontSize: '1.25rem' }} />
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Location</h2>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                Where is this issue located?
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={getCurrentLocation}
                                        disabled={gettingLocation}
                                    >
                                        <FiMapPin />
                                        {gettingLocation ? 'Getting...' : 'Use Current Location'}
                                    </button>
                                </div>

                                {location && (
                                    <div className="alert alert-success" style={{ marginBottom: '16px' }}>
                                        <FiCheck />
                                        <div>
                                            <strong>Location selected</strong>
                                            {address && <p style={{ margin: 0, fontSize: '0.9rem' }}>{address}</p>}
                                        </div>
                                    </div>
                                )}

                                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                                    Click on the map to select the exact location of the issue
                                </p>

                                <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', minHeight: '350px', background: '#1a1a2e', position: 'relative' }}>
                                    <Suspense fallback={
                                        <div style={{
                                            height: '350px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-muted)'
                                        }}>
                                            Loading Map...
                                        </div>
                                    }>
                                        <IssueMap
                                            height="350px"
                                            selectable={true}
                                            selectedPosition={location}
                                            onPositionSelect={handleMapClick}
                                        />
                                    </Suspense>
                                </div>

                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => setStep(2)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={loading || !location}
                                        style={{ minWidth: '180px' }}
                                    >
                                        {loading ? 'Submitting...' : '🚀 Submit Report'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateIssue;
