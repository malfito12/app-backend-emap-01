const mongoose = require('../../database')
const RETROSCHEMA = {
    id_bio: String,
    numItem: String,
    ci: String,
    fullName: String,
    nameCargo: String,
    diasTrab: String,
    haberAnterior: String,
    haberActual: String,
    incremento: String,
    totalGanadoPorDia: String,
    bonoAntiguedad: String,
    recargaNocturna: String,
    interinato: String,
    totalGanado: String,
    afps: String,
    totalDescuento: String,
    liquidoPagable: String,
    mes: String,
    year: String
}
const RETRO = mongoose.model('retrospectivas', RETROSCHEMA)
module.exports = RETRO