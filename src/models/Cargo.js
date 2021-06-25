var mongoose=require('../database')
var CARGOSCHEMA={
    idEmp:String,
    id_bio:String,
    nameCargo:String,
    firstNameEmp:String,
    lastNameEmpP:String,
    lastNameEmpM:String,
    cod_cargo:Number,
    des_cargo:String,
    t_perma:String,
    haber_b:Number,
    nivel:Number,
    estado:String,
    gestion:Number
}

const CARGO=mongoose.model('cargos', CARGOSCHEMA);
module.exports=CARGO;
