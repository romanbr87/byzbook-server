import {defContent} from "../../../content/defContent.js";
import { business } from "../../models/businesses.model.js";
import { comment } from "../../models/comment.model.js";
import { imagesModel as images } from "../../models/image.model.js";
import { message } from "../../models/message.model.js";
import { reportModel } from "../../models/report.model.js";
import { types } from "../../models/types.model.js";

export const defaultContent = async () => {
  // Default users ------------------
  const defUser = { _id: `1`, username: "romanbr87", password: "123456" };
  // Default types -----------------------
  const isExistTypes = await types.find();
  if (isExistTypes.length === 0) {
    const defaultTypesData = defContent.defTypes.map((item) => ({ gsx$type: item }));
    try {
      await types.insertMany(defaultTypesData);
      console.log(`Default types saved`);
    } catch (error) {
      console.error(`Error while saving default types: ${error.message}`);
    }
  }

  // Default businesses ------------------
  const isExistBus = await business.find();

  if (isExistBus.length === 0) {
    // Fetch the list of types
    const typeList = await types.find();
  
    if (typeList.length === 0) {
      console.error("No types found. Cannot create default businesses.");
      return; // Stop execution if there are no types.
    }
  
    // Generate a random index to select a type
    const randomNumber = Math.floor(Math.random() * typeList.length);
    const selectedType = typeList[randomNumber]._id;
    // Create default businesses using forEach with async/await
    const createDefaultBusinesses = async () => {
      for (const item of defContent.defBus) {
        const newBus = new business(item);
        newBus.gsx$type = selectedType;
        newBus.gsx$active = true;
        await newBus.save();
      }
    };
  
    try {
      await createDefaultBusinesses();
      console.log(`Default businesses saved`);
    } catch (error) {
      console.error(`Error while saving default businesses: ${error.message}`);
    }
  } else {
    console.log("Businesses already exist. Skipping default creation.");
  }

  // Default Images ------------------
  const isExistImgs = await images.find();

  const businesses = await business.find();
  if (isExistImgs.length === 0) {
    // Fetch the list of businesses
  
    if (businesses.length === 0) {
      console.error("No businesses found. Cannot create default images.");
      return; // Stop execution if there are no businesses.
    }
  
    // Create default images using forEach with async/await
    const createDefaultImages = async () => {
      for (let i = 0; i < defContent.defImg.length; i++) {
        const item = defContent.defImg[i];
        const newImg = new images(item);
        newImg.gsx$refID = businesses[i]._id; // You're using the third business here, you can change the index as needed.
        businesses[i].gsx$logo = newImg._id;
        await newImg.save();
        await businesses[i].save();
      }
    };
  
    try {
      await createDefaultImages();
      console.log(`Default images saved`);
    } catch (error) {
      console.error(`Error while saving default images: ${error.message}`);
    }
  } else {
    console.log("Images already exist. Skipping default creation.");
  }
  // //
// Default reports -------------->>
let isExistReport = await reportModel.find()
if(isExistReport.length === 0){
  for(let report of defContent.defReport){
    let newReport = new reportModel(report)
    newReport.gsx$refId = businesses[1]._id
    await newReport.save()
  }
  console.log(`Default reports saved.`)
}
  // Default comments -------------->>

let isExistComment = await comment.find()
if(isExistComment.length === 0){
  for(let com of defContent.defComment){
    let newComment = new comment(com)
    newComment.gsx$refID = businesses[1]._id
    await newComment.save()
  }
  console.log(`Default comments saved.`)
}
  // Default messages -------------->>

let isExistMessages = await message.find()
if(isExistMessages.length === 0){
  for(let msg of defContent.defMessages){
    let newMsg = new message(msg)
    await newMsg.save()
  }
  console.log(`Default messages saved.`)
}
  
};
