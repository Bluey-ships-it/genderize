const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});

const profileRoutes = require("./routes/profiles");
app.use("/api/profiles", profileRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
