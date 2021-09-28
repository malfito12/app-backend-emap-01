const mongoose=require('../../database')
const CONTHRSSCHEMA={
    type:Boolean
}
const CONTHRS=mongoose.model("conthorarios",CONTHRSSCHEMA)
module.exports=CONTHRS