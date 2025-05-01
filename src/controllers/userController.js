import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import {nameRegex} from "../helper/RegexPatternHelper.js"
import {generateRefreshToken,generateAccessToken} from "../helper/TokenHelper.js"
import mailer from "../services/EmailService.js"

// To Create a new user
 const signup = async (req, res) => {
  const { name, email, password } = req.body;
 // Validate all fields are present
 if (!name || !email || !password) {
  return res.status(400).json({ message: "All fields are required", isPassed: false });
}

// Name must be a string with only letters (no numbers/symbols)

if (typeof name !== 'string' || !nameRegex.test(name)) {
  return res.status(400).json({
    message: "Name should contain only letters and spaces",
    isPassed: false
  });
}
const exisitingUser = await User.findOne({ email });
if (exisitingUser) {
  return res.status(409).json({ message: "Existing Email ID", isPassed: false });
}
  const hashed = await bcrypt.hash(password, 10);
  
  const user = new User({ name, email, password: hashed });
  await user.save();
  res.status(201).json({ message: 'User created',isPassed:true });
};

// Sign In API Route
 const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid Credential',isPassed:false ,description:"Email address not found.",fieldError:"email"});
    }
     // Check if password matches
     const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) {
       return res.status(401).json({ message: 'Invalid Credential',isPassed:false,description:"Incorrect password. Please try again.",fieldError:"password" });
     }

     const accessToken = generateAccessToken(user._id);
     const refreshToken = generateRefreshToken(user._id);
  
      // Send accessToken in a non-HTTP-only cookie for the frontend to use
      res.cookie('accessToken', accessToken, {
        httpOnly: false, // Not HTTP-only so it can be accessed by frontend JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax', // Helps prevent CSRF attacks
        maxAge: 60 * 60 * 1000 // 1 hour expiry for access token
      });

     res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }).json({ message: "Signed in successfully", isPassed: true,userId:user._id,userName:user.name,email:user.email});




  } catch (error) {
    return res.status(500).json({ 
      message: "System Error", 
      isPassed: false 
    });
  }
  
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    //  Step 1: Validate email is present
    if (!email) {
      return res.status(400).json({ 
        message: "Email is required", 
        isPassed: false, 
        description: "Please enter your email address.", 
        fieldError: "email" 
      });
    }

    //  Step 2: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Invalid Email Format", 
        isPassed: false, 
        description: "Please enter a valid email address.", 
        fieldError: "email" 
      });
    }

    //  Step 3: Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: "Invalid Credential", 
        isPassed: false, 
        description: "Email address not found ", 
        fieldError: "email" 
      });
    }

      //  Step 4: Generate Reset Token (valid for 15 minutes)
      const resetToken = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' } 
      );

      await mailer.sendResetMail(resetToken, email);


    //  Step 5: If exists, respond success (later: send email with token)
    return res.status(200).json({ 
      message: "Password reset link ", 
      description:`Succesfully sent reset password to your mail ${user.email}`,
      isPassed: true,
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "System Error", 
      isPassed: false 
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // 1. Validate presence
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: "All fields are required", 
        isPassed: false 
      });
    }

    // 2. Validate password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: "Passwords do not match", 
        isPassed: false,
        description: "New password and confirm password should be the same.", 
        fieldError: "confirmPassword" 
      });
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ 
        message: "Invalid or expired token", 
        isPassed: false 
      });
    }

    // 4. Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        isPassed: false 
      });
    }

    // 5. Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // 6. Update user password
    user.password = hashed;
    await user.save();

    return res.status(200).json({ 
      message: "Password reset successfully", 
      isPassed: true 
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "System Error", 
      isPassed: false 
    });
  }
};

// Auto Sign-In (Verify Token from Cookie)
const autoSignIn = async (req, res) => {
  try {
    // 1. Get token from cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token found", isPassed: false });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token", isPassed: false });
    }

    // 3. Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", isPassed: false });
    }

    // 4. Send user info
    return res.status(200).json({
      message: "User authenticated",
      isPassed: true,
      userId: user._id,
      userName: user.name,
      email: user.email
    });

  } catch (error) {
    return res.status(500).json({ message: "System Error", isPassed: false });
  }
};



export default{
  signup,
  signin,
  forgotPassword,
  resetPassword,
  autoSignIn
}
