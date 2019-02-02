// load our app server using express
const express = require('express')
const app = express();

// Adding more extensions
const morgan = require('morgan')
const bodyParser = require('body-parser')

var favicon = require('serve-favicon');
app.use(favicon('public/favicon.ico'));


// To be able to use static files
// app.use(express.static('./public'))
app.set('view engine', 'ejs')

// Using extension and middleware
app.use(morgan('short'))
app.use(bodyParser.urlencoded({extended: false}))


// Using routes
const router = require('./routes/checkIn.js')
app.use(router)


// Root route
app.get("/", (req, res) => {
  console.log("Checking someone in or out")
  res.render('pages/checkInStudent')
})

// Route for login
app.get("/loginForm", (req, res) => {
  console.log("Login Form")
  res.render('pages/loginForm')
})

// Route to check in as instructor
router.get("/checkInInstructor", (req, res) => {
  res.render('pages/checkInInstructor')
})

// Route for admin area
app.get("/A928947D03432M0274I902848N", (req, res) => {
  console.log("Admin Area")
  res.render('pages/adminArea')
})

const PORT = process.env.PORT || 3000
// listening on Port 3000
app.listen(PORT, () => {console.log("Server is up and running on " + PORT)})
