import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/users.js';
import bcrypt from 'bcrypt';


const configurePassport = () => {
  /**
   * Defines the strategy, the instance of LocalStrategy uses two fields the first is the strategy options
   * which is required when we are not using the usual username and password
   */
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'User not found', frontendCode: 1 });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Wrong password', frontendCode: 2 });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // saves the user after verification to session
  passport.serializeUser((user, done) => {
    done(null, { id: user._id, passwordVersion: user.passwordVersion});
  });

  // 3. Deserialize: Fetch User from DB using ID in Session
  passport.deserializeUser(async (user, done) => {
    try {
      const userFromDb = await User.findById(user._id).select('-password');
      if (!userFromDb || userFromDb.passwordVersion !== user.passwordVersion) {
      return done(null, false); // This effectively logs the user out
    }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export default configurePassport;