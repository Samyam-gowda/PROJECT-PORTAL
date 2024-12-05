const express = require("express");
const path = require("path");

// Create an Express app
const app = express();

// Set the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use('/images', express.static(path.join(__dirname, 'public/images')));


// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Import and use the router from routes/index.js
const router = require("./routes/index");
app.use("/", router);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
