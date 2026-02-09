const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorHandler');

// Generate tokens
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '15m'
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        phone: phone || '',
        address: address || ''
    });

    if (user) {
        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();

        // Log the registration
        await AuditLog.create({
            action: 'user_register',
            entityType: 'user',
            entityId: user._id,
            user: user._id,
            ipAddress: req.ip
        });

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            accessToken,
            refreshToken
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
        res.status(401);
        throw new Error('Account is deactivated');
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Log the login
    await AuditLog.create({
        action: 'user_login',
        entityType: 'user',
        entityId: user._id,
        user: user._id,
        ipAddress: req.ip
    });

    res.json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        },
        accessToken,
        refreshToken
    });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        res.status(400);
        throw new Error('Refresh token is required');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== token) {
            res.status(401);
            throw new Error('Invalid refresh token');
        }

        // Generate new access token
        const accessToken = generateAccessToken(user._id);

        res.json({
            success: true,
            accessToken
        });
    } catch (error) {
        res.status(401);
        throw new Error('Invalid refresh token');
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    res.json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            address: user.address,
            createdAt: user.createdAt
        }
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, address, avatar },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            address: user.address
        }
    });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password updated successfully'
    });
});

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    updateProfile,
    changePassword
};
