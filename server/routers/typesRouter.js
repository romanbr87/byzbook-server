import express from "express";
import multer from "multer";

import { types } from "../models/types.model.js";
import { business } from "../models/businesses.model.js";
//const { ensureAuthenticated } from 'connect-ensure-authenticated' ;
//const EventEmitter from 'events' ;

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
import { validateFile } from "../middlewares/validateFile.js";
import { convertFileToBase64 } from "../middlewares/convertFileTobase64.js";
import {

  ensureAuthenticatedPage,
  ensureAuthenticatedReq,
} from "../controllers/controller.js";

/*-------------------------------------------------------*/
router.get("/typesEditor", ensureAuthenticatedPage, function (req, res, next) {
  types
    .find({})
    .then((data) => {
      return res.render("./Components/TypesEditor", { types: data });
    })
    .catch((err) => next({ status: 404, message: err }));
});

router.post(
  ["/types", "/typesEditor"],
  ensureAuthenticatedReq,  function (req, res, next) {
    types
      .find({})
      .then((data) => {
        return res.json({ types: data });
      })
      .catch((err) => res.status(404).send({ message: err }));
  }
);

router.post("/addnewtype", ensureAuthenticatedReq, function (req, res, next) {
  types
    .create({ gsx$type: req.body.data })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => res.status(404).send({ message: err }));
});

router.put("/updatetype", ensureAuthenticatedReq, function (req, res, next) {
  types
    .findOneAndUpdate(
      { _id: req.body.data.id },
      { gsx$type: req.body.data.val }
    )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).send({ message: err }));
});

router.put(
  "/deletetype",
  ensureAuthenticatedReq,
  async function (req, res, next) {
    var businesses = await business.find({ gsx$type: req.body.data });
    if (businesses.length > 0) res.status(404).json(false);
    else {
      types
        .findOneAndDelete({ _id: req.body.data })
        .then((data) => {
          res.json(data);
        })
        .catch((err) => res.status(404).send({ message: err }));
    }
  }
);

/*-------------------------------------------------------*/
export { router as typeRouter };
