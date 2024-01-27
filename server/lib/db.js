

import mongoose from "mongoose";
import { defaultContent } from "../controllers/default/defaultContent.js";

var db = mongoose.connection;

const connect = async () => {
  //mongoose 7 update:
  mongoose.set("strictQuery", false);
  mongoose.set('useNewUrlParser',true)
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Succesfully connected to the database `);
  defaultContent();
};



export { connect ,db};
