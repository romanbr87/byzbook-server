import express from "express";

import { imagesModel as image } from "../models/image.model.js";

const router = express.Router();
import {
  ensureAuthenticatedPage,
  ensureAuthenticatedReq,
} from "../controllers/controller.js";


/*-------------------------------------------------------*/
router.get("/imgs", ensureAuthenticatedPage, function (req, res, next) {
  image
    .find({})
    .populate("gsx$refID", ["gsx$name", "gsx$link"])
    .exec((err, data) => {
      if (err) next({ status: 404, message: e });
      else return res.render("./Components/imgs", { data: data });
    });
});

router.post("/imgs", ensureAuthenticatedReq, function (req, res, next) {
  image
    .find({})
    .populate("gsx$refID", ["gsx$name", "gsx$link"])
    .exec((err, data) => {
      if (err) res.status(404).send({ message: err });
      else return res.json({ data: data });
    });
});

export { router as imgRouter };
