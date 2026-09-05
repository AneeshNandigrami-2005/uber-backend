const { Server } = require("socket.io");

const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const Ride = require("./models/ride.model");

let io = null;

// ======================================================
// ALLOWED FRONTEND ORIGINS
// ======================================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://uber-frontend-ashy.vercel.app",
];

// ======================================================
// INITIALIZE SOCKET.IO
// ======================================================

function initializeSocket(server) {
    if (!server) {
        throw new Error(
            "HTTP server is required for Socket.IO"
        );
    }

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true,
        },

        transports: [
            "websocket",
            "polling",
        ],
    });

    console.log(
        "✅ Socket.IO initialized"
    );

    // ==================================================
    // CONNECTION
    // ==================================================

    io.on("connection", (socket) => {
        console.log(
            "✅ Socket connected:",
            socket.id
        );

        // ==================================================
        // JOIN
        // ==================================================

        socket.on("join", async (data) => {
            try {
                const {
                    userId,
                    userType,
                } = data || {};

                if (!userId || !userType) {
                    console.log(
                        "⚠️ Invalid join data:",
                        data
                    );
                    return;
                }

                // -----------------------------
                // USER
                // -----------------------------

                if (userType === "user") {
                    const user =
                        await userModel.findByIdAndUpdate(
                            userId,
                            {
                                socketId: socket.id,
                            },
                            {
                                new: true,
                            }
                        );

                    if (!user) {
                        console.log(
                            "⚠️ User not found:",
                            userId
                        );
                        return;
                    }
                }

                // -----------------------------
                // CAPTAIN
                // -----------------------------

                if (userType === "captain") {
                    const captain =
                        await captainModel.findByIdAndUpdate(
                            userId,
                            {
                                socketId: socket.id,
                            },
                            {
                                new: true,
                            }
                        );

                    if (!captain) {
                        console.log(
                            "⚠️ Captain not found:",
                            userId
                        );
                        return;
                    }
                }

                console.log(
                    `👤 ${userType} joined:`,
                    userId,
                    "Socket:",
                    socket.id
                );
            } catch (error) {
                console.error(
                    "❌ Join error:",
                    error.message
                );
            }
        });

        // ==================================================
        // UPDATE CAPTAIN LOCATION
        // ==================================================

        socket.on(
            "update-location",
            async (data) => {
                try {
                    const {
                        userId,
                        location,
                    } = data || {};

                    if (!userId) {
                        console.log(
                            "⚠️ Captain userId missing"
                        );
                        return;
                    }

                    if (
                        location?.lat ===
                            undefined ||
                        location?.lng ===
                            undefined
                    ) {
                        console.log(
                            "⚠️ Invalid location:",
                            location
                        );
                        return;
                    }

                    await captainModel.findByIdAndUpdate(
                        userId,
                        {
                            location: {
                                lat: location.lat,
                                lng: location.lng,
                            },
                        }
                    );

                    console.log(
                        "📍 Captain location updated:",
                        userId,
                        location
                    );
                } catch (error) {
                    console.error(
                        "❌ Location update error:",
                        error.message
                    );
                }
            }
        );

        // ==================================================
        // RIDE COMPLETED
        // ==================================================

        socket.on(
            "ride-completed",
            async (data) => {
                try {
                    const {
                        rideId,
                    } = data || {};

                    if (!rideId) {
                        console.log(
                            "⚠️ rideId missing"
                        );
                        return;
                    }

                    // -----------------------------
                    // FIND RIDE
                    // -----------------------------

                    const ride =
                        await Ride.findById(
                            rideId
                        );

                    if (!ride) {
                        console.log(
                            "⚠️ Ride not found:",
                            rideId
                        );
                        return;
                    }

                    // -----------------------------
                    // COMPLETE RIDE
                    // -----------------------------

                    ride.status = "completed";

                    await ride.save();

                    // -----------------------------
                    // FIND CAPTAIN
                    // -----------------------------

                    const captain =
                        await captainModel.findOne({
                            socketId: socket.id,
                        });

                    // -----------------------------
                    // UPDATE CAPTAIN EARNINGS
                    // -----------------------------

                    if (captain) {
                        await captainModel.findByIdAndUpdate(
                            captain._id,
                            {
                                $inc: {
                                    earned:
                                        ride.fare ||
                                        0,
                                },
                            }
                        );

                        const updatedCaptain =
                            await captainModel.findById(
                                captain._id
                            );

                        // -----------------------------
                        // NOTIFY CAPTAIN
                        // -----------------------------

                        if (
                            updatedCaptain?.socketId
                        ) {
                            sendMessageToSocketId(
                                updatedCaptain.socketId,
                                {
                                    event:
                                        "ride-completed",

                                    data: {
                                        ride,
                                        captain:
                                            updatedCaptain,
                                    },
                                }
                            );
                        }
                    }

                    // -----------------------------
                    // FIND USER
                    // -----------------------------

                    const user =
                        await userModel.findById(
                            ride.user
                        );

                    // -----------------------------
                    // NOTIFY USER
                    // -----------------------------

                    if (user?.socketId) {
                        sendMessageToSocketId(
                            user.socketId,
                            {
                                event:
                                    "ride-completed",

                                data: {
                                    ride,
                                    captain,
                                },
                            }
                        );
                    }

                    console.log(
                        "✅ Ride completed:",
                        rideId
                    );
                } catch (error) {
                    console.error(
                        "❌ ride-completed error:",
                        error.message
                    );
                }
            }
        );

        // ==================================================
        // DISCONNECT
        // ==================================================

        socket.on(
            "disconnect",
            async (reason) => {
                console.log(
                    "❌ Socket disconnected:",
                    socket.id,
                    "Reason:",
                    reason
                );

                try {
                    // -----------------------------
                    // REMOVE CAPTAIN SOCKET ID
                    // -----------------------------

                    await captainModel.findOneAndUpdate(
                        {
                            socketId:
                                socket.id,
                        },
                        {
                            socketId: null,
                        }
                    );

                    // -----------------------------
                    // REMOVE USER SOCKET ID
                    // -----------------------------

                    await userModel.findOneAndUpdate(
                        {
                            socketId:
                                socket.id,
                        },
                        {
                            socketId: null,
                        }
                    );
                } catch (error) {
                    console.error(
                        "❌ Disconnect cleanup error:",
                        error.message
                    );
                }
            }
        );
    });

    return io;
}

// ======================================================
// SEND MESSAGE TO SPECIFIC SOCKET
// ======================================================

function sendMessageToSocketId(
    socketId,
    messageObject
) {
    if (!io) {
        console.log(
            "⚠️ Socket.IO is not initialized"
        );
        return;
    }

    if (!socketId) {
        console.log(
            "⚠️ Socket ID missing"
        );
        return;
    }

    if (
        !messageObject ||
        !messageObject.event
    ) {
        console.log(
            "⚠️ Invalid socket message:",
            messageObject
        );
        return;
    }

    io.to(socketId).emit(
        messageObject.event,
        messageObject.data
    );

    console.log(
        "📤 Socket message sent:",
        messageObject.event,
        "to:",
        socketId
    );
}

// ======================================================
// GET SOCKET.IO INSTANCE
// ======================================================

function getIO() {
    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized"
        );
    }

    return io;
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    initializeSocket,
    sendMessageToSocketId,
    getIO,
};