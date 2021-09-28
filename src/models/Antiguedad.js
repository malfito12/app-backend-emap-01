const mongoose=require('../database')
const ANTIGUEDADSCHEMA={
    cod:{
        type:Number,
        require:true,
        trim:true,
        unique:true
    },
    inicio:Number,
    fin:Number,
    porcentaje:Number,
}
// const ANTIGUEDAD=mongoose.model('antiguedad', ANTIGUEDADSCHEMA)
const ANTIGUEDAD=mongoose.model('antiguedad', ANTIGUEDADSCHEMA)
module.exports=ANTIGUEDAD