const mongoose=require('../database')
const ASIGSCHEMA={
    id_bio:Number,
    firstNameEmp:String,
    lastNameEmpP:String,
    lastNameEmpM:String,
    descripcion:String,
    tipoHorario:String,
    tolerancia:Number,
    ingreso1:String,
    salida1:String,
    ingreso2:String,
    salida2:String,
    fechaini:String,
    fechafin:String
}
const ASIGHRS=mongoose.model('asighorario',ASIGSCHEMA)
module.exports=ASIGHRS