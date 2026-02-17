import passport from "passport";

import User from "../models/users.js";
import VerificationEmailToken from "../models/verificationEmailTokenSchema.js";
import ResetPasswordToken from "../models/passwordResetSchema.js";
import sendVerificationLink from "../utils/sendVerificationLink.js";
import generateVerificationLink from "../utils/generateVerificationLink.js";
import sendPasswordResetLink from "../utils/sendPasswordResetLink.js";
import generateResetPasswordLink from "../utils/generateResetPasswordLink.js";

/**
 * Registers The User with iitb email address
 * Referral code is required to join the platform
 * A verification link is generated and sent to the users mail address
 *
 */
const registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

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
    try {
      await newUser.save();
    }
    catch (err) {
      console.log(err)
      return res.status(500).json({ message: "DD" })
    }

    const verificationLink = await generateVerificationLink(newUser._id);
    sendVerificationLink(verificationLink, newUser.email, newUser.firstname);
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Some error occured in registration",
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
/**
 * User login function utilizing Passport.js
 */
const loginUser = (req, res, next) => {

  // 1. Passport Custom Callback
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    // 2. Check if user was found and password matched (Handled by Strategy)
    if (!user) {
      return res.status(401).json({
        message: info.message || "Invalid credentials",
        frontendCode: info.frontendCode || 1
      });
    }

    // 3. Custom Business Logic (Verification & Suspension)
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: `Verify Your Account Using The Link Sent To ${user.email}`,
      });
    }

    if (user.isSuspended) {
      return res.status(401).json({
        message: "User Account is disabled",
        frontendCode: 3
      });
    }

    // 4. Establish Session via Passport
    // req.logIn triggers serializeUser
    req.logIn(user, (err) => {
      if (err) return next(err);

      // Prevent Session Fixation: Regenerate session after login
      const tempUser = req.user;
      req.session.regenerate((err) => {
        if (err) return next(err);

        // Re-bind user to the new session
        req.session.passport = { user: tempUser._id };

        return res.status(200).json({
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
  })(req, res, next);
};

/**
 * Generates a new verification link and sends to the email id
 * Also removes older generated verification links
 */
const getEmailVerificationLink = async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email }).select('isEmailVerified');
  if (existingUser) {
    if (existingUser.isEmailVerified)
      return res.status(409).json({
        message: "User already verified, Login to your account",
        frontendCode: 1,
      });
    else {
      await VerificationEmailToken.deleteMany({ userId: existingUser._id });
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
      await ResetPasswordToken.deleteMany({ userId: existingUser._id });
      const resetUrl = await generateResetPasswordLink(existingUser._id);
      const err = await sendPasswordResetLink(resetUrl, existingUser.email, existingUser.firstname)
      if(err == 0)
        return res.status(500).json({message : "Some error occured"})
      return res.status(200).json({
        message: "Password Reset Email Sent To Mail",
      });
    } else {
      return res
        .status(404)
        .json({ message: "No Such Account Exists", frontendCode: 2 });
    }
  } catch(err) {
    console.log(err)
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
    const paramsToken = req.params.token;
    const token = await VerificationEmailToken.findOne({ token: paramsToken });
    if (token) {
      const existingUser = await User.findByIdAndUpdate(token.userId,{isEmailVerified:true})
      const err = await VerificationEmailToken.deleteMany({ userId: token.userId });
       if(err == 0)
        return res.status(500).json({message : "Some error occured"})
      return res.status(200).json({
        message : "Account Verified. Proceed to login"
      });
    } else {
      return res.status(404).json({
        message : "No Such Token Exists"
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

//Verify Recieved Password Link and change password
//TODO : Logout users from all devices
const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const paramsToken = req.params.token;

    const token = await ResetPasswordToken.findOne({  token: paramsToken });
    if (token) {
          const existingUser = await User.findOne({ _id: token.userId });
      await ResetPasswordToken.deleteMany({ userId: existingUser._id });
      existingUser.password = password;
      // existingUser.passwordVersion = (existingUser.passwordVersion || 0) + 1;
      await existingUser.save();

      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax'
      });

      return res.status(200).json({ message: "Password Reset Successful" });
    } else {
      return res.status(401).json({ message: "Password Reset Token invalid" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};




/**
 * Utility to change user details
 * Todo Change email
 */
// const changeUserDetails = async (req, res) => {
//   try {
//     const existingUser = await User.findOne({ _id: req.session.userID });
//     if (req.body.name) existingUser.name = req.body.name;
//     if (req.body.phone) existingUser.phone = req.body.phone;

//     await existingUser.save();
//     res.status(200).json({ message: "Info was successfully updated" });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };


/**
 * Handles Passport cleanup, Session destruction, and Cookie clearance
 */
const logoutUser = async (req, res, next) => {
  try {
    // 1. Promisify req.logout (Passport)
    await new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    if (req.session) {
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax'
    });

    return res.status(200).json({ message: "Logout successful" });

  } catch (err) {
    // Passes any errors to your global error handler
    next(err);
  }
};

export {
  loginUser,
  registerUser,
  getEmailVerificationLink,
  verifyRecivedLink,
  // changeUserDetails,
  requestResetPasswordLink,
  changePassword,
  logoutUser
};
