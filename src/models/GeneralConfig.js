const mongoose=require('../database')
const GENERALCONFIGSCHEMA={
    recargaNocturna:String,
    interinato:String,
    AFP:String,
    RCIVA:String,
    IUE:String,
    IT:String,
    salarioMinimo:String,
    bonoTeRefrigerio:String,
    valorAfiliacion:String,
    gestion:String,
    estado:String,
    teEventual:String,
}
const GENERALCONFIG=mongoose.model('generalconfig', GENERALCONFIGSCHEMA)
module.exports=GENERALCONFIG