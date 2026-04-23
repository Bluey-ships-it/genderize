const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/profiles");

router.post("/", ProfileController.createProfile);
router.get("/", ProfileController.getAllProfiles);
router.get("/search", ProfileController.searchProfiles);
router.get("/:id", ProfileController.getProfileById);
router.delete("/:id", ProfileController.deleteProfile);

module.exports = router