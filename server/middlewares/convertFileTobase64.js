export const convertFileToBase64 = async (req, res, next) => {
  const fileBuffer = req.file.buffer;
  const base64Image = fileBuffer.toString("base64");
  req.base64Img = base64Image;
  next();
};

