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
