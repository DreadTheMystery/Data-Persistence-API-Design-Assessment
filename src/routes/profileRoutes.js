const express = require("express");
const {
  createProfileHandler,
  getSingleProfileHandler,
  getAllProfilesHandler,
  searchProfilesHandler,
  exportProfilesHandler,
  deleteProfileHandler,
} = require("../controllers/profileController");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireRole("admin"), createProfileHandler);
router.get("/", getAllProfilesHandler);
router.get("/search", searchProfilesHandler);
router.get("/export", exportProfilesHandler);
router.get("/:id", getSingleProfileHandler);
router.delete("/:id", requireRole("admin"), deleteProfileHandler);

module.exports = router;
