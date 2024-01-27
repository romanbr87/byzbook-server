import { types } from "../models/types.model.js";
import { business } from "../models/businesses.model.js";
import { db } from "../lib/db.js";

const fetchDataFromDB = async (
  req,
  res,
  next,
  isActivatable,
  callback,
  errFunc
) => {
  let query = isActivatable ? { gsx$active: true } : {};

  try {
    let val = {};
    // val.businesses = await business.find(query);
    val.businesses = await business.find().populate("gsx$logo");
    //return console.log(val.businesses.length, val.businesses);
    val.types = await types.find({});
    return callback(val, res);
  } catch (err) {
    if ((errFunc = 1)) return res.status(404).json(err);
    else return next({ status: 404, message: err });
  }
};

const getRandomBusiness = async () => {
  var cnt = await business.count();
  var n = Math.floor(Math.random() * cnt);
  var rndbusiness = await business.findOne().skip(n).populate ("gsx$logo");
  return rndbusiness;
};

const getCnt = async () => {
  var models = Object.values(db.db.models);

  var counts = await Promise.all(
    models.map(async (model) => {
      var modelName = model.collection.collectionName;
      var cnt = await model.collection.countDocuments();
      var obj = { [modelName]: cnt };
      return obj;
    })
  );

  counts = Object.assign({}, ...counts);
  return counts;
};

const getCol = async () => {
  var models = Object.values(db.db.models);

  var cols = await Promise.all(
    models.map(async (model) => {
      var modelName = model.collection.collectionName;
      var col = await model.find({});
      var obj = { [modelName]: col };
      return obj;
    })
  );

  cols = Object.assign({}, ...cols);
  return cols;
};

/*function fetchDataFromDB (req, res, next, callback) {
  var userAgent = req.headers['user-agent'];     // user-agent header from an HTTP request
  var arr = [Business, types]
  return Promise.all(
    arr.map(table =>
      table.find ({})
      .then (types => types)
      .catch (err => err)
    ))
    .then((value) => {
      let val = { };
      val.businesses = value[0];
      val.types = value[1];
      val.ua = userAgent;
      return callback (val, res);
      //return res.json (val);
    })
    .catch((err) => {
      var error = { }
      error.err1 = err[0];
      error.err2 = err[1];
      //return res.status(404).json(error);
      return next(error)
    })
}*/

const ip = (req) =>
  req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

const ensureAuthenticatedPage = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  else next({ status: 511, message: "הדף לא קיים" });
};
const ensureAuthenticatedReq = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.log (req.user);
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }
};

const ensureAuthenticatedLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.status(403).json({
      status: 403,
      message: "לא ניתן לבצע פעולה",
    });
  }
  //next ({ status: 403, message: "לא ניתן לבצע פעולה"});
  else return next();
};

const ensureAuthenticatedLogout = (req, res, next) => {
  if (!req.isAuthenticated())
    res.status(403).json({
      status: 403,
      message: "לא ניתן לבצע פעולה",
    });
  //next ({ status: 403, message: "לא ניתן לבצע פעולה"});
  else return next();
};

export {
  fetchDataFromDB,
  getCnt,
  getCol,
  getRandomBusiness,
  ip,
  ensureAuthenticatedLogin,
  ensureAuthenticatedLogout,
  ensureAuthenticatedPage,
  ensureAuthenticatedReq,
};
