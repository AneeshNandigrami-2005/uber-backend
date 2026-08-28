const socketIo = require("socket.io");

const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const Ride = require("./models/ride.model");

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
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

module.exports = {
    initializeSocket,
    sendMessageToSocketId,
};