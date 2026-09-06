
const app = require("../app");

// Vercel uses the exported Express app as its serverless function.
module.exports = app;

// Keep the same entry point usable for local development and Render.
if (require.main === module) {
  const http = require("http");
  const { initializeSocket } = require("../socket");
  const port = process.env.PORT || 4000;
  const server = http.createServer(app);

  initializeSocket(server);

  server.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
  });
}

