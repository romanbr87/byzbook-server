export const validateFile = async (req, res, next) => {
  if (!req.file && !req.gsx) {
    return res.status(400).send("No file uploaded.");
  } else {
    next();
  }
};
