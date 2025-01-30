const imagekit = require('../config/imagekit.config');
const path = require('path');
const uuid = require('uuid');

class ImagekitController {  
    static async uploadImage(req, res) {
        let responseData;

        if(req.file) {
            const strFile = req.file.buffer.toString('base64');
            const fileName = uuid.v4() + path.extname(req.file.originalname);

            // responseData = await imagekit.upload({
            //     file : strFile,
            //     fileName : fileName,
            //     // checks: {file.size :  "1mb"}, // To run server side checks before uploading files. Notice the quotes around file.size and 1mb.
            // }, function(error, result) {
            //     if(error) console.log(error);
            //     else console.log(result);
            // });
        
            
            imagekit.upload({
                file : strFile,
                fileName : fileName
            }).then(response => {
                res.status(200).json({
                    status: "success",
                    message: "Image uploaded successfully",
                    data : response,
                });
            }).catch(error => {
                console.log(error);
            });
        }

        // console.log(responseData);

        // res.status(200).json({
        //     status: "success",
        //     message: "Image uploaded successfully",
        //     data : responseData,
        // });

    }
}


module.exports = ImagekitController;