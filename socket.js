<<<<<<< HEAD
const { Server } = require("socket.io");
=======
const socketIo = require("socket.io");
>>>>>>> 34a3671 (Add complete backend)

const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const Ride = require("./models/ride.model");

<<<<<<< HEAD
let io = null;

// ======================================================
// INITIALIZE SOCKET.IO
// ======================================================

function initializeSocket(server) {
    if (!server) {
        throw new Error("HTTP server is required for Socket.IO");
    }

    io = new Server(server, {
=======
let io;

function initializeSocket(server) {
    io = socketIo(server, {
>>>>>>> 34a3671 (Add complete backend)
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
<<<<<<< HEAD
        transports: ["websocket", "polling"],
    });

    console.log("✅ Socket.IO initialized");

    io.on("connection", (socket) => {
        console.log("✅ Socket connected:", socket.id);

        // ==================================================
        // JOIN
        // ==================================================

        socket.on("join", async (data) => {
            try {
                const { userId, userType } = data || {};

                if (!userId || !userType) {
                    console.log("⚠️ Invalid join data:", data);
                    return;
                }

                if (userType === "user") {
                    await userModel.findByIdAndUpdate(
                        userId,
                        {
                            socketId: socket.id,
                        },
                        {
                            new: true,
                        }
                    );
                }

                if (userType === "captain") {
                    await captainModel.findByIdAndUpdate(
                        userId,
                        {
                            socketId: socket.id,
                        },
                        {
                            new: true,
                        }
                    );
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

        socket.on("update-location", async (data) => {
            try {
                const { userId, location } = data || {};

                if (!userId) return;

                if (
                    location?.lat === undefined ||
                    location?.lng === undefined
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
                    userId
                );
            } catch (error) {
                console.error(
                    "❌ Location update error:",
                    error.message
                );
            }
        });

        // ==================================================
        // RIDE COMPLETED
        // ==================================================

        socket.on("ride-completed", async (data) => {
            try {
                const { rideId } = data || {};

                if (!rideId) {
                    console.log(
                        "⚠️ rideId missing"
                    );
                    return;
                }

                const ride = await Ride.findById(
                    rideId
                );

                if (!ride) {
                    console.log(
                        "⚠️ Ride not found:",
                        rideId
                    );
                    return;
                }

                // ------------------------------------------
                // Mark ride completed
                // ------------------------------------------

                ride.status = "completed";

                await ride.save();

                // ------------------------------------------
                // Find captain
                // ------------------------------------------

                const captain =
                    await captainModel.findOne({
                        socketId: socket.id,
                    });

                // ------------------------------------------
                // Update captain earnings
                // ------------------------------------------

                if (captain) {
                    await captainModel.findByIdAndUpdate(
                        captain._id,
                        {
                            $inc: {
                                earned: ride.fare || 0,
                            },
                        }
                    );

                    const updatedCaptain =
                        await captainModel.findById(
                            captain._id
                        );

                    // Notify captain
                    if (updatedCaptain?.socketId) {
                        sendMessageToSocketId(
                            updatedCaptain.socketId,
                            {
                                event: "ride-completed",
                                data: {
                                    ride,
                                    captain:
                                        updatedCaptain,
                                },
                            }
                        );
                    }
                }

                // ------------------------------------------
                // Notify user
                // ------------------------------------------

                const user =
                    await userModel.findById(
                        ride.user
                    );

                if (user?.socketId) {
                    sendMessageToSocketId(
                        user.socketId,
                        {
                            event: "ride-completed",
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
        });

        // ==================================================
        // DISCONNECT
        // ==================================================

        socket.on("disconnect", async (reason) => {
            console.log(
                "❌ Socket disconnected:",
                socket.id,
                "Reason:",
                reason
            );

            try {
                await captainModel.findOneAndUpdate(
                    {
                        socketId: socket.id,
                    },
                    {
                        socketId: null,
                    }
                );

                await userModel.findOneAndUpdate(
                    {
                        socketId: socket.id,
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
        });
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
=======
    });

    io.on("connection", (socket) => {
        console.log("✅ Socket connected:", socket.id);

        // ================= JOIN =================
        socket.on("join", async (data) => {
            try {
                const { userId, userType } = data;

                if (userType === "user") {
                    await userModel.findByIdAndUpdate(userId, {
                        socketId: socket.id,
                    });
                }

                if (userType === "captain") {
                    await captainModel.findByIdAndUpdate(userId, {
                        socketId: socket.id,
                    });
                }

                console.log("👤 JOINED:", data);
            } catch (err) {
                console.log(err);
            }
        });

        // ================= UPDATE LOCATION =================
        socket.on("update-location", async (data) => {
            try {
                const { userId, location } = data;

                if (!location?.lat || !location?.lng) return;

                await captainModel.findByIdAndUpdate(userId, {
                    location: {
                        lat: location.lat,
                        lng: location.lng,
                    },
                });

                console.log("📍 Location updated");
            } catch (err) {
                console.log(err);
            }
        });

        // ================= DISCONNECT =================
        socket.on("disconnect", async () => {
            console.log("❌ Disconnected:", socket.id);

            await captainModel.findOneAndUpdate(
                { socketId: socket.id },
                { socketId: null }
            );

            await userModel.findOneAndUpdate(
                { socketId: socket.id },
                { socketId: null }
            );
        });

        // ================= RIDE COMPLETED (from captain client) =================
        socket.on("ride-completed", async (data) => {
            try {
                const { rideId } = data || {};
                if (!rideId) return;

                const ride = await Ride.findById(rideId);
                if (!ride) return;

                // mark ride completed
                ride.status = "completed";
                await ride.save();

                // find captain by socket id
                const captain = await captainModel.findOne({ socketId: socket.id });

                if (captain) {
                    // increment captain earnings
                    await captainModel.findByIdAndUpdate(captain._id, {
                        $inc: { earned: ride.fare || 0 }
                    });

                    const updatedCaptain = await captainModel.findById(captain._id);

                    // notify captain client
                    if (updatedCaptain?.socketId) {
                        sendMessageToSocketId(updatedCaptain.socketId, {
                            event: "ride-completed",
                            data: { ride, captain: updatedCaptain }
                        });
                    }
                }

                // notify user client
                const user = await userModel.findById(ride.user);
                if (user?.socketId) {
                    sendMessageToSocketId(user.socketId, {
                        event: "ride-completed",
                        data: { ride, captain }
                    });
                }

            } catch (err) {
                console.log("ride-completed handler error:", err);
            }
        });
    });
}

// ================= SEND MESSAGE =================
const sendMessageToSocketId = (socketId, messageObject) => {
    if (!io || !socketId) return;

    io.to(socketId).emit(messageObject.event, messageObject.data);
};
>>>>>>> 34a3671 (Add complete backend)

module.exports = {
    initializeSocket,
    sendMessageToSocketId,
<<<<<<< HEAD
    getIO,
};

=======
};
>>>>>>> 34a3671 (Add complete backend)
