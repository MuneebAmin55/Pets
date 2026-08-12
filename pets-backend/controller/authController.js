import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email });
const signToken = (user) => jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

const createMailTransport = () =>
    nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({ message: "Name, valid email, and a password of at least 6 characters are required" });
        }

      
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

       
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            token: signToken(user),
            user: publicUser(user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

        // Find user
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",
            token: signToken(user),
            user: publicUser(user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ where: { email } });

        // Keep the response the same so this endpoint does not reveal accounts.
        if (!user) {
            return res.status(200).json({
                message: "If an account exists for this email, an OTP has been sent"
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const passwordResetOtp = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        await user.update({
            passwordResetOtp,
            passwordResetOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
            passwordResetToken: null,
            passwordResetTokenExpires: null
        });

        const mailInfo = await createMailTransport().sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: user.email,
            subject: "Your PawPal OTP code",
            text: `Your PawPal OTP code is: ${otp}\n\nIt expires in 10 minutes.`,
            html: `<p>Your PawPal OTP code is:</p><p><strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`
        });

        console.log("Password reset email sent", {
            messageId: mailInfo.messageId,
            accepted: mailInfo.accepted,
            rejected: mailInfo.rejected
        });

        return res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ message: "Unable to send OTP email" });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const passwordResetOtp = crypto
            .createHash("sha256")
            .update(String(otp))
            .digest("hex");

        const user = await User.findOne({
            where: { email, passwordResetOtp }
        });

        if (!user || !user.passwordResetOtpExpires || user.passwordResetOtpExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const passwordResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        await user.update({
            passwordResetOtp: null,
            passwordResetOtpExpires: null,
            passwordResetToken,
            passwordResetTokenExpires: new Date(Date.now() + 10 * 60 * 1000)
        });

        return res.status(200).json({
            message: "OTP verified",
            resetToken
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({ message: "Unable to verify OTP" });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { resetToken, password } = req.body;

        if (!resetToken || !password) {
            return res.status(400).json({
                message: "Reset token and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Hash reset token
        const hashedResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Find user
        const user = await User.findOne({
            where: {
                passwordResetToken: hashedResetToken
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        // Check expiration
        if (
            !user.passwordResetTokenExpires ||
            user.passwordResetTokenExpires < new Date()
        ) {
            return res.status(400).json({
                message: "Reset token has expired"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Update password
        await user.update({
            password: hashedPassword,

            // Invalidate reset token
            passwordResetToken: null,
            passwordResetTokenExpires: null
        });

        return res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Password reset failed"
        });
    }
};
