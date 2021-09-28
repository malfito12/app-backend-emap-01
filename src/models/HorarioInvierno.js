const mongoose=require('../database')
const HORARIOINVSCHEMA={
    id_bio:String,
    fecha:String,
    hora:String,
    typoHorario:String,
}
const HORARIOINV=mongoose.model('horarioinv',HORARIOINVSCHEMA)
module.exports=HORARIOINV