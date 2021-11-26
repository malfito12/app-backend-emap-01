const mongoose=require('../../database')
const SERVICIOSSHEMA={
    id_bio:String,
    firstNameEmp:String,
    lastNameEmpP:String,
    lastNameEmpM:String,
    typeAntiguedad:String,
    fechaini:String,
}
const SERVICE=mongoose.model('servicios',SERVICIOSSHEMA)
module.exports=SERVICE