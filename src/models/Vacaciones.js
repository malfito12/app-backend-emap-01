const mongoose=require('../database')
const VACACIONSCHEMA={
    id_bio:String,
    firstNameEmp:String,
    lastNameEmpP:String,
    lastNameEmpM:String,
    CIEmp:String,
    tipoVacacion:String,
    nameVacaciones:String,
    diasOtorgados:String,
    diasGastados:String,
    fechaVacacionIni:String,
    fechaVacacionFin:String
}
const VACACION= mongoose.model('vacaciones',VACACIONSCHEMA)
module.exports=VACACION