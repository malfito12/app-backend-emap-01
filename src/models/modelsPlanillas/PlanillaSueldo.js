const mongoose=require('../../database')
const SUELDOSCHEMA={
    numItem:String,
    CIEmp:String,
    nameEmp:String,
    nacionality:String,
    sexoEmp:String,
    cargoEmp:String,
    fechaIng:String,
    haber_basico:String,
    diasTrabajados:String,
    sueldo:String,
    bonoDeAntiguedad:String,
    bonoRecargaNoc:String,
    interinato:String,
    numDominical:String,
    domingosFeriados:String,
    totalGanado:String,
//----------------------------------------
    atrasos:String,
    faltas:String,
    sancionFaltasAtrasos:String,
    bajaMedica:String,
    AFP:String,
    RC_IVA:String,
    sind:String,
    totalDescuento:String,
//---------------------------------------
    liquidoPagable:String,
//---------------------------------------
    id_bio:String,
    buscarFechaInicio:String,
    buscarFechaFinal:String,
    typePlanilla:String,
//---------------------------------------
    auxTotalGanado:String,
    auxTotalDescuento:String,
    auxLiquidoPagable:String,

}

const SUELDO=mongoose.model('planillasueldo',SUELDOSCHEMA)
module.exports=SUELDO