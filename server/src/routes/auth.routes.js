const express = require("express");
const { register, login, oauthLogin, getMe } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/oauth", oauthLogin);
router.get("/me", requireAuth, getMe);

module.exports = router;
