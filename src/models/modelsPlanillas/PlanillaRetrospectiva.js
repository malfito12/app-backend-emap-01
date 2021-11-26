const mongoose=require('../../database')
const RETROSCHEMA={
    year:String,
    porcentaje:String,
    descripcion:String
}
const RETRO=mongoose.model('retrospectivas',RETROSCHEMA)
module.exports=RETRO