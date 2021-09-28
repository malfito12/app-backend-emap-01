const mongoose=require('../../database')
const KARDEXASISTENCIASCHEMA={
    id_bio:String,
    fecha:String,
    dia:String,
    ingreso1:String,
    salida1:String,
    ingreso2:String,
    salida2:String,
    atraso:String,
    horasExtra:String,
    horasDeTrabajo:String,
    diaTrabajado:String,
    faltas:String,
    observaciones:String,
}
const KARDEXASISTENCIA=mongoose.model('kardexasistencia',KARDEXASISTENCIASCHEMA)
module.exports=KARDEXASISTENCIA