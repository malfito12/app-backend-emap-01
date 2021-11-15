var mongoose = require('../database')
var HORARIOSCHEMA = {
    descripcion: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    observaciones: String,
    cod: String,
    tolerancia: Number,
    ingreso1: String,
    salida1: String,
    ingreso2: String,
    salida2: String,
    tipoHorario: String,
    feriado: String,
    orden: String,
    est: String,

    // id_bio:Number,
    // firstNameEmp:String,
    // descripcion:String,
    // observaciones:String,
    // tolerancia:Number,
    // ingreso1:String,
    // salida1:String,
    // ingreso2:String,
    // salida2:String,
    // tipoHorario:String,
    // // feriado:String,
    // // orden:String,
    // est:String,

    // fechaini:String,
    // fechafin:String,
}
const HORARIO = mongoose.model('Horario', HORARIOSCHEMA)
module.exports = HORARIO