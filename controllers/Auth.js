import { sendVerificationEamil, senWelcomeEmail } from "../middlewares/Email.js";
import { generateTokenAndSetCookies } from "../middlewares/GenerateToken.js";
import { Usermodel } from "../models/User.js";
import bcryptjs from 'bcryptjs';

// REGISTER USER
const Register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await Usermodel.findOne({ email });

        // if (existingUser) {
        //     return res.status(400).json({ success: false, message: "User already exists. Please login." });
        // }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new Usermodel({
            email,
            password: hashedPassword,
            name,
            verficationToken: verificationToken,
            verficationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        await user.save();

        generateTokenAndSetCookies(res, user._id);
        await sendVerificationEamil(user.email, verificationToken);

        return res.status(200).json({ success: true, message: "User registered successfully", user });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// VERIFY EMAIL
const VerifyEmail = async (req, res) => {
    try {
        const { code } = req.body;

        const user = await Usermodel.findOne({
            verficationToken: code,
            verficationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.verficationToken = undefined;
        user.verficationTokenExpiresAt = undefined;

        await user.save();
        await senWelcomeEmail(user.email, user.name);

        return res.status(200).json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        console.error("Verify email error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// RESEND OTP
const ResendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await Usermodel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // if (user.isVerified) {
        //     return res.status(400).json({ success: false, message: "Email is already verified" });
        // }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

        user.verficationToken = newOtp;
        user.verficationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();
        await sendVerificationEamil(user.email, newOtp);

        return res.status(200).json({ success: true, message: "OTP resent successfully" });

    } catch (error) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { Register, VerifyEmail, ResendOtp };
