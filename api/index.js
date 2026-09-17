const http = require("http");
const app = require("../app");
const { initializeSocket } = require("../socket");

const port = process.env.PORT || 4000;

if (process.env.VERCEL === "1") {
    console.warn(
        "⚠️ Socket.IO is not supported on Vercel serverless deployments. " +
        "Deploy this backend on Render, Railway, Fly.io, or another Node host that keeps a long-lived server."
    );

    module.exports = app;
} else {
    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    initializeSocket(server);

    // Start server
    server.listen(port, () => {
        console.log(`Server is Running on port ${port}`);
    });
}