
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

// 1. Home route
app.get("/", (req, res) => {
    res.status(200).send("Welcome to my Node.js and Express Server!");
});

// 2. About route
app.get("/about", (req, res) => {
    res.status(200).json({
        name: "Siri",
        section: "YOUR SECTION"
    });
});

// 3. Time route
app.get("/time", (req, res) => {
    res.status(200).json({
        currentDateTime: new Date()
    });
});

// 4. 404 route
app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
