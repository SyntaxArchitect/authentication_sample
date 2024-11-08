const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('../utils/otpGenerator');
const tempUsers = {}; // Temporary storage for users waiting for OTP verification
require('dotenv').config();

// Helper function to create access and refresh tokens
const generateAccessToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES });
const generateRefreshToken = (userId) => jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });

// Signup
exports.signup = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user is already in the database
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = otpGenerator();
        console.log(`Generated OTP for ${email}: ${otp}`);

        // Store user data temporarily until OTP is verified
        tempUsers[email] = { email, password: hashedPassword, otp, otpExpires: Date.now() + 10 * 60 * 1000 };

        res.status(200).json({ message: 'OTP sent successfully. Check console for OTP.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Check if user data is in temporary storage
        const tempUser = tempUsers[email];
        if (!tempUser) {
            return res.status(400).json({ message: 'User not found or OTP expired' });
        }

        // Verify OTP and expiration
        if (tempUser.otp === otp && tempUser.otpExpires > Date.now()) {
            // Create new user in the database
            const newUser = new User({
                email: tempUser.email,
                password: tempUser.password
            });
            await newUser.save();

            // Clear temporary user data
            delete tempUsers[email];

            res.status(200).json({ message: 'OTP verified successfully and user registered' });
        } else {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user's signup data is in temporary storage
        const tempUser = tempUsers[email];
        if (!tempUser) {
            return res.status(400).json({ message: 'User not found or OTP expired' });
        }

        // Generate new OTP and update temporary storage
        const otp = otpGenerator();
        tempUser.otp = otp;
        tempUser.otpExpires = Date.now() + 10 * 60 * 1000;

        console.log(`Resent OTP for ${email}: ${otp}`);
        res.status(200).json({ message: 'OTP resent successfully. Check console for OTP.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


// Login
// exports.login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'User not found' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         const payload = { userId: user._id };
//         const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

//         res.status(200).json({ message: 'Login successful', token });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate access and refresh tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(403).json({ message: 'Refresh token required' });

    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid refresh token' });

        // Generate a new access token
        const newAccessToken = generateAccessToken(decoded.userId);
        res.status(200).json({
            accessToken: newAccessToken
        });
    });
};
