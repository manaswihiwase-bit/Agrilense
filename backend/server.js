const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const upload = multer({
    dest: "uploads/",
     limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {

        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }

    }
});
app.use(cors());

const PORT = 5000;

app.use(express.json());

app.get ("/",(req,res)=> {
    res.send("Agrilense Backend is running");
});

app.post("/analyze",upload.single("image"),(req,res)=>{
    console.log(req.file);

    if (!req.file) {
    return res.status(400).json({
        error: "Please upload an image"
    });
}
    res.json({
        disease : "leaf blight",
        suggestion :"use the recommended fertilizer",
        confidence : "95"
    });
});

app.listen(PORT,()=>{
    console.log("server is running on port 5000")
});