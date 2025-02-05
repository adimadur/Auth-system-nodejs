import express from "express";
import dotenv from 'dotenv';
import { authRouter } from "./routes/userRoutes.js";
import { connectToDB } from "./config/connectToDb.js";
import bodyParser from 'body-parser'
dotenv.config();



const app = express();
app.use(bodyParser.json())
app.listen(3000, (req, res) => {
	console.log("Listening on port http://localhost:3000");
	connectToDB();
});



app.get("/", (req, res, next) => {
	try {
		// const { email, password } = req.body;
		return res.status(200).json({
			msg: "Root Method Called",
			// data: email + " " + password
		})
		
	} catch (error) {
		return res.status(500).json({
			msg: error.message
		})
	}

});

app.use('/api', authRouter);