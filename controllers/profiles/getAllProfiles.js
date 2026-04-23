const pool = require("../../db");
const buildQuery = require("./queryBuilder");

const validSortFields = ["age", "created_at", "gender_probability"];
const validOrders = ["asc", "desc"];

exports.getAllProfiles = async (req, res) => {
	try {
		const {
			gender,
			age_group,
			country_id,
			min_age,
			max_age,
			min_gender_probability,
			min_country_probability,
			sort_by,
			order,
			page,
			limit,
		} = req.query;

		// Validate sort/order
		if (sort_by && !validSortFields.includes(sort_by)) {
			return res
				.status(422)
				.json({ status: "error", message: "Invalid query parameters" });
		}
		if (order && !validOrders.includes(order)) {
			return res
				.status(422)
				.json({ status: "error", message: "Invalid query parameters" });
		}

		// Validate numeric params
		if (
			(min_age && isNaN(Number(min_age))) ||
			(max_age && isNaN(Number(max_age))) ||
			(min_gender_probability && isNaN(Number(min_gender_probability))) ||
			(min_country_probability && isNaN(Number(min_country_probability)))
		) {
			return res
				.status(422)
				.json({ status: "error", message: "Invalid query parameters" });
		}

		// Pagination
		const pageNum = parseInt(page) || 1;
		const limitNum = Math.min(parseInt(limit) || 10, 50);
		const offset = (pageNum - 1) * limitNum;

		// Build WHERE clause using shared helper
		const { whereClause, params } = buildQuery({
			gender,
			age_group,
			country_id,
			min_age,
			max_age,
			min_gender_probability,
			min_country_probability,
		});

		// Sorting
		const sortField = validSortFields.includes(sort_by)
			? sort_by
			: "created_at";
		const sortOrder = order === "asc" ? "ASC" : "DESC";

		// Count total
		const countResult = await pool.query(
			`SELECT COUNT(*) FROM profiles ${whereClause}`,
			params,
		);
		const total = parseInt(countResult.rows[0].count);

		// Fetch page
		params.push(limitNum);
		const limitIndex = params.length;
		params.push(offset);
		const offsetIndex = params.length;

		const result = await pool.query(
			`SELECT id, name, gender, gender_probability, age, age_group,
              country_id, country_name, country_probability, created_at
       FROM profiles
       ${whereClause}
       ORDER BY ${sortField} ${sortOrder}
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
		return res
			.status(500)
			.json({ status: "error", message: "Internal server error" });
	}
};
