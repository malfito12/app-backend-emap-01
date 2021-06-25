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
app.use(express.static(path.join(__dirname,'empleadoimages')))

//routes
app.use('/api', require('./routes/users'))
app.use('/api', require('./routes/cargos'))
app.use('/api', require('./routes/empleados'))
app.use('/api', require('./routes/horarios'))
app.use('/api', require('./routes/horariosAsig'))
app.use('/api', require('./routes/permisos'))
app.use('/api', require('./routes/feriados'))
app.use('/api', require('./routes/asistencias'))

module.exports=app