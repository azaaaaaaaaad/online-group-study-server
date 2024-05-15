const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
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
app.use(cookieParser())

//verify jwt middleware
// const verifyToken = (req, res, next) => {
//     console.log('im middleware');
//     if (!token) {
//         return res.status(401).send({ message: 'unauthorize access' })
//     }
//     const token = req.cookies.token
//     if (token) {
//         jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(401).send({ message: 'unauthorize access' })
//                 //return
//             }
//             console.log(decoded);
//             req.user = decoded
//             next()
//         })
//     }
// }


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

        //jwt
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '7d'
            })
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

            }).send({ success: true })
        })

        //clear token
        app.get('/logout', async (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 0

            }).send({ success: true })
        })


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
        app.get('/assignments-submission', async (req, res) => {
            const result = await assignmentsSubmission.find().toArray()
            res.send(result)
        })

        //get all submitted assignment via specific email from db
        app.get('/assignments-submission/:email', async (req, res) => {  
            const token = req.cookies.token      
            console.log(token);
            const email = req.params.email;
            const query = { 'email': email }
            const result = await assignmentsSubmission.find(query).toArray()
            res.send(result)
        })










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