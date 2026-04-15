const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/profileController");

router.post("/", ProfileController.createProfile);
router.get("/", ProfileController.getAllProfiles);
router.get("/:id", ProfileController.getProfileById);
router.delete("/:id", ProfileController.deleteProfile);

module.exports = router