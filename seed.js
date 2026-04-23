require("dotenv").config();
const { v7: uuidv7 } = require("uuid");
const pool = require("./db");
const profiles = require("./seed_profiles.json").profiles;
async function seed() {
	console.log(`Seeding ${profiles.length} profiles...`);
	let inserted = 0;
	let skipped = 0;

	for (const profile of profiles) {
		const result = await pool.query(
			`INSERT INTO profiles 
        (id, name, gender, gender_probability, age, age_group, country_id, country_name, country_probability, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (name) DO NOTHING`,
			[
				uuidv7(),
				profile.name,
				profile.gender,
				profile.gender_probability,
				profile.age,
				profile.age_group,
				profile.country_id,
				profile.country_name,
				profile.country_probability,
			],
		);
		if (result.rowCount > 0) inserted++;
		else skipped++;
	}
	console.log(
		`Done. Inserted: ${inserted}, Skipped (already exist): ${skipped}`,
	);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
