import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

var businessSchema, businessModel;

try {
  businessSchema = new mongoose.Schema({
    gsx$type: {
      type: mongoose.ObjectId,
      ref: "businesstypes",
      required: false,
    },
    gsx$name: { type: String, unique: false, required: false },
    gsx$logo: {
      type: mongoose.Types.ObjectId,
      unique: false,
      ref: "images",
    },
    gsx$logoheight: { type: Number, min: 200, max: 500 },
    gsx$logowidth: { type: Number, min: 200, max: 500 },
    gsx$address: { type: String, required: false, default: null },
    gsx$city: { type: String, required: false },
    gsx$phone: { type: [{ type: String }], default: [null, null, null] },
    gsx$whatsapp: { type: String, default: null },
    gsx$email: {
      type: String,
      required: false,
      default: null,
    },
    gsx$facebook: { type: String, default: null },
    gsx$instagram: { type: String, default: null },
    gsx$website: { type: String, default: null },
    gsx$comment: { type: String, default: null },
    gsx$worktime: { type: [{ type: String }], default: [null, null, null] },
    gsx$desc: { type: String, required: false },
    gsx$tags: { type: [{ type: String }], required: false },
    gsx$link: { type: String, required: false, unique: false },
    gsx$active: { type: Boolean, required: false, default: false },
  });

  businessSchema.plugin(
    uniqueValidator,
    "Error, expected {PATH} to be unique."
  );
  businessModel = mongoose.model("business", businessSchema);
} catch (e) {
  console.log(e);
}

export { businessModel as business };
