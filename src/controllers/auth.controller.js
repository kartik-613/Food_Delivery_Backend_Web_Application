const { User } = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../utils/mail");
const { genToken } = require("../utils/token");

const signUp = async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (!phone.match(/^[0-9]{10}$/)) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    const savedUser = await newUser.save();

    const token = await genToken(savedUser._id);
    savedUser.password = undefined;

    res.cookie("token", token, {
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(201)
      .json({
        message: "User registered successfully",
        user: savedUser,
        token,
      });
  } catch (error) {
    console.error("Error in signUp:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = await genToken(user._id);
    user.password = undefined;
    res.cookie("token", token, {
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "User logged in successfully", user, token });
  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const signOut = (req, res) => {
  res.clearCookie("token", {
    secure: true,
    sameSite: "strict",
    httpOnly: true,
  });
  return res.status(200).json({ message: "User logged out successfully" });
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    } 
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    await sendMail(email, otp);
    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return res.status(500).json({ message: "Internal server error" });
  } 
}

const vrifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    } 
    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    user.isOtpVerified = true;
    await user.save();
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ message: "Internal server error" });
  } 
}

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    if (!user.isOtpVerified) {
      return res.status(400).json({ message: "OTP not verified" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.otpExpiry = undefined;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const googleAuth = async (req, res) => {
  try {
    const { email, fullName, phone, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    // If user does NOT exist → Create one
    if (!user) {
      user = new User({
        fullName,
        email,
        phone,
        role: role || "user",
        password: null,
        isGoogleUser: true,
      });

      await user.save();
    }

    // Generate token for both NEW and EXISTING users
    const token = await genToken(user._id);

    user.password = undefined;

    // Send cookie
    res.cookie("token", token, {
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // SEND SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "Google Auth successful",
      user,
    });

  } catch (error) {
    console.error("Error in googleAuth:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signUp, signIn, signOut, sendOtp, vrifyOtp, resetPassword, googleAuth   };