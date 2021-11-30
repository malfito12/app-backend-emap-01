const mongoose=require('../database')
const DEPARTAMENTSCHEMA={
    idDepartament:String,
    nameDepartament:{type:String,require:true,trim:true,unique:true}
}
const DEPARTAMENT=mongoose.model('departament', DEPARTAMENTSCHEMA)
module.exports=DEPARTAMENT