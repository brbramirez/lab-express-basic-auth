const session = require("express-session");

const MongoStore = require("connect-mongo");

const mongoose = require("mongoose");

module.exports = (app) => {
  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      cookie: {
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 300000, // 5 * 60 * 1000 ms === 5 min
      },
      store: MongoStore.create({
        mongoUrl:process.env.MONGODB_URI || "mongodb://127.0.0.1/auth-practice",

        // ttl => time to live
        // ttl: 60 * 60 * 24 // 60sec * 60min * 24h => 1 day
      }),
    })
  );
};