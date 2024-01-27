import express from "express";
import multer from "multer";
import { comment } from "../models/comment.model.js";
import cloudinary from "cloudinary";
cloudinary.config({
  secure: true,
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
import {
  ensureAuthenticatedPage,
  ensureAuthenticatedReq,
} from "../controllers/controller.js";

/*-------------------------------------------------------*/
// new comment
router.post("/comments", function (req, res, next) {
  let newComment = new comment(req.body.data);
  newComment
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => res.status(404).send({ message: err }));
});

router.get(
  "/commentsAdmin",
  ensureAuthenticatedPage,
  function (req, res, next) {
    comment
      .find({})
      .populate("gsx$refID", ["gsx$name", "gsx$link"])
      .exec((err, data) => {
        if (err) next({ status: 404, message: e });
        else return res.render("./Components/CommentsAdmin", { data: data });
      });
  }
);

router.post(
  "/commentsAdmin",
  ensureAuthenticatedReq,
  function (req, res, next) {
    comment
      .find({})
      .populate("gsx$refID", ["gsx$name", "gsx$link"])
      .exec((err, data) => {
        if (err) res.status(404).send({ message: err });
        else return res.json({ data: data });
      });
  }
);

router.put(
  "/commentsAdmin",
  ensureAuthenticatedReq,
  async function (req, res, next) {
    try {
      var data = req.body.data;
      let comments = await comment.find({});
      data = data.filter(
        (info, i) => comments[i].gsx$active != info.gsx$active
      );
      if (data.length == 0) {
        console.log("no need to make changes");
        return res.status(404).send({ message: "אין צורך לעשות שינויים" });
      }

      data = data.map((info) => {
        let obj = {
          updateOne: {
            filter: { _id: info._id },
            update: { gsx$active: info.gsx$active },
            options: { upsert: true, strict: false },
          },
        };

        return obj;
      });

      comment.bulkWrite(data).then((res1) => {
        res.send(true);
      });
    } catch (err) {
      res.status(404).send({ message: err });
    }
  }
);

/*-------------------------------------------------------*/

export { router as commentRouter };
