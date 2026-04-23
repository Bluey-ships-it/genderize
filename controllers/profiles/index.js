const { createProfile } = require("./createProfile");
const { getAllProfiles } = require("./getAllProfiles");
const { getProfileById } = require("./getProfileById");
const { deleteProfile } = require("./deleteProfile");
const { searchProfiles } = require("./searchProfiles");

module.exports = {
	createProfile,
	getAllProfiles,
	getProfileById,
	deleteProfile,
	searchProfiles,
};
