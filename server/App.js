const express = require("express")
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const passport = require("passport")
const cookieSession = require("cookie-session");
const passportSetup = require("./passport")
const authRoute = require("./routes/auth")
const cors = require("cors")
const confessionModel = require("./models/confessions")
require('dotenv').config()
const app = express();
const mongo_uri = process.env.MONGO_URI
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(cookieSession(
  {name:"session",
    keys:["users"],
    maxAge:24*60*60*100}
))
app.use(passport.initialize())
app.use(passport.session())
app.use(cors({
  origin:"http://localhost:3000",
  methods:"GET,POST,PUT,DELETE",
  credentials:true
}))
mongoose.connect(mongo_uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => console.log('Database connection established'))
.catch(er => console.log('Error connecting to mongodb instance: ', er));
app.use(express.json())

let username
app.post("/api/currentuser",(req,res)=>{
  username = req.body.displayName
  res.status(200).send("value received: "+username)
})
app.use((req, res, next) => {
  req.username = username;
  next();
});
app.post("/api/confessions",(req,res)=>{
  const model = new confessionModel({
    query:req.body.Query,
    confession:req.body.Confession,
    user:req.username
  })
  model.save().then((created)=>{
    res.json(created)
  }).catch((err)=>{
    res.status(500).json(err)
  })
})
//mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true}).then(console.log("connected to database")).catch(err=>console.log(err))
app.use("/auth",authRoute)
app.listen("5000",()=>{
  console.log("server running");
})