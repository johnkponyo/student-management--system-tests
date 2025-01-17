const logger = require('../logger')
const User = require('../models/instructorModel');
const Student = require('../models/studentModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendPasswordResetEmail = require('../services/emailService')



exports.register = async (req, res) => {
    const { 
        firstName,
        lastName,
        email,
        phoneNumber,
        department,
        officeLocation,
        password
    } = req.body;

    try {
        const emailExists = await User.findOne({ email });

        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            department,
            officeLocation,
            password: hashedPassword 
        });

        await newUser.save();

        res.status(201).json({ message: 'Registration successful!' });

    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Error! Unable to register', error: error.message });
    }
};



exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({email});
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, role: 'instructor' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Login successful', token });

    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }

};



exports.passwordResetRequest = async (req, res) => {
    const { email, role } = req.body;

    try {

        let user = null;

        if(role === 'instructor'){
            user = await User.findOne({email});
        } else if(role === 'student'){
            user = await Student.findOne({email});
        }

        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }

        const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await sendPasswordResetEmail(email, token, req);

        res.status(200).json({ message: 'Password reset email sent!', token: token });

    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Error sending password reset email', error: error.message });
    }
};



exports.passwordReset = async (req, res) => {

    const { token, newPassword } = req.body;

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user = null;
        
        if(decoded.role === 'instructor'){
            user = await User.findById({_id: decoded.id});
        } else if(decoded.role === 'student'){
            user = await Student.findById({_id: decoded.id});
        }
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: 'Password successfully updated.' });
        
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};



exports.logout = async (req, res) => {
    try {
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
};