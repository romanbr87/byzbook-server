import cloudinary from "cloudinary";
cloudinary.config({
  secure: true,
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});


export const cloudinaryUpload =async (req,res,next) => {

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

}


