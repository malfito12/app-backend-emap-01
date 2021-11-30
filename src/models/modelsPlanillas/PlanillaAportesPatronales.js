const mongoose=require('../../database')
const APORTESSCHEMA={
    itemEmp:String,
    ciEmp:String,
    fullName:String,
    cargo:String,
    totalGanado:String,
    ssu:String,
    bajasMedicas:String,
    riesgoProfesion:String,
    aporteSolidario:String,
    proVivienda:String,
    provisionAguinaldo:String,
    previsionIndeminiz:String,
    total:String,
}
const APORTE=mongoose.model('aportes',APORTESSCHEMA)
module.exports=APORTE