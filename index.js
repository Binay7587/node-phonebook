const express = require('express');
const cors = require('cors')
const app = express();
require('dotenv').config()
const Person = require('./models/person')
// Morgan is a middleware that logs requests
const morgan = require('morgan');

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
// Using morgan tiny format to log all requests
// app.use(morgan('tiny'))

// Using morgan custom token format to log all requests including full body
morgan.token("data", (req, res) => {
    return req.method === "POST" ? JSON.stringify(req.body) : " "
});
app.use(morgan(":method :url :status :res[content-length] - :response-time ms - :data"));

// Request to get the total number of persons in the phonebook
app.get('/info', (request, response) => {
    Person.find({})
        .then((people) => {
            const current_timestamp = new Date()
            const info = `<p>Phonebook has info for ${people.length} people</p>
        <p>${current_timestamp}</p>`
            response.send(info)
        })
        .catch((error) => next(error));
})

// Request to get all persons from the phonebook
app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

// Request to get the person details with the given id
app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then((person) => {
            person ? response.json(person) : response.status(404).end();
        })
        .catch((error) => next(error));
})

// Request to delete an existing person
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch((error) => next(error));
})

// Request to create a new person
app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body
    if (name === undefined) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (number === undefined) { 
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person({ name, number });

    person.save().then(result => {
        response.json(result)
    }).catch((error) => next(error));
})

// Request to update an existing person
app.put("/api/persons/:id", (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' },
    )
        .then((updatedPerson) => {
            response.json(updatedPerson);
        })
        .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
// handler of requests with unknown endpoints
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
    next(error)
  }
// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})