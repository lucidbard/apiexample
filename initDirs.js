const fs = require("fs");

let students = JSON.parse(fs.readFileSync('./students.json'))
console.log(students)
for(student of students) {
  console.log(student)
  let studentString  = {
    name: student,
    contacts: []
  }
  if(!fs.existsSync(`./data/${student.toLowerCase()}`)) {
    fs.writeFileSync(`./data/${student.toLowerCase()}.json`, JSON.stringify(studentString))
  }
}