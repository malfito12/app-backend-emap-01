const express=require('express')
const cors=require('cors')
const app=express()
const path=require('path')

//setting
app.set('port',process.env.PORT|| 8000);

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}))

//routes
app.use('/api', require('./routes/users'))
// app.use('/api', require('./routes/asistencias'))

module.exports=app