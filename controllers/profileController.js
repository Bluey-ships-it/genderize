const axios = require("axios");
const { v7: uuidv7 } = require("uuid");
const pool = require("../db");

function getAgeGroup(age) {
	if (age <= 12) return "child";
	if (age <= 19) return "teenager";
	if (age <= 59) return "adult";
	return "senior";
}

async function fetchExternalData(name) {
	const [genderRes, ageRes, nationalityRes] = await Promise.all([
		axios.get(`https://api.genderize.io?name=${name}`),
		axios.get(`https://api.agify.io?name=${name}`),
		axios.get(`https://api.nationalize.io?name=${name}`),
	]);

	return {
		gender: genderRes.data,
		age: ageRes.data,
		nationality: nationalityRes.data,
	};
}

exports.createProfile = async (req, res) => {
	try {
		const { name } = req.body;

		// Validate input
		if (!name || name.trim() === "") {
			return res.status(400).json({
				status: "error",
				message: "Name parameter is required",
			});
		}

		if (typeof name !== "string") {
			return res.status(422).json({
				status: "error",
				message: "Name must be a string",
			});
		}

		const cleanName = name.trim().toLowerCase();

		// Check for duplicate
		const existing = await pool.query(
			"SELECT * FROM profiles WHERE name = $1",
			[cleanName],
		);

		if (existing.rows.length > 0) {
			return res.status(200).json({
				status: "success",
				message: "Profile already exists",
				data: existing.rows[0],
			});
		}

		// Call all 3 external APIs
		let externalData;
		try {
			externalData = await fetchExternalData(cleanName);
		} catch (error) {
			console.error("External API error:", error.message);
			return res.status(502).json({
				status: "error",
				message: error.message,
			});
		}
		const { gender, age, nationality } = externalData;

		// Validate Genderize response
		if (!gender.gender || !gender.count || gender.count === 0) {
			return res.status(502).json({
				status: "error",
				message: "Genderize returned an invalid response",
			});
		}

		// Validate Agify response
		if (!age.age) {
			return res.status(502).json({
				status: "error",
				message: "Agify returned an invalid response",
			});
		}

		// Validate Nationalize response
		if (!nationality.country || nationality.country.length === 0) {
			return res.status(502).json({
				status: "error",
				message: "Nationalize returned an invalid response",
			});
		}

		// Process the data
		const topCountry = nationality.country.reduce((a, b) =>
			a.probability > b.probability ? a : b,
		);

		const profile = {
			id: uuidv7(),
			name: cleanName,
			gender: gender.gender,
			gender_probability: gender.probability,
			sample_size: gender.count,
			age: age.age,
			age_group: getAgeGroup(age.age),
			country_id: topCountry.country_id,
			country_probability: topCountry.probability,
			created_at: new Date().toISOString(),
		};

		// Store in database
		await pool.query(
			`INSERT INTO profiles 
      (id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability, created_at)
     VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			[
				profile.id,
				profile.name,
				profile.gender,
				profile.gender_probability,
				profile.sample_size,
				profile.age,
				profile.age_group,
				profile.country_id,
				profile.country_probability,
				profile.created_at,
			],
		);

		return res.status(201).json({
			status: "success",
			data: profile,
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

exports.getProfileById = async (req, res) => {
	try {
		const { id } = req.params;

		const result = await pool.query("SELECT * FROM profiles WHERE id = $1", [
			id,
		]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				status: "error",
				message: "Profile not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

exports.getAllProfiles = async (req, res) => {
	try {
		const { gender, country_id, age_group } = req.query;

		let query = "SELECT * FROM profiles WHERE 1=1";
		const params = [];

		if (gender) {
			params.push(gender.toLowerCase());
			query += ` AND LOWER(gender) = $${params.length}`;
		}

		if (country_id) {
			params.push(country_id.toUpperCase());
			query += ` AND UPPER(country_id) = $${params.length}`;
		}

		if (age_group) {
			params.push(age_group.toLowerCase());
			query += ` AND LOWER(age_group) = $${params.length}`;
		}

		const result = await pool.query(query, params);

		return res.status(200).json({
			status: "success",
			count: result.rows.length,
			data: result.rows,
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};

exports.deleteProfile = async (req, res) => {
	try {
		const { id } = req.params;

		const result = await pool.query(
			"DELETE FROM profiles WHERE id = $1 RETURNING id",
			[id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				status: "error",
				message: "Profile not found",
			});
		}

		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};
