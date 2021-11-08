var mongoose=require('../database')
var CARGOSCHEMA={
    // idEmp:String,
    // id_bio:String,
    // nameCargo:String,
    // firstNameEmp:String,
    // lastNameEmpP:String,
    // lastNameEmpM:String,
    // cod_cargo:Number,
    // des_cargo:String,
    // t_perma:String,
    // haber_b:Number,
    // nivel:Number,
    // estado:String,
    // gestion:Number,

    // departameneto:String,
    cod_cargo:{
        type:String,
        require:true,
        trim:true,
        unique:true
    },
    nameCargo:{
        type:String,
        require:true,
        trim:true,
        unique:true
    },
    cod_dep:String,
    nameDepartament:String,
    haber_basico:String,


}

const CARGO=mongoose.model('cargos', CARGOSCHEMA);
module.exports=CARGO;
