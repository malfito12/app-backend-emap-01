const mongoose=require('../../database')
const MOVIMIENTOSCHEMA={
    id_bio:String,
    itemEmp:String,
    firstNameEmp:String,
    lastNameEmpP:String,
    lastNameEmpM:String,
    cargoEmp:String,
    departamentEmp:String,
    estadoEmp:String,
    fechaMovimiento:String,
}
const MOVIMIENTO=mongoose.model('movimientos',MOVIMIENTOSCHEMA)
module.exports=MOVIMIENTO