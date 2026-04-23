function buildQuery(filters) {
	const conditions = [];
	const params = [];

	const {
		gender,
		age_group,
		country_id,
		min_age,
		max_age,
		min_gender_probability,
		min_country_probability,
	} = filters;

	if (gender) {
		params.push(gender.toLowerCase());
		conditions.push(`gender = $${params.length}`);
	}

	if (age_group) {
		params.push(age_group.toLowerCase());
		conditions.push(`age_group = $${params.length}`);
	}

	if (country_id) {
		params.push(country_id.toUpperCase());
		conditions.push(`country_id = $${params.length}`);
	}

	if (min_age !== undefined) {
		params.push(Number(min_age));
		conditions.push(`age >= $${params.length}`);
	}

	if (max_age !== undefined) {
		params.push(Number(max_age));
		conditions.push(`age <= $${params.length}`);
	}

	if (min_gender_probability !== undefined) {
		params.push(Number(min_gender_probability));
		conditions.push(`gender_probability >= $${params.length}`);
	}

	if (min_country_probability !== undefined) {
		params.push(Number(min_country_probability));
		conditions.push(`country_probability >= $${params.length}`);
	}

	const whereClause =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	return { whereClause, params };
}

module.exports = buildQuery;
