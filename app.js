const dotenv = require('dotenv');
dotenv.config();
const cookieParser=require('cookie-parser');
const express = require('express');
const cors = require("cors");

const app = express();

const connectedToDB = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes=require('./routes/captain.routes');
const mapsRoutes=require('./routes/maps.routes');
const rideRoutes=require('./routes/ride.routes');

connectedToDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads",express.static("uploads"));
app.use(cookieParser());
// ✅ routes should be here (global level)
app.use('/users', userRoutes);
app.use('/captains',captainRoutes);
app.use('/maps',mapsRoutes);
app.use('/rides',rideRoutes);
app.get("/", (req, res) => {
    res.send("Hello World");
});

module.exports = app;