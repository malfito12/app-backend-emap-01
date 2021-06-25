const mongoose=require('../database');
const ASISSCHEMA={
    id_bio:String,
    fecha:String,
    hora:String
}

const ASIS=mongoose.model('asistencia', ASISSCHEMA);
module.exports=ASIS;