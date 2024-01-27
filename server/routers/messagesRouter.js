import express from "express";

import { message } from "../models/message.model.js";

const router = express.Router();
import {
  ensureAuthenticatedPage,
  ensureAuthenticatedReq,
} from "../controllers/controller.js";


router.post("/addmessage", function (req, res, next) {
  let newMessage = new message(req.body.data);
  newMessage
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => res.status(404).send({ message: err }));
});

router.post(
  "/contactmessages",
  ensureAuthenticatedReq,
  function (req, res, next) {
    message
    
      .find({})
      .then((data) => {
        return res.json({ data: data });
      })
      .catch((err) => res.status(404).send({ message: err }));
  }
);

router.put("/deletemessage", ensureAuthenticatedReq, function (req, res, next) {
  message
    .findOneAndDelete({ _id: req.body.data })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => res.status(404).send({ message: err }));
});

export { router as messageRouter };
