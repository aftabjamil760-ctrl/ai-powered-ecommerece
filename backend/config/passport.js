const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        return done(null, user);
      }

      // If not, create new user
      // Generate a random password since they used Google
      const randomPassword = crypto.randomBytes(16).toString('hex');
      
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: randomPassword,
        isVerified: true, // Google accounts are already verified
        verificationToken: undefined
      });

      await user.save();
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

module.exports = passport;
