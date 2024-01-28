import express from "express";
import fs from "fs";
import multer from "multer";

import { types } from "../models/types.model.js";
import { business } from "../models/businesses.model.js";
import { imagesModel as images } from "../models/image.model.js";
import { message } from "../models/message.model.js";
import { comment } from "../models/comment.model.js";
//const { ensureAuthenticated } from 'connect-ensure-authenticated' ;
//const EventEmitter from 'events' ;
import { cloudinary } from "../lib/auth.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
import { validateFile } from "../middlewares/validateFile.js";
import { convertFileToBase64 } from "../middlewares/convertFileTobase64.js";
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
import { getThe64BaseImg } from "../middlewares/getThe64BaseImg.js";
import { base64func } from "../middlewares/business/base64Func.js";
import { apiRouteList } from "../../utils/api-routes.js";
import { mongoRegex_id } from "../../utils/utils.js";

router.get("/getApiRoutes", async (req, res) => {
  res.json(apiRouteList);
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
    let image = await images.findById(bus.gsx$logo);
    cloudinary.uploader.upload(req.fileContent, async function (err, data) {
      if (err) {
        console.log(err);
        return next({ status: 404, message: err });
      }
      image.gsx$logo = data.url;
      await image.save();
      return res.send(data);
    });
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

    let bus = business.findById(newData._id);

    // Remove the "gsx$logo" field from the newData object
    delete newData["gsx$logo"];
    business
      .findOneAndUpdate({ _id: newData._id }, newData, {
        new: true,
        upsert: false,
      })
      .then((retData) => {
        // After the update, you can reassign the "gsx$logo" field to the updated document
        retData["gsx$logo"] = newData["gsx$logo"];
        return res.send(retData);
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

      const htmlContent = `<html>
       <head>
           <title>My HTML Page</title>
       </head>
       <body>
           <img src="data:image/png;base64,${req.base64Data}" />
       </body>
       </html>`;

      fs.writeFileSync(req.filePath, req.base64Data, { encoding: "base64" });

      fs.writeFileSync(req.filePath2, req.fileContent, { encoding: "utf-8" });
      fs.writeFileSync("1.html", htmlContent, {
        encoding: "utf-8",
      });

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
  ensureAuthenticatedReq,
  function (req, res, next) {
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

router.post("/about", async function (req, res, next) {
  let business1 = await getRandomBusiness();
  res.json({ business: business1 });
});

router.post("/addmessage", function (req, res, next) {
  let newMessage = new message(req.body.data);
  newMessage
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => res.status(404).send({ message: err }));
});

router.get(
  "/contactmessages",
  ensureAuthenticatedPage,
  function (req, res, next) {
    message
      .find({})
      .then((data) => {
        return res.render("./Components/Contactmessages", { data: data });
      })
      .catch((err) => next({ status: 404, message: err }));
  }
);

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

router.get(
  "/administrator",
  ensureAuthenticatedPage,
  function (req, res, next) {
    getCnt()
      .then((data) => {
        return res.render("./Components/AdminPage", { cnt: data });
      })
      .catch((err) => next({ status: 404, message: "הדף לא קיים" }));
  }
);

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

router.get("/Homepage1", function (req, res, next) {
  fetchDataFromDB(
    req,
    res,
    next,
    true,
    function (val, res) {
      return res.render("./Components/HomePage1", val);
    },
    0
  );
});

// router.get("/Homepage2", function (req, res, next) {
//   fetchDataFromDB(
//     req,
//     res,
//     next,
//     true,
//     function (val, res) {
//       return res.render("./Components/HomePage2", val);
//     },
//     0
//   );
// });

router.post("/", function (req, res, next) {
  fetchDataFromDB(req, res, next, true, function (val, res) {
    res.json(val);
  });
});

router.post("/getBusinessesBySearch", function (req, res, next) {
  let data = req.body.data;

  let query = {
    gsx$name: { $regex: data.searchText, $options: "i" },
    ...(data.active && { gsx$active: data.active }),
    ...(data.city && { gsx$city: data.city }),
    ...(data.type && { gsx$type: data.type }),
  };

  query = { $and: [query] };

  /*business.find (query).populate ('gsx$type')
    .exec((err, data) => {
      if (err) res.status (404).send({message: err})
      res.json (data)
    })*/
  business
    .find(query)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).json({ status: 404, message: err }));
});

router.get("/page/:id", function (req, res, next) {
  let id = req.params.id;
  let query = { _id: id };
  business
    .findOne(query)
    .then((byz) => {
      if (byz == null) next({ status: 404, message: "הדף לא קיים" });
      comment
        .find({ gsx$refID: byz._id, gsx$active: true })
        .then((comm) => {
          if (comm == null) next({ status: 404, message: "הדף לא קיים" });
          else
            return res.render("./Components/Itemdata", {
              data: byz,
              comments: comm,
            });
        })
        .catch((err) => next({ status: 404, message: err }));
    })
    .catch((err) => next({ status: 404, message: err }));
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

router.post("/a1", function (req, res, next) {
  //var fileName = req.file;
  //console.log (fileName);
  /*var data = req.body.data;
  var file = req.body.fileData
  var fileName = file.name.split ('.');
  let options = { 
    folder: "Github", 
    public_id: fileName[0],
    allowed_formats: ["gif", "png", "jpg", "bmp", "ico", "tiff", "jpc", "jp2", "webp", 
    "svg", "webm", "wdp", "hpx", "flif", "bpg"], 
    format: fileName[1], 
    resource_type: 'image', 
    invalidate: false,
  };*/

  cloudinary.v2.search
    .expression("resource_type:image")
    .sort_by("public_id", "desc")
    //.max_results(30)
    .execute()
    .then((result) => res.send(result));

  //cloudinary.v2.search.expression('resource_type:image').then(result=>res.send(result));

  /*cloudinary.v2.uploader.upload (data, options, function(err, data) {
    if (err) return next ({ status: 404, message: err}) 
    return res.send (data);
  })*/
  /*console.log (options);
  res.send (data);*/
  /*business.find ({})
  .then(data => {
    if (data == null) next ({ status: 404, message: "הדף לא קיים"})
    else return res.send (data)
  })
  .catch(err => next ({ status: 404, message: err}) ) */
});
router.get("/a1", function (req, res, next) {
  /*business.find ({})
  .then(data => {
    if (data == null) next ({ status: 404, message: "הדף לא קיים"})
    else  return res.render('./Components/a3', { data: data, config: config })
  })
  .catch(err => next ({ status: 404, message: err}) )*/
  getCol()
    .then((data) => {
      return res.render("./Components/a3", { data: data });
    })
    .catch((err) => next({ status: 404, message: err }));
});

/*-------------------------------------------------------*/

router.post("/cnt", ensureAuthenticatedReq, (req, res, next) => {
  /*getCnt()
    .then((cnt) => res.json(cnt))
    .catch((err) => res.status(404).send({ message: err }));*/
  res.json(12);
});

/*-------------------------------------------------------*/

router.get("/*", function (req, res, next) {
  next({ status: 404, message: "הדף לא קיים" });
});

router.post("/*", function (req, res, next) {
  res.status(403).send({ message: "לא ניתן לקבל נתונים" });
});
/*-------------------------------------------------------*/

export { router as mainRouter };
