const mongoose=require('../database')
const DEPARTAMENTSCHEMA={
    cod_dep:{
        type:String,
        require:true,
        trim:true,
        unique:true
    },
    nameDepartament:String,
}
const DEPARTAMENT=mongoose.model('departament', DEPARTAMENTSCHEMA)
module.exports=DEPARTAMENT