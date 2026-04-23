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
