import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        let user = await User.findOne({ email });

        if (!user) {
          // Create new Google user
          user = await User.create({
            email,
            name,
            provider: "google",
            profilePicture: picture,
          });
        } else {
          // If user exists but has no profile picture, update it
          if (!user.profilePicture && picture) {
            user.profilePicture = picture;
            await user.save();
          }

          // If user registered locally, upgrade provider to google (optional)
          if (user.provider === "local") {
            user.provider = "google";
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;
