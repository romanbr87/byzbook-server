import { convertFileToBase64 } from "../convertFileTobase64.js";
import { getThe64BaseImg } from "../getThe64BaseImg.js";
import { validateFile } from "../validateFile.js";

const base64func = async (req, res, next) => {
  if (req.boolean) {
    validateFile(req, res, next);
    convertFileToBase64(req, res, next);
    getThe64BaseImg(req, res, next);
  } else {
    next();
  }
};

export { base64func };
