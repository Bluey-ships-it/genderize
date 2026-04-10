const axios = require("axios");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});

app.get("/api/classify", async (req, res) => {
	const { name } = req.query;

	if (!name || name.trim() === "") {
		return res.status(400).json({
			status: "error",
			message: "Name Parameter is required",
		});
	}
	if (typeof name !== "string") {
		return res.status(422).json({
			status: "error",
			message: "Name must be a string",
		});
	}
	try {
		const response = await axios.get(
			`https://api.genderize.io/?name=${name.trim()}`,
		);
		const data = response.data;

		if (!data.gender || !data.count || data.count === 0) {
			return res.status(422).json({
				status: "error",
				message: "No prediction available for the provided name",
			});
		}
		const gender = data.gender;
		const probability = data.probability;
		const sample_size = data.count;
		const is_confident = probability >= 0.7 && sample_size >= 100;
		const processed_at = new Date().toISOString();
		res.status(200).json({
			status: "success",
			data: {
				name: name.trim().toLowerCase(),
				gender,
				probability,
				sample_size,
				is_confident,
				processed_at,
			},
		});
	} catch (error) {
		res.status(502).json({
			status: "error",
			message: "Failed to reach the Genderize API",
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
