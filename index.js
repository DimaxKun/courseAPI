require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/user");
const courseRoutes = require("./routes/course");
const enrollmentRoutes = require("./routes/enrollment");
const app = express();


mongoose.connect(process.env.MONGODB_STRING);
let db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => console.log("We're connected to the cloud database"))

// console.log("Mongo URI:", process.env.MONGODB_STRING);

app.use(express.json());
app.use(express.urlencoded({extended:true}));


//CORS (Cross-Origin Resource Sharing)
// it allows our backend application to be available to our frontend application

app.use(cors())

const corsOptions = {
	origin: ['http://localhost:5173'],
	//methods: ['GET', 'POST'],
	//allowedHeaders: ['Content-Type', 'Authorization']
	credentials: true, //cookies, headers
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

//Export both app and mongoose for only for checking
module.exports = {app,mongoose};