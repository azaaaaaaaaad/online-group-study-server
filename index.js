const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
const corsOption= {
    origin: ['http://localhost:5173'],
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOption));
app.use(express.json());

app.get('/', (req,res)=> {
    res.send('Online group study began')
})

app.listen(port, ()=> {
    console.log(`Online group study began at ${port} `);
})