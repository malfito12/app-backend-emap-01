const mongoose = require('../database')
const KARDEXSCHEMA = {
    id_bio: String,
    fecha: String,
    dia: String,
    ingreso1: String,
    atraso1:String,
    salida1: String,
    ingreso2: String,
    atraso2:String,
    salida2: String,
    observaciones: String,

    horasExtra:String,
    horasTrabajadas:String,
    diaTrabajo:String,
    faltas:String,
}
const KARDEX= mongoose.model('kardexemp',KARDEXSCHEMA)
module.exports=KARDEX