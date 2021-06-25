const mongoose=require('../database')
const FERIADOSCHEMA={
    nameFeriado:String,
    tipoFeriado:Number,
    fechaFeriadoIni:String,
    fechaFeriadoFin:String
}
const FERIADO=mongoose.model('feriados',FERIADOSCHEMA)
module.exports=FERIADO