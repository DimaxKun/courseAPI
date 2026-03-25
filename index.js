const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/course");
const enrollmentRoutes = require("./routes/enrollment");

require('dotenv').config();
const app = express();

mongoose.connect(process.env.MONGODB_STRING);
let db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => console.log("We're connected to the cloud database"))

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors())

const corsOptions = {
	origin: ['http://localhost:5173'],
	credentials: true, 
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/enrollments", enrollmentRoutes);


if(require.main === module){
    app.listen(process.env.PORT || 3000, () => 
    	console.log(`API is now online on port ${process.env.PORT || 3000}`));
}

module.exports = {app,mongoose};