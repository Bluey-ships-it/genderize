require("dotenv").config();
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
});

const profileRoutes = require("./routes/profiles");
app.use("/api/profiles", profileRoutes);


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  return res.status(500).json({
    status: 'error',
    message: err.message
  });
});


app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
