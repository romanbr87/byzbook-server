import mongoose from "mongoose";
import "mongoose-type-url";
import uniqueValidator from "mongoose-unique-validator";
import validate from "mongoose-validator";

var imagesSchema, imagesModel;

try {
  imagesSchema = new mongoose.Schema({
    gsx$refID: { type: mongoose.ObjectId, ref: "business", required: false },
    gsx$logo: { type: String, unique: false, required: true },
    gsx$logoheight: { type: Number, min: 200, max: 500, required: false },
    gsx$logowidth: { type: Number, min: 200, max: 500, required: false },
    createdAt:{type:Date,default:Date.now()}
  });

  imagesModel = mongoose.model("images", imagesSchema);
} catch (e) {
  console.log(e);
}
export {imagesModel}
