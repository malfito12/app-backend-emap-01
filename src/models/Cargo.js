var mongoose=require('../database')
var CARGOSCHEMA={
    idCargo:String,
    idDepartament:String,
    nameCargo:{type:String,require:true,trim:true,unique:true},
    nameDepartament:String,
    haber_basico:String,


}

const CARGO=mongoose.model('cargos', CARGOSCHEMA);
module.exports=CARGO;
