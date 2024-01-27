import fs from "fs";
import multer from "multer";
import express from "express";
import cloudinary from "cloudinary";

import { types } from "../models/types.model.js";
import { business } from "../models/businesses.model.js";
import { imagesModel as images } from "../models/image.model.js";
import { comment } from "../models/comment.model.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
import { validateFile } from "../middlewares/validateFile.js";
import { convertFileToBase64 } from "../middlewares/convertFileTobase64.js";
import {
  fetchDataFromDB,
  ensureAuthenticatedPage,
  ensureAuthenticatedReq,
} from "../controllers/controller.js";
import { getThe64BaseImg } from "../middlewares/getThe64BaseImg.js";
import { mongoRegex_id } from "../../utils/utils.js";

//import { base64func } from "../middlewares/business/base64Func.js";
cloudinary.config({
  secure: true,
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

/*-------------------------------------------------------*/
router.get(
  "/businessEditor",
  ensureAuthenticatedPage,
  function (req, res, next) {
    fetchDataFromDB(
      req,
      res,
      next,
      false,
      async function (val, res) {
        //await business.deleteMany ({});
        return res.render("./Components/BusinessEditor", val);
      },
      0
    );
  }
);

router.get(
  "/BusinessPageEditor/:id",
  ensureAuthenticatedPage,
  function (req, res, next) {
    let id = req.params.id;
    let query = { gsx$link: id };
    business
      .findOne(query)
      .then(async (data) => {
        var myTypes = await types.find({});
        if (data == null || types == null)
          next({ status: 404, message: "הדף לא קיים" });
        else
          return res.render("./Components/BusinessPageEditor", {
            types: myTypes,
            business: data,
          });
      })
      .catch((err) => {
        next({ status: 404, message: err });
      });
  }
);

router.post(
  "/BusinessPageEditor/:id",
  ensureAuthenticatedReq,
  function (req, res, next) {
    let id = req.params.id;
    let query = { gsx$link: id };
    business
      .findOne(query)
      .then(async (data) => {
        var myTypes = await types.find({});
        if (data == null || types == null)
          next({ status: 404, message: "הדף לא קיים" });
        else return res.json({ types: myTypes, business: data });
      })
      .catch((err) => res.status(404).json({ message: err }));
  }
);

router.get("/NewBusiness", function (req, res, next) {
  fetchDataFromDB(req, res, next, false, async function (val, res) {
    return res.render("./Components/newBusiness", val);
  });
});

router.post("/NewBusiness", function (req, res, next) {
  fetchDataFromDB(req, res, next, false, async function (val, res) {
    return res.json(val);
  });
});
router.put(
  "/updateBusImg/:busId",
  upload.single("gsx$logo"),
  ensureAuthenticatedReq,
  validateFile,
  convertFileToBase64,
  getThe64BaseImg,
  async (req, res) => {
    const { busId } = req.params;
    let bus = await business.findById(busId);
    let img = await images.findById(bus.gsx$logo);
    try {
      cloudinary.uploader.upload(req.fileContent, async function (data, err) {
        if (err) {
          console.log(err);
          return res.status(404).json({ status: 404, message: err });
        }
        img.gsx$logo = data.url;
        await img.save();
        return res.json(data);
      });
    } catch (err) {
      return res.status(404).json({ status: 404, message: err });
    }
  }
);

router.put(
  "/businessUpdate",
  upload.single("gsx$logo"),
  ensureAuthenticatedReq,
  async (req, res, next) => {
    if (mongoRegex_id.test(req.body.gsx$logo)) {
      req.boolean = false;
      next();
    } else {
      req.boolean = true;
      next();
    }
  },
  function (req, res, next) {
    let newData = req.body;
    delete newData["gsx$logo"];

    business
      .findOneAndUpdate({ _id: newData._id }, newData, {
        new: true,
        upsert: false,
      })
      .then((retData) => {
        // After the update, you can reassign the "gsx$logo" field to the updated document
        retData["gsx$logo"] = newData["gsx$logo"];
        return res.json(retData);
      })
      .catch((err) => console.log(err));
  }
);

router.post(
  "/businessCreate",

  upload.single("file"),
  validateFile,
  convertFileToBase64,
  getThe64BaseImg,
  (req, res) => {
    try {
      let newBus = new business(req.body);
      cloudinary.uploader.upload(req.fileContent, async function (err, data) {
        if (err) {
          console.log(err);
          return next({ status: 404, message: err });
        }
        const newImg = new image({
          gsx$refID: newBus._id,
          gsx$logo: data.url,
        });

        newBus.gsx$logo = newImg._id;
        await newImg.save();
        await newBus.save();
        return res.send(data);
      });
    } catch (error) {
      console.error("Error saving image:", error);
      res.status(500).send("Error saving image");
    }
  }
);

/*-------------------------------------------------------*/

/*-------------------------------------------------------*/
router.get("/", function (req, res, next) {
  fetchDataFromDB(
    req,
    res,
    next,
    true,
    function (val, res) {
      return res.render("./Components/HomePage", val);
    },
    0
  );
});

router.post("/", function (req, res, next) {
  fetchDataFromDB(req, res, next, true, function (val, res) {
    res.json(val);
  });
});

router.post("/getBusinessesBySearch", async (req, res, next) => {
  let data = req.body.data;

  let query1 = { gsx$name: { $regex: data.searchText, $options: "i" } };
  let query2 = { gsx$tags: { $regex: data.searchText, $options: "i" } };

  let query3 = {
    ...(data.active && { gsx$active: data.active }),
    ...(data.city && { gsx$city: data.city }),
    ...(data.type && { gsx$type: data.type }),
  };

  let finalQuery = { $and: [{ $or: [query1, query2] }, query3] };

  business
    .find(finalQuery)
    .populate("gsx$logo")

    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).json({ status: 404, message: err }));
});

router.post("/business/:id", function (req, res, next) {
  let id = req.params.id;
  let query = { _id: id };
  business
    .findOne(query)
    .populate("gsx$logo")
    .then((byz) => {
      if (byz == null)
        res.status(404).json({ status: 404, message: "הדף לא קיים" });
      comment
        .find({ gsx$refID: byz._id, gsx$active: true })
        .then((comm) => {
          if (comm == null)
            res.status(404).json({ status: 404, message: "הדף לא קיים" });
          else return res.json({ data: byz, comments: comm });
        })
        .catch((err) => res.status(404).json({ status: 404, message: err }));
    })
    .catch((err) => res.status(404).json({ status: 404, message: err }));
});

/*-------------------------------------------------------*/
export { router as businessRouter };
