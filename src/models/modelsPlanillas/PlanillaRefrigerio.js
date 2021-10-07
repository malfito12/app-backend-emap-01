const mongoose = require('../../database')
const REFRIGERIOSHCEMA = {
    itemEmp: String,
    CIEmp: String,
    fullName: String,
    cargoEmp: String,
    diasTrabajado: String,
    pagoPorDia: String,
    totalServicio: String,
    RC_IVA: String,
    RC_IVA_presentado: String,
    totalDescuento: String,
    totalGanado: String,
    otrosDescuentos: String,
    liquidoPagable: String,
    //----------------------------
    id_bio: String,
    buscarFechaInicio: String,
    buscarFechaFinal: String,
    typePlanilla: String,
    //-----------------------------
}
const REFRIGERIO = mongoose.model('planillarefrigerio', REFRIGERIOSHCEMA)
module.exports = REFRIGERIO