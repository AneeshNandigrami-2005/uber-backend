const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const connectedToDB = require("./db/db");

const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");

// ======================================================
// DATABASE
// ======================================================

connectedToDB();

// ======================================================
// CORS
// ======================================================

const configuredOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    ...configuredOrigins,
];

const isAllowedOrigin = (origin) => {
    if (allowedOrigins.includes(origin)) {
        return true;
    }

    // Allow Vercel preview URLs for this app without opening CORS to all sites.
    return /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.vercel\.app$/i.test(origin);
};

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without origin
            // (Postman, server-to-server, etc.)
            if (!origin) {
                return callback(null, true);
            }

            if (isAllowedOrigin(origin)) {
                return callback(null, true);
            }

            console.log("❌ CORS blocked:", origin);

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(cookieParser());

// ======================================================
// STATIC FILES
// ======================================================

app.use(
    "/uploads",
    express.static("uploads")
);

// ======================================================
// ROUTES
// ======================================================

app.use("/users", userRoutes);

app.use("/captains", captainRoutes);

app.use("/maps", mapsRoutes);

app.use("/rides", rideRoutes);

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Uber Backend API is Running 🚗",
    });
});

// ======================================================
// 404 ROUTE
// ======================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.message);

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "CORS Error: Origin not allowed",
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error:
            process.env.NODE_ENV === "development"
                ? err.message
                : undefined,
    });
});

// ======================================================
// EXPORT APP
// ======================================================

module.exports = app;