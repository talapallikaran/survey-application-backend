const multer = require('multer')
const path = require('path');


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/images');
    },
    filename: function(req, file, cb){
        cb(null, new Date().getTime() + path.extname(file.originalname));
    }
});


const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype.split("/")[1] === "pdf"){
        cb(null,true);
    }
    else{
        req.fileValidationError = "Forbidden extension";
        cb(null,false);
    }
}

const uploads = multer({
    storage: storage,
    limits: {
        fileSize: 307200
    },
    fileFilter:fileFilter
});

module.exports ={
    upload:uploads
}