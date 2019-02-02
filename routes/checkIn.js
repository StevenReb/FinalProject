// This containes all user related routes
const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const alert = require('alert-node')
const validator = require('validator')

// 1. a. Database Connection
//    Enter your database information here
const pool = mysql.createPool({ // Enter your Information
    host: 'localhost',          // Hostname 'localhost'
    user: 'root',               // Username 'root'
    password: '2712',           // Password '1234'
    database: 'labcheckin'      // Database is the schema name you chose 'YourSchema'
})

function getConnection() {
    return pool
  }

//+++++++++++ ADMIN +++++++++++++++++++++++++++

// Route to display all students
router.get("/displayAllStudents", (req, res) => {

    const queryString = "SELECT * FROM students"
  
    getConnection().query(queryString, (err, rows, fields) => {
      
      // If error occures 
      if(err) {
        console.log("Failed to query for users: " + err)
        res.sendStatus(500)
        return
      } 
      
      if(rows) {
         console.log("We fetched Students successfully")
         let obj = {print: rows}
         res.render('../views/pages/data', obj)

      }

    })
})

// Route to display all instructors
router.get("/displayAllInstructors", (req, res) => {

  const queryString = "SELECT * FROM instructors"

  getConnection().query(queryString, (err, rows, fields) => {
    
    // If error occures 
    if(err) {
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
      return
    } 
    
    if(rows) {
       console.log("We fetched Students successfully")
        let obj = {print: rows}
        res.render('../views/pages/data', obj)
    }

  })
})

// Route to display all students under an instructor
router.get("/underInstructor", (req, res) => {
  const search_id = req.query.search_id
  const queryString = "SELECT instructors.room, concat(instructors.firstName, ' ', instructors.lastname) as Instructor, " +
                      "instructors.checkIn as InstructorCheckIn, concat(students.firstName, ' ', students.lastName) as Student, " +
                      "students.checkIn as StudentCheckIn, students.checkOut as StudentCheckOut " +
                      "FROM instructors " +
                      "INNER JOIN students ON instructors.checkIn < students.checkIn " +
                      "WHERE instructors.room = students.room " +
                      "AND instructors.course = students.course " +
                      "AND instructor_id = ?;";

  getConnection().query(queryString, [search_id], (err, rows, fields) => {
    
    // If error occures 
    if(err) {
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
    } 
    
    if(rows) {
       console.log("We fetched Students successfully")
       let obj = {print: rows}
       res.render('../views/pages/instructorStudentData', obj)
       //res.json(rows);
    }

  })
})

// Route to search by id
router.get("/searchById", (req, res) => {

  const search_id = req.query.search_id
  console.log(search_id)
  queryString = `SELECT * FROM students WHERE student_id = ?`

  getConnection().query(queryString, [search_id], (err, rows, fields) => {
    
    // If error occures 
    if(err) {
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
      return
    } 
    
    if(rows) {
      console.log(rows)
       console.log("We fetched Students successfully")
       let obj = {print: rows}
        res.render('../views/pages/data', obj)
    }

  })
})

//+++++++++++++++++++ INSTRUCTOR & STUDENTS +++++++++++++++++++++++++++
// Checking In/Out users
router.post("/checkin", (req, res) => {

  backURL = req.header('Referer') || '/'

  const id = req.body.create_id

 if(validator.isInt(id)) {

    const id = req.body.create_id
    const firstName = req.body.create_first_name
    const lastName = req.body.create_last_name
    const course = req.body.create_course
    const campus = req.body.create_campus
    const building = req.body.create_building
    const room = req.body.create_room

    // Checking Student In
    if(req.body.person === "Student" && req.body.checkInOut === "checkIn") {
      queryString = "INSERT INTO students ( student_id ,firstName, lastName, course, campus, building, room) VALUES(?, ?, ?, ?, ?, ?, ?)"

      getConnection().query(queryString, [id, firstName, lastName, course, campus, building, room], (err, rows, fields) => {
        // If error occures 
        if(err) {
          console.log("Failed to check in new user: " + err)
          res.sendStatus(500)
          return
        }
        console.log("Checked in new user with id: ", id)
        alert('SUCCESS')
      })
    }

    // Checking Student Out
    else if(req.body.person === "Student" && req.body.checkInOut === "checkOut") {

      queryString = "UPDATE students " +
                    "SET isCheckout = 1 " +
                    "WHERE student_id = ? " +
                    "AND isCheckout = 0;"

      getConnection().query(queryString, [id], (err, rows, fields) => {
        // If error occures 
        if(err) {
          console.log("Failed to check out new user: " + err)
          res.sendStatus(404).send("Never Checked In! Go back!")
          return
        }
        console.log("Checked out user with id: ", id)
        alert('SUCCESS')
      })
    }

    // Checking Instructor In
    else if(req.body.person === "Instructor" && req.body.checkInOut === "checkIn") {
      queryString = "INSERT INTO instructors ( instructor_id ,firstName, lastName, course, campus, building, room) VALUES(?, ?, ?, ?, ?, ?, ?)"

      getConnection().query(queryString, [id, firstName, lastName, course, campus, building, room], (err, rows, fields) => {
        // If error occures 
        if(err) {
          ErrorHandling(err, 'in')
          return
        }
        console.log("Checked in new user with id: ", id)
        alert('SUCCESS')
      })
    }

    // Checking Instructor Out
    else if(req.body.person === "Instructor" && req.body.checkInOut === "checkOut") {
      queryString = "UPDATE instructors " +
                    "SET isCheckout = 1 " +
                    "WHERE instructor_id = ? " +
                    "AND isCheckout = 0;"

      getConnection().query(queryString, [id], (err, rows, fields) => {
        // If error occures 
        if(err) {
          ErrorHandling(err, 'out')
          return
        }
        console.log("Checked out user with id: ", id)
        alert('SUCCESS')

      })
    }

    // redirect back
    res.redirect('/')
  } else {
    res.redirect('/')
    alert('Something Went Wrong Try Again! ID must be numerical!')
  }
})


// Login for admin area
router.post("/login", (req, res) => {

  const username = req.body.userName
  const password = req.body.passWord

  queryString = "SELECT username, password FROM admin WHERE username = ? AND password = ?"

      getConnection().query(queryString, [username, password], (err, rows, fields) => {
        // If error occures 
        if(err) {
          console.log("Failed to check in new user: " + err)
          res.sendStatus(500)
          return
        }
        if(rows.length > 0) {
          if(rows) {
            res.redirect('/A928947D03432M0274I902848N');
         } 
        }
        else {
          alert("Wrong Credentials! \n Try Again");
        }
      })
})


function ErrorHandling(err, word) { 
  console.log(`Failed to check ${word} new user: ` + err)
  res.sendStatus(500)
}

module.exports = router