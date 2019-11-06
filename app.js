const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

//Routes
const userRoutes = require("./server/api/v1/routes/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const BASE_ROUTE = "/api/v1";
app.use(BASE_ROUTE + "/user", userRoutes);

// CATCH ALL OTHER ERRORS
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: error
    });
});

module.exports = app;
