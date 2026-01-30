import User from "../models/user.js";
import Token from "../models/verificationEmailTokenSchema.js";
import Token2 from "../models/passwordResetSchema.js";
import bcrypt from "bcrypt";
import sendVerificationLink from "../utils/sendVerificationLink.js";
import generateVerificationLink from "../utils/generateVerificationLink.js";
import sendPasswordResetLink from "../utils/sendPasswordResetLink.js";
import generatePasswordLink from "../utils/generateResetPasswordLink.js";

/**
 * Registers The User with iitb email address
 * Referral code is required to join the platform
 * A verification link is generated and sent to the users mail address
 *
 */
const registerUser = async (req, res) => {
  const { name, email, password, referralCode } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email }).select('_id isEmailVerified firstname').lean();
    if (existingUser) {
      if (existingUser.isEmailVerified)
        return res.status(409).json({
          message: "User already exists, Login to your account",
          frontendCode: 1,
        });
      else {
        const verificationUrl = await generateVerificationLink(
          existingUser._id,
        );
        console.log(verificationUrl);
        sendVerificationLink(
          verificationUrl,
          existingUser.email,
          existingUser.firstname,
        );
        return res.status(409).json({
          message: "User already exists, Verify your account",
          frontendCode: 2,
        });
      }
    }

 
    const newUser = new User({
      firstname,
      lastname,
      email,
      password,
    });

    // Save the user to the database
    await newUser.save();
    const verificationLink = await generateVerificationLink(newUser._id);
    sendVerificationLink(verificationLink, newUser.email, newUser.name);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

/**
 * User login function.
 * Checks if the email is verified or not, if not status code 403 is sent
 * Status code 401 and frontendCode 1 is sent in json if user not found
 * If account is suspended by admin or disabled by cronjob 401 and 3 gets sent
 * If password doesnt match 401 and 2 gets sent
 * A refresh token is sent using a http cookie and access token is sent in body along with other info
 *
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user by email
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", frontendCode: 1 });
    } else {
      if (!user.isEmailVerified)
        return res.status(403).json({
          message: `Verify You Account Using The Link Sent To ${email}`,
        });
    }

    //checking if account is suspended by admin, or disabled by cron job
    if (user.isSuspended)
      return res
        .status(401)
        .json({ message: "User Account is diabled", frontendCode: 3 });

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", frontendCode: 2 });
    }
   
    //To prevent session fixation attack
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not initialize session" });
      }

    req.session.userId = user._id;
    req.session.role = user.role; 

    // Optional: Force save to ensure session is stored before sending response
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          message : "Some Error Occured"
        })
      };
      
      res.status(200).json({
        message: "Login successful",
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role
        }
      });
    });
  });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

/**
 * Generates a new verification link and sends to the email id
 * Also removes older generated verification links
 */
const getEmailVerificationLink = async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isEmailVerified)
      return res.status(409).json({
        message: "User already verified, Login to your account",
        frontendCode: 1,
      });
    else {
      await Token.deleteMany({ userId: existingUser._id });
      const verificationUrl = await generateVerificationLink(existingUser._id);
      sendVerificationLink(
        verificationUrl,
        existingUser.email,
        existingUser.firstname,
      );
      return res
        .status(409)
        .json({ message: "Verification Email Sent To Mail", frontendCode: 2 });
    }
  } else {
    return res
      .status(404)
      .json({ message: "No Such Account Exists", frontendCode: 3 });
  }
};

/**
 * Generates a new password reset link
 * Also removes older generated password resetlinks
 */
const requestResetPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Token2.deleteMany({ userId: existingUser._id });
      const resetUrl = await generatePasswordLink(existingUser._id);
      sendPasswordResetLink(resetUrl, existingUser.email, existingUser.name);
      return res.status(200).json({
        message: "Password Reset Email Sent To Mail",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No Such Account Exists", frontendCode: 2 });
    }
  } catch {
    return res.status(500).json({ message: "Some error occured" });
  }
};

/*
 * Validates the recieved verification link sent during user registration
 * And removes the verification tokens in the database
 * And then redirects users to frontend
 */
const verifyRecivedLink = async (req, res) => {
  try {
    const id = req.params.id;
    const paramsToken = req.params.token;
    const existingUser = await User.findOne({ _id: id });
    const token = await Token.findOne({ userId: id, token: paramsToken });
    if (token) {
      existingUser.isEmailVerified = true;
      await Token.deleteMany({ userId: id });
      await existingUser.save();
      res.redirect(process.env.FRONTEND_BASE_URL + "/verified");
    } else {
      res.redirect(process.env.FRONTEND_BASE_URL + "/invalidLink");
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

//Verify Recieved Password Link and change password
const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const id = req.params.id;
    const paramsToken = req.params.token;
    const existingUser = await User.findOne({ _id: id });
    const token = await Token2.findOne({ userId: id, token: paramsToken });
    if (token) {
      await Token2.deleteMany({ userId: existingUser._id });
      existingUser.password = password;
      existingUser.passwordVersion = (existingUser.passwordVersion || 0) + 1;
      await existingUser.save();
      return res.status(200).json({ message: "Success" });
    } else {
      return res.status(401).json({ message: "Token invalid" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


/**
 * Utility to change user details
 * Todo Change email
 */
const changeUserDetails = async (req, res) => {
  try {
    const existingUser = await User.findOne({ _id: req.session.userID });
    if (req.body.name) existingUser.name = req.body.name;
    if (req.body.phone) existingUser.phone = req.body.phone;

    await existingUser.save();
    res.status(200).json({ message: "Info was successfully updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


const logoutUser = async (req, res) => {
  // 1. Check if a session exists
  if (!req.session) {
    return res.status(200).json({ message: "Already logged out" });
  }

  // 2. Destroy the session in the Store (MongoDB)
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out, please try again." });
    }

    // 3. Clear the cookie from the browser
    // The name must match the 'name' in your session config (default is 'connect.sid')
    res.clearCookie('connect.sid', {
      path: '/', 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    });

    return res.status(200).json({ message: "Logout successful" });
  });
};

export {
  loginUser,
  registerUser,
  logout,
  getEmailVerificationLink,
  verifyRecivedLink,
  changeUserDetails,
  requestResetPasswordLink,
  changePassword,
  logoutUser
};
