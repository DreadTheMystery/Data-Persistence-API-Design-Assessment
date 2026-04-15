const express = require("express");
const cors = require("cors");
const profilesRouter = require("./routes/profileRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/profiles", profilesRouter);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Profiles API is running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
