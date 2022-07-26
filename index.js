const express = require('express');
const cors = require('cors')
// Morgan is a middleware that logs requests
const morgan = require('morgan');

const app = express();

app.use(cors())
app.use(express.json())
// Using morgan tiny format to log all requests
// app.use(morgan('tiny'))

// Using morgan custom token format to log all requests including full body
morgan.token("data", (req, res) => { 
    return req.method === "POST" ? JSON.stringify(req.body) : " "
});
app.use(morgan(":method :url :status :res[content-length] - :response-time ms - :data"));

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

// Request to get the total number of persons in the phonebook
app.get('/info', (request, response) => {
    const current_timestamp = new Date()
    const info = `<p>Phonebook has info for ${persons.length} people</p>
    <p>${current_timestamp}</p>`
    response.send(info)
})

// Request to get all persons from the phonebook
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

// Request to get the person details with the given id
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.statusMessage = "Person doesn't exist!";
        response.status(404).end()
    }
})

// Request to delete an existing person
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.statusMessage = "Person deleted!";
    response.status(204).end()
})

// Function to generate a unique id
const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId + 1
}

// Request to create a new person
app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    const nameCheck = persons.find((p) => p.name === body.name);
    if (nameCheck) {
        return response.status(400).json({
            error: "name must be unique"
        });
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})