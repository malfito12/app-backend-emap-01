const mongoose=require('../database')
const PERMISOSCHEMA={
    id_bio:String,
    firstNameEmp:String,
    lastNameEmpP:String,
    lastNameEmpM:String,
    CIEmp:String,
    tipoPermiso:String,
    namePermiso:String,
    fechaPermisoIni:String,
    fechaPermisoFin:String
}
const PERMISO=mongoose.model('permisos', PERMISOSCHEMA)
module.exports=PERMISO