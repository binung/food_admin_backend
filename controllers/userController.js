const User = require('../models/User');
const twilio = require('twilio');
require('dotenv').config();
module.exports = {
    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.user.id)

            const { password, __v,otp,updatedAt, createdAt, ...userData } = user._doc;

            res.status(200).json(userData);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
   
    updateUser: async (req, res) => {
        const { username, email, phone, profile } = req.body;
    
        console.log('Received data:', { username, email, phone, profile });
    
        try {
          const user = await User.findById(req.user.id);
    
          if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
          }
    
          if (username) user.username = username;
          if (email) user.email = email;
          if (phone) user.phone = phone;
          if (profile) user.profile = profile;
    
          await user.save();
          return res.status(200).json({ status: true, message: 'User details updated successfully' });
        } catch (error) {
          res.status(500).json({ status: false, message: error.message });
        }
      },
    
      

    verifyAccount: async (req, res) => {
        const userOtp = req.params.otp;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(400).json({ status: false, message: "User not found" });
            }

            if (userOtp === user.otp) {
                user.verification = true;
                user.otp = "none";

                await user.save();

                const { password, __v, otp, createdAt, ...others } = user._doc;
                return res.status(200).json({ ...others })
            } else {
                return res.status(400).json({ status: false, message: "Otp verification failed" });
            }
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    verifyPhone: async (req, res) => {
        const phone = req.params.phone;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(400).json({ status: false, message: "User not found" });
            }

            user.phoneVerification = true;
            user.phone = phone;

            await user.save();

            const { password, __v, otp, createdAt, ...others } = user._doc;
            return res.status(200).json({ ...others })
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    sendPhoneVerificationOtp: async (req, res) => {
        const { phone } = req.body;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(400).json({ status: false, message: "User not found" });
            }

            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.phone = phone;
            user.otp = verificationCode;
            await user.save();

            await client.messages.create({
                body: `Your verification code is ${verificationCode}`,
                to: phone,
                from: process.env.TWILIO_PHONE_NUMBER
            });

            return res.status(200).json({ status: true, message: 'OTP sent successfully' });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    verifyPhoneOtp: async (req, res) => {
        const { otp } = req.body;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(400).json({ status: false, message: "User not found" });
            }

            if (otp === user.otp) {
                user.phoneVerification = true;
                user.otp = "none";
                await user.save();
                const { password, __v, otp, createdAt, ...others } = user._doc;
                return res.status(200).json({ ...others });
            } else {
                return res.status(400).json({ status: false, message: "OTP verification failed" });
            }
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getUsers: async (req, res) => {
        const { page = 1 } = req.query;
        const ITEMS_PER_PAGE = req.query.limit || 8;
        try {
            const users = await User.find({verification: req.query.status}, { __v: 0, createdAt: 0, updatedAt: 0, password: 0 })
                .sort({ createdAt: -1 })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
            const totalItems = await User.countDocuments({verification: req.query.status});
            res.status(200).json({
                users,
                currentPage: +page,
                totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    updateFcm: async (req, res) => {
        const token = req.params.token;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ status: false, message: 'User not found' });
            }

            user.fcm = token;

            await user.save();
            return res.status(200).json({ status: true, message: 'FCM token updated successfully' });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
     }


}