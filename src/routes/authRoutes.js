const express = require("express");
const {
  getCsrfToken,
  githubStartHandler,
  githubCallbackHandler,
  githubCliExchangeHandler,
  refreshHandler,
  logoutHandler,
  whoamiHandler,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { authRateLimit } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.get("/csrf-token", authRateLimit, getCsrfToken);
router.get("/github", authRateLimit, githubStartHandler);
router.get("/github/callback", authRateLimit, githubCallbackHandler);
router.post("/github/cli/exchange", authRateLimit, githubCliExchangeHandler);
router.post("/refresh", authRateLimit, refreshHandler);
router.post("/logout", authRateLimit, logoutHandler);
router.get("/whoami", requireAuth, whoamiHandler);

module.exports = router;
