import express from "express";
import { passport } from "../lib/auth.js";
import {
  fetchDataFromDB,
  getCnt,
  getCol,
  getRandomBusiness,
  ensureAuthenticatedLogin,
  ensureAuthenticatedLogout,
  ensureAuthenticatedPage,
  ensureAuthenticatedReq,
} from "../controllers/controller.js";

const router = express.Router();

router.post("/login", ensureAuthenticatedLogin, function (req, res, next) {
  console.log("/Login");

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      res.status(404).send({ success: false, message: "No User Exists" });
    else {
      req.logIn({ username: user.username }, (err) => {
        if (err) return next(err);
        return res.send({ success: true, message: "authentication succeeded" });
      });
    }
  })(req, res, next);
});

router.get("/logout", ensureAuthenticatedPage, function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(req.get("referer"));
    //res.status (204).send (true);
  });
});
router.post("/logout", ensureAuthenticatedLogout, function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.send(true);
  });
});


router.post("/user", ensureAuthenticatedReq, (req, res, next) => {
  res.json(req.user);
});

export { router as authRouter };
