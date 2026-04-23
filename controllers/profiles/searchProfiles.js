const pool = require("../../db");
const buildQuery = require("./queryBuilder");
const parseNaturalLanguage = require("./nlpParser");

exports.searchProfiles = async (req, res) => {
	try {
		const { q, page, limit } = req.query;

		if (!q || q.trim() === "") {
			return res.status(400).json({
				status: "error",
				message: "Missing or empty parameter: q",
			});
		}

		const filters = parseNaturalLanguage(q);

		if (!filters) {
			return res.status(422).json({
				status: "error",
				message: "Unable to interpret query",
			});
		}

		const pageNum = parseInt(page) || 1;
		const limitNum = Math.min(parseInt(limit) || 10, 50);
		const offset = (pageNum - 1) * limitNum;

		const { whereClause, params } = buildQuery(filters);

		const countResult = await pool.query(
			`SELECT COUNT(*) FROM profiles ${whereClause}`,
			params,
		);
		const total = parseInt(countResult.rows[0].count);

		params.push(limitNum);
		const limitIndex = params.length;
		params.push(offset);
		const offsetIndex = params.length;

		const result = await pool.query(
			`SELECT id, name, gender, gender_probability, age, age_group,
              country_id, country_name, country_probability, created_at
       FROM profiles
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
			params,
		);

		return res.status(200).json({
			status: "success",
			page: pageNum,
			limit: limitNum,
			total,
			data: result.rows,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: "error",
			message: "Internal server error",
		});
	}
};
