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
    const pdfPath = req.file.path; // Path of the uploaded PDF
    const pdfName = path.basename(req.file.originalname, path.extname(req.file.originalname)); // Extract name without extension
    const outputDir = path.join(__dirname, "../public/images", pdfName);


    try {
        // Ensure the output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true }); // Create directory with the PDF name
        }

        // Set options for pdf-poppler
        const options = {
            format: "jpeg", // Output image format
            out_dir: outputDir, // Store images in the dynamically created folder
            out_prefix: pdfName, // Prefix images with PDF name
            page: null, // Convert all pages
        };

        // Convert PDF to images
        await pdfPoppler.convert(pdfPath, options);

        res.send(`PDF pages have been converted to images and stored in the folder: ${outputDir}`);
    } catch (error) {
        console.error("Error during PDF to image conversion:", error);
        res.status(500).send("An error occurred during conversion: " + error.message);
    } finally {
        // Cleanup: Delete uploaded PDF
        fs.unlinkSync(pdfPath);
    }
});
// const fs = require('fs');
// const path = require('path');

router.get("/gallery", (req, res) => {
    const imagesDir = path.join(__dirname, "../public/images");
    
    // Get all folders (PDF names)
    fs.readdir(imagesDir, (err, folders) => {
        if (err) {
            return res.status(500).send("Error reading images directory.");
        }

        // Filter only directories
        const imageFolders = folders.filter(folder => {
            return fs.statSync(path.join(imagesDir, folder)).isDirectory();
        });

        // Prepare data to send to the frontend
        const galleryData = imageFolders.map(folder => {
            const folderPath = path.join(imagesDir, folder);
            const images = fs.readdirSync(folderPath).filter(file => file.endsWith('.jpg'));
            return {
                folderName: folder,
                images: images.map(image => `/images/${folder}/${image}`)
            };
        });

        // Render the gallery page with the data
        res.render("gallery", { galleryData });
    });
});

// Export the router
module.exports = router;
// Route to display images for a specific PDF folder
router.get("/gallery/:folderName", (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, "../public/images", folderName);

    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
        return res.status(404).send("Folder not found.");
    }

    // Get all images in the folder
    const images = fs.readdirSync(folderPath).filter(file => file.endsWith('.jpg'));

    // Prepare data to send to the frontend
    const imagePaths = images.map(image => `/images/${folderName}/${image}`);

    // Render the image viewer page with the data
    res.render("imageViewer", { folderName, images: imagePaths });
});// Route to display images for a specific PDF folder


// router.get("/gallery/:folderName", (req, res) => {
//     const folderName = req.params.folderName;
//     const folderPath = path.join(__dirname, "../public/images", folderName);

//     // Check if the folder exists
//     if (!fs.existsSync(folderPath)) {
//         return res.status(404).send("Folder not found.");
//     }

//     // Get all images in the folder
//     const images = fs.readdirSync(folderPath).filter(file => file.endsWith('.jpg'));

//     // Prepare data to send to the frontend
//     const imagePaths = images.map(image => `/images/${folderName}/${image}`);

//     // Render the image viewer page with the data
//     res.render("imageViewer", { folderName, images: imagePaths });
// });

// Route to display images for a specific PDF folder
router.get("/gallery/:folderName", (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, "../public/images", folderName);

    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
        return res.status(404).send("Folder not found.");
    }

    // Get all images in the folder
    const images = fs.readdirSync(folderPath).filter(file => file.endsWith('.jpg'));

    // Prepare data to send to the frontend
    const imagePaths = images.map(image => `/images/${folderName}/${image}`);

    // Render the image viewer page with the data
    res.render("imageViewer", { folderName, images: imagePaths });
});