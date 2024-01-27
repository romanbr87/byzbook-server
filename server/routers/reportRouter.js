import  express from "express"
const reportRouter = express.Router();
import  { ensureAuthenticatedReq } from "../controllers/controller.js";
import  { reportModel } from "../models/report.model.js";

/*-------------------------------------------------------*/
reportRouter.get("/reports", ensureAuthenticatedReq, function (req, res, next) {
  reportModel
    .find({})
    .populate("gsx$refId", ["gsx$name", "gsx$link"])
    .exec((err, data) => {
      if (err) next({ status: 404, message: err });
      return res.render("./Components/Reports", { reports: data });
    });
});

reportRouter.post(
  "/reports",
  ensureAuthenticatedReq,
  async function (req, res, next) {
    reportModel
      .find({})
      .populate("gsx$refId", ["gsx$name", "gsx$link"])
      .exec((err, data) => {
        if (err) return res.status(404).send({ message: err });
        return res.json({ reports: data });
      });
  }
);


 reportRouter.post("/addreport", async (req, res, next) => {
  
    let newReport = new reportModel(req.body);
    await newReport
      .save()
      .then((data) => {
        console.log(data);
        res.send(data);
      })
      .catch((err) => res.status(404).send({ message: err }));
});

reportRouter.put(
  "/deletereport",
  ensureAuthenticatedReq,
  function (req, res, next) {
    reportModel
      .findOneAndDelete({ _id: req.body.data })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => res.status(404).send({ message: err }));
  }
);

export {reportRouter}
