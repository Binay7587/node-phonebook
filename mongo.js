const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://Binay7587:${password}@cluster0.2xmuohq.mongodb.net/phonebook-db?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected')

    if (process.argv.length === 3) {
      Person.find({}).then(result => {
        console.log('-----------------------------------------------')
        console.log('phonebook:')
        console.log('-----------------------------------------------')
        result.forEach(p => {
          console.log(`${p.name} ${p.number}`)
        })
        console.log('-----------------------------------------------')
        mongoose.connection.close()
      })
    } else if (process.argv.length === 5) {
      const name = process.argv[3]
      const number = process.argv[4]

      const person = new Person(
        {
          'name': name,
          'number': number
        }
      )
      person.save().then(() => {
        mongoose.connection.close()
        console.log(`added ${name} number ${number} to phonebook`)
      })
    } else {
      console.log('1) Please provide the password as an argument to get the list of contact: node mongo.js <password>')
      console.log('2) Please provide the password, name and number as an argument to store the contact: node mongo.js <password> <name> <number>')
      process.exit(1)
    }
  })
  .catch((err) => console.log(err))