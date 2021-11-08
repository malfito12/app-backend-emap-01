const mongoose=require('../../database')
const ALTASYBAJASSCHEMA={
    id_bio:String,
    firstNameEmp:String,
    lastNameEmpP:String,
    lastNameEmpM:String,
    estadoEmp:String,
    fechaAltasBajas:String,
}
const ALTASYBAJAS=mongoose.model('altasybajas',ALTASYBAJASSCHEMA)
module.exports=ALTASYBAJAS