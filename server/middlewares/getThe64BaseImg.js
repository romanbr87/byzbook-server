

export const getThe64BaseImg = async(req,res,next) => {
    const base64Data = req.base64Img; //req.base64Img.split(";base64,").pop();
    const format = req.base64Img.split(";")[0].split("/")[1];
    
    const fileName = `${Date.now()}.${format}`; // Use the correct format for the filename
    
    const filePath = `uploads/${fileName}`; // Update the path according to your setup
    const filePath2 = `uploads/${fileName}-base64.txt`; // Update the path according to your setup
    
    const fileContent = `data:${req.file.mimetype};base64,${base64Data}`;
    req.base64Data = base64Data
    req.filePath = filePath
    req.filePath2 = filePath2
    req.fileContent = fileContent
next()
}
