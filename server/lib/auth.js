import passport from "passport";
import LocalStrategy from "passport-local";

import cloudinary from "cloudinary";
var config = {
  cloud_name: process.env.cloudinary_cloud_name, 
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret
}
cloudinary.config (config);

const users = [{ _id: `1`, username: "romanbr87", password: "123456" }];

const User = {};

User.findOne = (user, callback) => {
  const includes = users.some((user1) => user1.username === user.username);
  if (!includes) {
    const err = new Error("User not found");
    return callback(err, null);
  }

  const foundUser = users.find((user1) => user1.username === user.username);
  return callback(null, foundUser);
};

User.verifyPassword = (password) => {
  return password % 2 === 0;
};

passport.serializeUser((user, cb) => {
  cb(null, user.username);
});

passport.deserializeUser((username, cb) => {
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return cb(err, null);
    }
    const userInformation = {
      username: user.username,
    };
    cb(null, userInformation);
  });
});

passport.use(
  "local",
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      if (!User.verifyPassword(password)) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      return done(null, user, { message: "You are now logged in" });
    });
  })
);
export { passport, User, cloudinary };
