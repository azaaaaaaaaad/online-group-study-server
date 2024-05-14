const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
const corsOption = {
    origin: ['http://localhost:5173', 'https://group-study-server-henna.vercel.app', 'https://online-group-study-5cb94.web.app'],
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOption));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdffxhb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        const featuresCollection = client.db('GroupStudy').collection('feature')
        const assignmentsCollection = client.db('GroupStudy').collection('assignments')
        const assignmentsSubmission = client.db('GroupStudy').collection('assignments-submission')


        //get features to homepage from db
        app.get('/feature', async (req, res) => {
            const result = await featuresCollection.find().toArray()
            res.send(result)
        })


        //save assignments in db
        app.post('/assignments', async (req, res) => {
            const assignment = req.body
            const result = await assignmentsCollection.insertOne(assignment)
            res.send(result)
        })
        //get assignments from db
        app.get('/assignments', async (req, res) => {
            const result = await assignmentsCollection.find().toArray();
            res.send(result)
        })

        //get individual assignment from db
        app.get('/assignments/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await assignmentsCollection.findOne(query);
            res.send(result)
        })

        //delete individual assignment from db
        app.delete('/assignments/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await assignmentsCollection.deleteOne(query);
            res.send(result)
        })

        //update individual assignment from db
        app.put('/assignments/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const assignment = req.body;
            const options = { upsert: true }
            const updatedAssignment = {
                $set: {
                    title: assignment.title,
                    description: assignment.description,
                    marks: assignment.marks,
                    photo: assignment.photo,
                    difficultyLevel: assignment.difficultyLevel,
                    date: assignment.date,
                }
            }

            const result = await assignmentsCollection.updateOne(filter, updatedAssignment, options)
            res.send(result)
        })

        //save assignments submission in db
        app.post('/assignments-submission', async (req, res) => {
            const submission = req.body
            const result = await assignmentsSubmission.insertOne(submission)
            res.send(result)
        })

        //get all submitted assignment from db

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Online group study began')
})

app.listen(port, () => {
    console.log(`Online group study began at ${port} `);
})