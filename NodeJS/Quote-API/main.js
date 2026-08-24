const {
  app
} = require("./app.js"); // import the app instance from app.js

// designate which PORT the server will listen on
const PORT = process.env.PORT || 4001; // use the environment's PORT or default to 4001

// start the server and listen on the designated PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // log a message indicating the server is running
});