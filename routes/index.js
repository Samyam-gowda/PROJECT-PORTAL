const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const pdfPoppler = require("pdf-poppler");

// Create a router
const router = express.Router();


// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Route to display the form
router.get("/", (req, res) => {
    res.render("index");
});

// Route to handle PDF upload and conversion
router.post("/upload", upload.single("pdf"), async (req, res) => {
    const faculty = req.body.faculty; // Get faculty from form
    const pdfPath = req.file.path; 
    const pdfName = path.basename(req.file.originalname, path.extname(req.file.originalname));

    const outputDir = path.join(__dirname, "../public/images", faculty, pdfName);

    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const options = {
            format: "jpeg",
            out_dir: outputDir,
            out_prefix: pdfName,
            page: null,
        };

        await pdfPoppler.convert(pdfPath, options);
        res.send(`PDF pages converted to images and stored in: ${outputDir}`);
    } catch (error) {
        console.error("Error during conversion:", error);
        res.status(500).send("An error occurred: " + error.message);
    } finally {
        fs.unlinkSync(pdfPath);
    }
});

// const fs = require('fs');
// const path = require('path');

router.get("/gallery", (req, res) => {
    const imagesDir = path.join(__dirname, "../public/images");

    fs.readdir(imagesDir, (err, faculties) => {
        if (err) {
            return res.status(500).send("Error reading images directory.");
        }

        let galleryData = {};

        faculties.forEach(faculty => {
            const facultyPath = path.join(imagesDir, faculty);
            if (fs.statSync(facultyPath).isDirectory()) {
                const pdfFolders = fs.readdirSync(facultyPath).filter(folder =>
                    fs.statSync(path.join(facultyPath, folder)).isDirectory()
                );

                galleryData[faculty] = pdfFolders.map(folder => ({
                    folderName: folder,
                    images: fs.readdirSync(path.join(facultyPath, folder)).filter(file => file.endsWith('.jpg'))
                }));
            }
        });

        res.render("gallery", { galleryData });
    });
});


// Export the router
module.exports = router;
// Route to display images for a specific PDF folder
router.get("/gallery/:faculty/:folderName", (req, res) => {
    const { faculty, folderName } = req.params;
    const folderPath = path.join(__dirname, "../public/images", faculty, folderName);

    if (!fs.existsSync(folderPath)) {
        return res.status(404).send("Folder not found.");
    }

    const images = fs.readdirSync(folderPath).filter(file => file.endsWith('.jpg'));
    const imagePaths = images.map(image => `/images/${faculty}/${folderName}/${image}`);

    res.render("imageViewer", { folderName, images: imagePaths });
});

