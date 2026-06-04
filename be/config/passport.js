// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";

/**
 * Minimal serialize/deserialize — required by Passport even when using
 * session:false in the route handler (some versions still call these).
 */
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("Google account tidak memiliki email"), null);
        }

        const googleId = profile.id;
        const name = profile.displayName || email.split("@")[0];

        // 1. Cari berdasarkan googleId (user sudah pernah login Google)
        let user = await prisma.user.findFirst({ where: { googleId } });

        if (!user) {
          // 2. Cari berdasarkan email (user sudah punya akun email/password)
          user = await prisma.user.findUnique({ where: { email } });

          if (user) {
            // Tautkan Google ID ke akun yang sudah ada
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId },
            });
            console.log(`🔗 Google linked to existing account: ${email}`);
          } else {
            // 3. Buat akun baru untuk user Google
            // Password acak — user tidak pernah menggunakannya karena login via Google
            const randomPassword = crypto.randomBytes(32).toString("hex");

            user = await prisma.user.create({
              data: {
                email,
                name,
                googleId,
                password: randomPassword,
              },
            });
            console.log(`✅ New user created via Google OAuth: ${email}`);
          }
        }

        return done(null, user);
      } catch (err) {
        console.error("❌ Google OAuth strategy error:", err);
        return done(err, null);
      }
    }
  )
);

export default passport;
