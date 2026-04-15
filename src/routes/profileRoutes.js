const express = require("express");
const {
  createProfileHandler,
  getSingleProfileHandler,
  getAllProfilesHandler,
  deleteProfileHandler,
} = require("../controllers/profileController");

const router = express.Router();

router.post("/", createProfileHandler);
router.get("/", getAllProfilesHandler);
router.get("/:id", getSingleProfileHandler);
router.delete("/:id", deleteProfileHandler);

module.exports = router;
