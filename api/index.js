const http = require("http");
const app = require("../app");
const { initializeSocket } = require("../socket");

const port = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start server
server.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
});