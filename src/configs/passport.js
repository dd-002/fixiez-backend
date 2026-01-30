import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

const configurePassport = () => {
  // 1. Define Strategy
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

  // 2. Serialize: Save User ID to Session
  passport.serializeUser((user, done) => {
    done(null, { id: user._id, version: user.passwordVersion});
  });

  // 3. Deserialize: Fetch User from DB using ID in Session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      if (!user || user.passwordVersion !== data.version) {
      return done(null, false); // This effectively logs the user out
    }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export default configurePassport;