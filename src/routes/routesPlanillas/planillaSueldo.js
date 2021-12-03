const express = require('express')
const router = express.Router()
const PLANILLASUELDO = require('../../models/modelsPlanillas/PlanillaSueldo')
const EMPLEADO = require('../../models/Empleado')
const GENERALDATE = require('../../models/GeneralConfig')
const moment = require('moment')
const ASIS = require('../../models/Asistencia')
const PERMISO = require('../../models/Permiso')
const FERIADO = require('../../models/Feriado')
const DEPARTAMENTO = require('../../models/Departament')
const KARDEXASISTENCIA = require('../../models/modelsPlanillas/KardexAsistencia')
const ANTIGUEDAD = require('../../models/Antiguedad')
const CONFIG = require('../../models/GeneralConfig')

// router.get('/planillasueldo', async (req, res) => {
//     const planilla = await SUELDO.find()
//     res.status(200).json(planilla)
// })

router.get('/pre-planillasueldo', async (req, res) => {
    // const params = req.params.id
    // const diaini = req.query.fechaini
    // const diafin = req.query.fechafin
    const mes = req.query.mes
    const year = req.query.year
    const planilla = req.query.typePlanilla

    var diaini;
    var diafin;

    switch (mes) {
        case "ENERO":
            diaini = moment(`${year}-01-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-02-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "FEBRERO":
            diaini = moment(`${year}-02-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-03-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "MARZO":
            diaini = moment(`${year}-03-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-04-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "ABRIL":
            diaini = moment(`${year}-04-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-05-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "MAYO":
            diaini = moment(`${year}-05-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-06-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "JUNIO":
            diaini = moment(`${year}-06-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-07-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "JULIO":
            diaini = moment(`${year}-07-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-08-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "AGOSTO":
            diaini = moment(`${year}-08-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-09-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "SEPTIEMBRE":
            diaini = moment(`${year}-09-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-10-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "OCTUBRE":
            diaini = moment(`${year}-10-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-11-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "NOVIEMBRE":
            diaini = moment(`${year}-11-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-12-01`).subtract(1, 'day').format("YYYY-MM-DD")
            break;
        case "DICIEMBRE":
            diaini = moment(`${year}-12-01`).format("YYYY-MM-DD")
            diafin = moment(`${year}-12-31`).format("YYYY-MM-DD")
            break;
        default:
            console.log('no existe el mes')
    }
    // var aux=moment(diaini).add(1,'day').format("YYYY-MM-DD")
    // console.log(aux)
    // console.log(diaini)
    // console.log(diafin)
    // console.log(planilla)
    const departamento = await DEPARTAMENTO.find().sort({ cod_dep: 1 })
    const contDepartamento = departamento.length

    const antiguedad = await ANTIGUEDAD.find()
    const contAntiguedad = antiguedad.length

    const configGeneral = await CONFIG.find({ estado: 'A' }).sort({ gestion: -1 }).limit(1)
    const salarioMinimo = parseFloat(configGeneral[0].salarioMinimo)
    const bonoRecNoc = parseFloat(configGeneral[0].recargaNocturna)
    const afp = parseFloat(configGeneral[0].AFP)
    const sindicato = parseFloat(configGeneral[0].valorAfiliacion)
    // console.log(salarioMinimo2)
    // console.log(bonoRecNoc)


    var array = []
    // for (var a = 0; a < contDepartamento; a++) {
    //     console.log('entra')
    // const getDepartament = departamento[a].nameDepartament
    // const empleado = await EMPLEADO.find({ "$and": [{ estadoEmp: 'activo' }, { departamentEmp: getDepartament }] })
    if (planilla === 'permanente') {
        // const empleado = await EMPLEADO.find({ "$and": [{ estadoEmp: 'activo' }, { typeContrato: planilla }] })
        const empleado = await EMPLEADO.find({ "$and": [{ typeContrato: planilla }] })
        const contEmp = empleado.length
        for (var i = 0; i < contEmp; i++) {
            const marcaciones = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: { $gte: diaini } }, { fecha: { $lte: diafin } }] })
            if (marcaciones.length > 0) {
                //si tiene marcaciones este mes
                if (empleado[i].fechaini <= diaini && empleado[i].fechafin >= diafin) {
                    //--------------1 del mes al 31 del mes-------------------------------------------------
                    var fullname = empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM
                    //------busqueda de fechas ----------------------
                    var buscarFechaIni = new Date(diaini)
                    var buscarFechaFin = new Date(diafin)
                    var buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var contDias = 0
                    const contarDias = (buscarFechaIni, dias) => {
                        buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                        return buscarFechaIni
                    }
                    while (buscarFechaIni <= buscarFechaFin) {
                        contarDias(buscarFechaIni, 1)
                        contDias++
                    }
                    //SUMA DIAS DE TRABAJO------------------------------
                    var codHorario = empleado[i].cod_horario
                    codHorario = codHorario.split("")
                    arrayDiasTrabajo = []
                    if (codHorario[0] === '1') {
                        arrayDiasTrabajo.push('lunes')
                    }
                    if (codHorario[1] === '1') {
                        arrayDiasTrabajo.push('martes')
                    }
                    if (codHorario[2] === '1') {
                        arrayDiasTrabajo.push('miércoles')
                    }
                    if (codHorario[3] === '1') {
                        arrayDiasTrabajo.push('jueves')
                    }
                    if (codHorario[4] === '1') {
                        arrayDiasTrabajo.push('viernes')
                    }
                    if (codHorario[5] === '1') {
                        arrayDiasTrabajo.push('sábado')
                    }
                    if (codHorario[6] === '1') {
                        arrayDiasTrabajo.push('domingo')
                    }
                    var sum = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(kardexDia)
                        if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                            if (kardexDia.length > 0) {
                                var aux = kardexDia[0].diaTrabajado
                                // console.log(aux)
                                // aux = aux.split(".")
                                aux = parseFloat(aux)
                                sum = sum + aux
                                //----------------------FALTAS-------------
                                var aux2 = kardexDia[0].faltas
                                aux2 = parseFloat(aux2)
                                // aux2=parseInt(aux2[0])
                                sumFaltas = sumFaltas + aux2
                            } else {
                                console.log('no existe el kaxdex de asistencia de la fecha')
                            }
                        } else {
                            sum = sum + 1
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')

                    }
                    if (sum >= 28) { sum = 30 }

                    //--------------SUELDOS-----------------------
                    var sueldos = parseFloat(empleado[i].haber_basico)
                    sueldos = (sueldos / 30) * sum

                    //--BONO ANTIGUEDAD-------------------------
                    var bonoAntiguedad = 0;
                    // var salarioMinimo=2164 //arreglar esto, tiene que venir de CONFIGURACION GENEREAL <<<------
                    for (var k = 0; k < contAntiguedad; k++) {
                        var cambio = (antiguedad[k].cod).toString()
                        // console.log(cambio)
                        if (cambio === empleado[i].typeAntiguedad) {
                            bonoAntiguedad = salarioMinimo * 3
                            bonoAntiguedad = (bonoAntiguedad * antiguedad[k].porcentaje) / 100
                        }
                    }

                    //---------------BONO RECARGA NOCTURNA----------------------
                    var calculoRecNoc;
                    if (empleado[i].cod_estH === '2') {
                        //hacer calculos de bono recarga nocturna
                        const haberBasico = parseFloat(empleado[i].haber_basico)
                        calculoRecNoc = haberBasico * bonoRecNoc
                    } else {
                        //no hacer nada
                        calculoRecNoc = 0
                    }

                    //---------------INTERINATO-------------------------------
                    //-----------DOMINICAL----------------------------

                    var contDominical = 0
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    for (var k = 0; k < contDias; k++) {
                        var feriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        if (feriado.length > 0 || nameDay === 'domingo') {
                            const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                            if (dominical.length > 0) {
                                contDominical++;
                            }
                        }
                        // else if(nameDay==='domingo'){
                        //     const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        //     if (dominical.length > 0) {
                        //         contDominical++;
                        //     }
                        // }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    //---------------DOMINGOS FERIADOS----------------------
                    var contHorasDominical = 0
                    for (var m = 0; m < contDominical; m++) {
                        contHorasDominical += 4
                    }
                    var calculosDominical = parseFloat(empleado[i].haber_basico) / 30
                    calculosDominical = ((calculosDominical / 8) * contHorasDominical) * 2
                    // calculosDominical = calculosDominical * contHorasDominical
                    // calculosDominical = calculosDominical * 2

                    //---------------GANADO TOTAL---------------------------
                    // console.log(typeof bonoAntiguedad)
                    // console.log(typeof sueldos)
                    // console.log(typeof calculosDominical)
                    // console.log(typeof calculoRecNoc)
                    const totalIngreso = sueldos + bonoAntiguedad + calculoRecNoc + calculosDominical

                    //-------------------ATRASO-----------------------
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var sumAtraso = moment(`1990-01-01 00:00:00`)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        if (kardexDia.length > 0) {
                            var atraso = kardexDia[0].atraso
                            atraso = atraso.split(":")
                            sumAtraso = moment(sumAtraso).add(parseInt(atraso[0]), 'h').add(parseInt(atraso[1]), 'm').add(parseInt(atraso[2]), 's')
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    sumAtraso = moment(sumAtraso).format("HH:mm:ss")
                    var numAtraso = 0;
                    var minutos = moment.duration(sumAtraso).asMinutes()
                    // console.log(minutos)
                    if (minutos > 30 && minutos <= 45) {
                        numAtraso = 0.5
                    }
                    else if (minutos > 45 && minutos <= 60) {
                        numAtraso = 1
                    }
                    else if (minutos > 60 && minutos <= 75) {
                        numAtraso = 2
                    }
                    else if (minutos > 75 && minutos <= 100) {
                        numAtraso = 3
                    }
                    else if (minutos > 100 && minutos <= 150) {
                        numAtraso = 4
                    } else if (minutos > 150) {
                        numAtraso = 5
                    }

                    //--------------------FALTAS------------------
                    //EL CALCULO SE ESTA REALIZANDO CON LOS DIAS DDE TRABAJO

                    //--------------------SANCION FALTAS Y ATRASOS-----------------
                    var sancionAtraso = 0, sancionFaltas = 0;
                    if (numAtraso > 0) {
                        sancionAtraso = ((parseFloat(empleado[i].haber_basico)) / 30) * numAtraso
                    }
                    if (sumFaltas > 0) {
                        sancionFaltas = (((parseFloat(empleado[i].haber_basico)) / 30) * sumFaltas) * 2
                    }
                    const sancionTotal = sancionAtraso + sancionFaltas

                    //----------------BAJA MEDICA-------------

                    //-------------AFP-----------------------------
                    var descuentoAFP;
                    if (empleado[i].cotizante === '1') {
                        descuentoAFP = ((afp / 100).toFixed(4)) * totalIngreso
                        // console.log(descuentoAFP)
                    } else {
                        descuentoAFP = 0.11 * totalIngreso
                    }
                    //----------------RC-IVA--------------------------
                    var descuentoRCIVA = 0
                    //----------------SINDICATO--------------------
                    var descuentoSindicato = 0;
                    if (empleado[i].afilSindicato === 'si') {
                        descuentoSindicato = sindicato
                    }

                    //---------------TOTAL DESCUENTO---------------------------
                    const totalDesc = sancionTotal + descuentoAFP + descuentoRCIVA + descuentoSindicato
                    //---------------LIQUIDO PAGABLE--------------------------
                    var totalLiquido = totalIngreso - totalDesc
                    if (totalLiquido < 0) {
                        totalLiquido = 0
                    }
                    //------------------------------------------
                    array.push({
                        numItem: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        nameEmp: fullname,
                        cotizante: empleado[i].cotizante,
                        nacionality: empleado[i].nacionalityEmp,
                        sexoEmp: empleado[i].sexoEmp,
                        cargoEmp: empleado[i].cargoEmp,
                        departamentEmp: empleado[i].departamentEmp,
                        fechaIng: empleado[i].fechaini,
                        haber_basico: empleado[i].haber_basico,
                        diasTrabajados: sum,
                        sueldo: sueldos.toFixed(2),
                        bonoDeAntiguedad: bonoAntiguedad,
                        bonoRecargaNoc: calculoRecNoc.toFixed(2),
                        interinato: (0).toFixed(2),
                        numDominical: contDominical.toFixed(2),
                        domingosFeriados: calculosDominical.toFixed(2),
                        totalGanado: totalIngreso.toFixed(2),
                        atrasos: numAtraso.toFixed(2),
                        faltas: sumFaltas.toFixed(2),
                        sancionFaltasAtrasos: sancionTotal.toFixed(2),
                        bajaMedica: (0).toFixed(2),
                        AFP: descuentoAFP.toFixed(2),
                        RC_IVA: descuentoRCIVA.toFixed(2),
                        sind: descuentoSindicato.toFixed(2),
                        totalDescuento: totalDesc.toFixed(2),
                        liquidoPagable: totalLiquido.toFixed(2),
                        //---------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                        //--------------------------------------
                        auxTotalGanado: totalIngreso.toFixed(2),
                        auxTotalDescuento: totalDesc.toFixed(2),
                        auxLiquidoPagable: totalLiquido.toFixed(2),
                    })

                } else if (empleado[i].fechaini >= diaini && empleado[i].fechafin >= diafin) {
                    //---------------------------del 15 del mes al 31 de mes--------------------------------------
                    var fullname = empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM
                    //------BUSQUEDA DE FECHAS------------------
                    var buscarFechaIni = new Date(empleado[i].fechaini)
                    var buscarFechaFin = new Date(diafin)
                    var buscarFechaAux = moment(empleado[i].fechaini).format("YYYY-MM-DD")
                    var contDias = 0
                    const contarDias = (buscarFechaIni, dias) => {
                        buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                        return buscarFechaIni
                    }
                    while (buscarFechaIni <= buscarFechaFin) {
                        contarDias(buscarFechaIni, 1)
                        contDias++
                    }
                    // console.log(contDias)
                    //----SUMA DIAS DE TRABAJO------------------------------
                    var codHorario = empleado[i].cod_horario
                    codHorario = codHorario.split("")
                    arrayDiasTrabajo = []
                    if (codHorario[0] === '1') {
                        arrayDiasTrabajo.push('lunes')
                    }
                    if (codHorario[1] === '1') {
                        arrayDiasTrabajo.push('martes')
                    }
                    if (codHorario[2] === '1') {
                        arrayDiasTrabajo.push('miércoles')
                    }
                    if (codHorario[3] === '1') {
                        arrayDiasTrabajo.push('jueves')
                    }
                    if (codHorario[4] === '1') {
                        arrayDiasTrabajo.push('viernes')
                    }
                    if (codHorario[5] === '1') {
                        arrayDiasTrabajo.push('sábado')
                    }
                    if (codHorario[6] === '1') {
                        arrayDiasTrabajo.push('domingo')
                    }
                    var sum = 0;
                    var sumFaltas = 0;
                    // console.log(empleado[i].id_bio)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        // console.log(buscarFechaAux)
                        // console.log(kardexDia)
                        if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                            if (kardexDia.length > 0) {
                                var aux = kardexDia[0].diaTrabajado
                                // console.log(aux)
                                // aux = aux.split(".")
                                aux = parseFloat(aux)
                                sum = sum + aux
                                //----------------------FALTAS-------------
                                var aux2 = kardexDia[0].faltas
                                aux2 = parseFloat(aux2)
                                // aux2=parseInt(aux2[0])
                                sumFaltas = sumFaltas + aux2
                            } else {
                                console.log('no existe el kaxdex de asistencia de la fecha en la tabla kardex asistencia')
                            }
                        } else {
                            sum = sum + 1
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')

                    }
                    if (sum >= 28) { sum = 30 }

                    //-------------SUELDOS-----------------
                    var sueldos = parseFloat(empleado[i].haber_basico)
                    sueldos = (sueldos / 30) * sum

                    //--BONO ANTIGUEDAD-------------------------
                    var bonoAntiguedad = 0;
                    // var salarioMinimo=2164 //arreglar esto, tiene que venir de CONFIGURACION GENEREAL <<<------
                    for (var k = 0; k < contAntiguedad; k++) {
                        var cambio = (antiguedad[k].cod).toString()
                        // console.log(cambio)
                        if (cambio === empleado[i].typeAntiguedad) {
                            bonoAntiguedad = salarioMinimo * 3
                            bonoAntiguedad = (bonoAntiguedad * antiguedad[k].porcentaje) / 100
                        }
                    }

                    //---------------BONO RECARGA NOCTURNA----------------------
                    var calculoRecNoc;
                    if (empleado[i].cod_estH === '2') {
                        //hacer calculos de bono recarga nocturna
                        const haberBasico = parseFloat(empleado[i].haber_basico)
                        calculoRecNoc = haberBasico * bonoRecNoc
                    } else {
                        //no hacer nada
                        calculoRecNoc = 0
                    }

                    //---------------INTERINATO-------------------------------
                    //-----------DOMINICAL----------------------------

                    var contDominical = 0
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    for (var k = 0; k < contDias; k++) {
                        var feriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        if (feriado.length > 0 || nameDay === 'domingo') {
                            const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                            if (dominical.length > 0) {
                                contDominical++;
                            }
                        }
                        // else if(nameDay==='domingo'){
                        //     const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        //     if (dominical.length > 0) {
                        //         contDominical++;
                        //     }
                        // }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    //---------------DOMINGOS FERIADOS----------------------
                    var contHorasDominical = 0
                    for (var m = 0; m < contDominical; m++) {
                        contHorasDominical += 4
                    }
                    var calculosDominical = parseFloat(empleado[i].haber_basico) / 30
                    calculosDominical = ((calculosDominical / 8) * contHorasDominical) * 2
                    // calculosDominical = calculosDominical * contHorasDominical
                    // calculosDominical = calculosDominical * 2

                    //---------------GANADO TOTAL---------------------------
                    // console.log(typeof bonoAntiguedad)
                    // console.log(typeof sueldos)
                    // console.log(typeof calculosDominical)
                    // console.log(typeof calculoRecNoc)
                    const totalIngreso = sueldos + bonoAntiguedad + calculoRecNoc + calculosDominical

                    //-------------------ATRASO-----------------------
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var sumAtraso = moment(`1990-01-01 00:00:00`)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        if (kardexDia.length > 0) {
                            var atraso = kardexDia[0].atraso
                            atraso = atraso.split(":")
                            sumAtraso = moment(sumAtraso).add(parseInt(atraso[0]), 'h').add(parseInt(atraso[1]), 'm').add(parseInt(atraso[2]), 's')
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    sumAtraso = moment(sumAtraso).format("HH:mm:ss")
                    var numAtraso = 0;
                    var minutos = moment.duration(sumAtraso).asMinutes()
                    // console.log(minutos)
                    if (minutos > 30 && minutos <= 45) {
                        numAtraso = 0.5
                    }
                    else if (minutos > 45 && minutos <= 60) {
                        numAtraso = 1
                    }
                    else if (minutos > 60 && minutos <= 75) {
                        numAtraso = 2
                    }
                    else if (minutos > 75 && minutos <= 100) {
                        numAtraso = 3
                    }
                    else if (minutos > 100 && minutos <= 150) {
                        numAtraso = 4
                    } else if (minutos > 150) {
                        numAtraso = 5
                    }

                    //--------------------FALTAS------------------
                    //EL CALCULO SE ESTA REALIZANDO CON LOS DIAS DDE TRABAJO

                    //--------------------SANCION FALTAS Y ATRASOS-----------------
                    var sancionAtraso = 0, sancionFaltas = 0;
                    if (numAtraso > 0) {
                        sancionAtraso = ((parseFloat(empleado[i].haber_basico)) / 30) * numAtraso
                    }
                    if (sumFaltas > 0) {
                        sancionFaltas = (((parseFloat(empleado[i].haber_basico)) / 30) * sumFaltas) * 2
                    }
                    const sancionTotal = sancionAtraso + sancionFaltas

                    //----------------BAJA MEDICA-------------

                    //-------------AFP-----------------------------
                    var descuentoAFP;
                    if (empleado[i].cotizante === '1') {
                        descuentoAFP = ((afp / 100).toFixed(4)) * totalIngreso
                        // console.log(descuentoAFP)
                    } else {
                        descuentoAFP = 0.11 * totalIngreso
                    }
                    //----------------RC-IVA--------------------------
                    var descuentoRCIVA = 0
                    //----------------SINDICATO--------------------
                    var descuentoSindicato = 0;
                    if (empleado[i].afilSindicato === 'si') {
                        descuentoSindicato = sindicato
                    }
                    //---------------TOTAL DESCUENTO---------------------------
                    const totalDesc = sancionTotal + descuentoAFP + descuentoRCIVA + descuentoSindicato
                    //---------------LIQUIDO PAGABLE--------------------------
                    var totalLiquido = totalIngreso - totalDesc
                    if (totalLiquido < 0) {
                        totalLiquido = 0
                    }
                    //------------------------------------------
                    array.push({
                        numItem: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        nameEmp: fullname,
                        nacionality: empleado[i].nacionalityEmp,
                        sexoEmp: empleado[i].sexoEmp,
                        cotizante: empleado[i].cotizante,
                        cargoEmp: empleado[i].cargoEmp,
                        departamentEmp: empleado[i].departamentEmp,
                        fechaIng: empleado[i].fechaini,
                        haber_basico: empleado[i].haber_basico,
                        diasTrabajados: sum,
                        sueldo: sueldos.toFixed(2),
                        bonoDeAntiguedad: bonoAntiguedad,
                        bonoRecargaNoc: calculoRecNoc.toFixed(2),
                        interinato: (0).toFixed(2),
                        numDominical: contDominical.toFixed(2),
                        domingosFeriados: calculosDominical.toFixed(2),
                        totalGanado: totalIngreso.toFixed(2),
                        atrasos: numAtraso.toFixed(2),
                        faltas: sumFaltas.toFixed(2),
                        sancionFaltasAtrasos: sancionTotal.toFixed(2),
                        bajaMedica: (0).toFixed(2),
                        AFP: descuentoAFP.toFixed(2),
                        RC_IVA: descuentoRCIVA.toFixed(2),
                        sind: descuentoSindicato.toFixed(2),
                        totalDescuento: totalDesc.toFixed(2),
                        liquidoPagable: totalLiquido.toFixed(2),
                        //---------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                        //--------------------------------------
                        auxTotalGanado: totalIngreso.toFixed(2),
                        auxTotalDescuento: totalDesc.toFixed(2),
                        auxLiquidoPagable: totalLiquido.toFixed(2),
                    })

                } else if (empleado[i].fechaini <= diaini && empleado[i].fechafin <= diafin) {
                    //------------------------------ del 1 del mes al 15 del mes---------------------------------------------------
                    var fullname = empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM
                    //------BUSQUEDA DE FECHAS-------------------
                    var buscarFechaIni = new Date(diaini)
                    var buscarFechaFin = new Date(empleado[i].fechafin)
                    var buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var contDias = 0
                    const contarDias = (buscarFechaIni, dias) => {
                        buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                        return buscarFechaIni
                    }
                    while (buscarFechaIni <= buscarFechaFin) {
                        contarDias(buscarFechaIni, 1)
                        contDias++
                    }
                    //----SUMA DIAS DE TRABAJO------------------------------
                    var codHorario = empleado[i].cod_horario
                    codHorario = codHorario.split("")
                    arrayDiasTrabajo = []
                    if (codHorario[0] === '1') {
                        arrayDiasTrabajo.push('lunes')
                    }
                    if (codHorario[1] === '1') {
                        arrayDiasTrabajo.push('martes')
                    }
                    if (codHorario[2] === '1') {
                        arrayDiasTrabajo.push('miércoles')
                    }
                    if (codHorario[3] === '1') {
                        arrayDiasTrabajo.push('jueves')
                    }
                    if (codHorario[4] === '1') {
                        arrayDiasTrabajo.push('viernes')
                    }
                    if (codHorario[5] === '1') {
                        arrayDiasTrabajo.push('sábado')
                    }
                    if (codHorario[6] === '1') {
                        arrayDiasTrabajo.push('domingo')
                    }
                    var sum = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(kardexDia)
                        if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                            if (kardexDia.length > 0) {
                                var aux = kardexDia[0].diaTrabajado
                                // console.log(aux)
                                // aux = aux.split(".")
                                aux = parseFloat(aux)
                                sum = sum + aux
                                //----------------------FALTAS-------------
                                var aux2 = kardexDia[0].faltas
                                aux2 = parseFloat(aux2)
                                // aux2=parseInt(aux2[0])
                                sumFaltas = sumFaltas + aux2
                            } else {
                                console.log('no existe el kaxdex de asistencia de la fecha')
                            }
                        } else {
                            sum = sum + 1
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')

                    }
                    if (sum >= 28) { sum = 30 }

                    //--------------SUELDOS-----------------------
                    var sueldos = parseFloat(empleado[i].haber_basico)
                    sueldos = (sueldos / 30) * sum

                    //--BONO ANTIGUEDAD-------------------------
                    var bonoAntiguedad = 0;
                    // var salarioMinimo=2164 //arreglar esto, tiene que venir de CONFIGURACION GENEREAL <<<------
                    for (var k = 0; k < contAntiguedad; k++) {
                        var cambio = (antiguedad[k].cod).toString()
                        // console.log(cambio)
                        if (cambio === empleado[i].typeAntiguedad) {
                            bonoAntiguedad = salarioMinimo * 3
                            bonoAntiguedad = (bonoAntiguedad * antiguedad[k].porcentaje) / 100
                        }
                    }

                    //---------------BONO RECARGA NOCTURNA----------------------
                    var calculoRecNoc;
                    if (empleado[i].cod_estH === '2') {
                        //hacer calculos de bono recarga nocturna
                        const haberBasico = parseFloat(empleado[i].haber_basico)
                        calculoRecNoc = haberBasico * bonoRecNoc
                    } else {
                        //no hacer nada
                        calculoRecNoc = 0
                    }

                    //---------------INTERINATO-------------------------------
                    //-----------DOMINICAL----------------------------

                    var contDominical = 0
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    for (var k = 0; k < contDias; k++) {
                        var feriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        if (feriado.length > 0 || nameDay === 'domingo') {
                            const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                            if (dominical.length > 0) {
                                contDominical++;
                            }
                        }
                        // else if(nameDay==='domingo'){
                        //     const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        //     if (dominical.length > 0) {
                        //         contDominical++;
                        //     }
                        // }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    //---------------DOMINGOS FERIADOS----------------------
                    var contHorasDominical = 0
                    for (var m = 0; m < contDominical; m++) {
                        contHorasDominical += 4
                    }
                    var calculosDominical = parseFloat(empleado[i].haber_basico) / 30
                    calculosDominical = ((calculosDominical / 8) * contHorasDominical) * 2
                    // calculosDominical = calculosDominical * contHorasDominical
                    // calculosDominical = calculosDominical * 2

                    //---------------GANADO TOTAL---------------------------
                    // console.log(typeof bonoAntiguedad)
                    // console.log(typeof sueldos)
                    // console.log(typeof calculosDominical)
                    // console.log(typeof calculoRecNoc)
                    const totalIngreso = sueldos + bonoAntiguedad + calculoRecNoc + calculosDominical

                    //-------------------ATRASO-----------------------
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var sumAtraso = moment(`1990-01-01 00:00:00`)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        if (kardexDia.length > 0) {
                            var atraso = kardexDia[0].atraso
                            atraso = atraso.split(":")
                            sumAtraso = moment(sumAtraso).add(parseInt(atraso[0]), 'h').add(parseInt(atraso[1]), 'm').add(parseInt(atraso[2]), 's')
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    sumAtraso = moment(sumAtraso).format("HH:mm:ss")
                    var numAtraso = 0;
                    var minutos = moment.duration(sumAtraso).asMinutes()
                    // console.log(minutos)
                    if (minutos > 30 && minutos <= 45) {
                        numAtraso = 0.5
                    }
                    else if (minutos > 45 && minutos <= 60) {
                        numAtraso = 1
                    }
                    else if (minutos > 60 && minutos <= 75) {
                        numAtraso = 2
                    }
                    else if (minutos > 75 && minutos <= 100) {
                        numAtraso = 3
                    }
                    else if (minutos > 100 && minutos <= 150) {
                        numAtraso = 4
                    } else if (minutos > 150) {
                        numAtraso = 5
                    }

                    //--------------------FALTAS------------------
                    //EL CALCULO SE ESTA REALIZANDO CON LOS DIAS DDE TRABAJO

                    //--------------------SANCION FALTAS Y ATRASOS-----------------
                    var sancionAtraso = 0, sancionFaltas = 0;
                    if (numAtraso > 0) {
                        sancionAtraso = ((parseFloat(empleado[i].haber_basico)) / 30) * numAtraso
                    }
                    if (sumFaltas > 0) {
                        sancionFaltas = (((parseFloat(empleado[i].haber_basico)) / 30) * sumFaltas) * 2
                    }
                    const sancionTotal = sancionAtraso + sancionFaltas

                    //----------------BAJA MEDICA-------------

                    //-------------AFP-----------------------------
                    var descuentoAFP;
                    if (empleado[i].cotizante === '1') {
                        descuentoAFP = ((afp / 100).toFixed(4)) * totalIngreso
                        // console.log(descuentoAFP)
                    } else {
                        descuentoAFP = 0.11 * totalIngreso
                    }
                    //----------------RC-IVA--------------------------
                    var descuentoRCIVA = 0
                    //----------------SINDICATO--------------------
                    var descuentoSindicato = 0;
                    if (empleado[i].afilSindicato === 'si') {
                        descuentoSindicato = sindicato
                    }

                    //---------------TOTAL DESCUENTO---------------------------
                    const totalDesc = sancionTotal + descuentoAFP + descuentoRCIVA + descuentoSindicato
                    //---------------LIQUIDO PAGABLE--------------------------
                    var totalLiquido = totalIngreso - totalDesc
                    if (totalLiquido < 0) {
                        totalLiquido = 0
                    }
                    //------------------------------------------
                    array.push({
                        numItem: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        nameEmp: fullname,
                        nacionality: empleado[i].nacionalityEmp,
                        cotizante: empleado[i].cotizante,
                        sexoEmp: empleado[i].sexoEmp,
                        cargoEmp: empleado[i].cargoEmp,
                        departamentEmp: empleado[i].departamentEmp,
                        fechaIng: empleado[i].fechaini,
                        haber_basico: empleado[i].haber_basico,
                        diasTrabajados: sum,
                        sueldo: sueldos.toFixed(2),
                        bonoDeAntiguedad: bonoAntiguedad,
                        bonoRecargaNoc: calculoRecNoc.toFixed(2),
                        interinato: (0).toFixed(2),
                        numDominical: contDominical.toFixed(2),
                        domingosFeriados: calculosDominical.toFixed(2),
                        totalGanado: totalIngreso.toFixed(2),
                        atrasos: numAtraso.toFixed(2),
                        faltas: sumFaltas.toFixed(2),
                        sancionFaltasAtrasos: sancionTotal.toFixed(2),
                        bajaMedica: (0).toFixed(2),
                        AFP: descuentoAFP.toFixed(2),
                        RC_IVA: descuentoRCIVA.toFixed(2),
                        sind: descuentoSindicato.toFixed(2),
                        totalDescuento: totalDesc.toFixed(2),
                        liquidoPagable: totalLiquido.toFixed(2),
                        //---------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                        //--------------------------------------
                        auxTotalGanado: totalIngreso.toFixed(2),
                        auxTotalDescuento: totalDesc.toFixed(2),
                        auxLiquidoPagable: totalLiquido.toFixed(2),
                    })

                } else if (empleado[i].fechaini >= diaini && empleado[i].fechafin <= diafin) {
                    //calcular solo los dias de su contrato ejm 15 del mes al 25 del mes
                    var fullname = empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM
                    //------BUSQUEDA DE FECHAS------------------
                    var buscarFechaIni = new Date(empleado[i].fechaini)
                    var buscarFechaFin = new Date(empleado[i].fechafin)
                    var buscarFechaAux = moment(empleado[i].fechaini).format("YYYY-MM-DD")
                    var contDias = 0
                    const contarDias = (buscarFechaIni, dias) => {
                        buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                        return buscarFechaIni
                    }
                    while (buscarFechaIni <= buscarFechaFin) {
                        contarDias(buscarFechaIni, 1)
                        contDias++
                    }
                    //----SUMA DIAS DE TRABAJO------------------------------
                    var codHorario = empleado[i].cod_horario
                    codHorario = codHorario.split("")
                    arrayDiasTrabajo = []
                    if (codHorario[0] === '1') {
                        arrayDiasTrabajo.push('lunes')
                    }
                    if (codHorario[1] === '1') {
                        arrayDiasTrabajo.push('martes')
                    }
                    if (codHorario[2] === '1') {
                        arrayDiasTrabajo.push('miércoles')
                    }
                    if (codHorario[3] === '1') {
                        arrayDiasTrabajo.push('jueves')
                    }
                    if (codHorario[4] === '1') {
                        arrayDiasTrabajo.push('viernes')
                    }
                    if (codHorario[5] === '1') {
                        arrayDiasTrabajo.push('sábado')
                    }
                    if (codHorario[6] === '1') {
                        arrayDiasTrabajo.push('domingo')
                    }
                    var sum = 0;
                    var sumFaltas = 0;
                    // console.log(empleado[i].id_bio)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        // console.log(buscarFechaAux)
                        // console.log(kardexDia)
                        if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                            if (kardexDia.length > 0) {
                                var aux = kardexDia[0].diaTrabajado
                                // console.log(aux)
                                // aux = aux.split(".")
                                aux = parseFloat(aux)
                                sum = sum + aux
                                //----------------------FALTAS-------------
                                var aux2 = kardexDia[0].faltas
                                aux2 = parseFloat(aux2)
                                // aux2=parseInt(aux2[0])
                                sumFaltas = sumFaltas + aux2
                            } else {
                                console.log('no existe el kaxdex de asistencia de la fecha en la tabla kardex asistencia')
                            }
                        } else {
                            sum = sum + 1
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')

                    }
                    if (sum >= 28) { sum = 30 }

                    //-------------SUELDOS-----------------
                    var sueldos = parseFloat(empleado[i].haber_basico)
                    sueldos = (sueldos / 30) * sum

                    //--BONO ANTIGUEDAD-------------------------
                    var bonoAntiguedad = 0;
                    // var salarioMinimo=2164 //arreglar esto, tiene que venir de CONFIGURACION GENEREAL <<<------
                    for (var k = 0; k < contAntiguedad; k++) {
                        var cambio = (antiguedad[k].cod).toString()
                        // console.log(cambio)
                        if (cambio === empleado[i].typeAntiguedad) {
                            bonoAntiguedad = salarioMinimo * 3
                            bonoAntiguedad = (bonoAntiguedad * antiguedad[k].porcentaje) / 100
                        }
                    }
                    //---------------BONO RECARGA NOCTURNA----------------------
                    var calculoRecNoc;
                    if (empleado[i].cod_estH === '2') {
                        //hacer calculos de bono recarga nocturna
                        const haberBasico = parseFloat(empleado[i].haber_basico)
                        calculoRecNoc = haberBasico * bonoRecNoc
                    } else {
                        //no hacer nada
                        calculoRecNoc = 0
                    }
                    //---------------INTERINATO-------------------------------
                    //-----------DOMINICAL----------------------------

                    var contDominical = 0
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    for (var k = 0; k < contDias; k++) {
                        var feriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        if (feriado.length > 0 || nameDay === 'domingo') {
                            const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                            if (dominical.length > 0) {
                                contDominical++;
                            }
                        }
                        // else if(nameDay==='domingo'){
                        //     const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        //     if (dominical.length > 0) {
                        //         contDominical++;
                        //     }
                        // }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    //---------------DOMINGOS FERIADOS----------------------
                    var contHorasDominical = 0
                    for (var m = 0; m < contDominical; m++) {
                        contHorasDominical += 4
                    }
                    var calculosDominical = parseFloat(empleado[i].haber_basico) / 30
                    calculosDominical = ((calculosDominical / 8) * contHorasDominical) * 2
                    // calculosDominical = calculosDominical * contHorasDominical
                    // calculosDominical = calculosDominical * 2

                    //---------------GANADO TOTAL---------------------------
                    // console.log(typeof bonoAntiguedad)
                    // console.log(typeof sueldos)
                    // console.log(typeof calculosDominical)
                    // console.log(typeof calculoRecNoc)
                    const totalIngreso = sueldos + bonoAntiguedad + calculoRecNoc + calculosDominical

                    //-------------------ATRASO-----------------------
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var sumAtraso = moment(`1990-01-01 00:00:00`)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        if (kardexDia.length > 0) {
                            var atraso = kardexDia[0].atraso
                            atraso = atraso.split(":")
                            sumAtraso = moment(sumAtraso).add(parseInt(atraso[0]), 'h').add(parseInt(atraso[1]), 'm').add(parseInt(atraso[2]), 's')
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    sumAtraso = moment(sumAtraso).format("HH:mm:ss")
                    var numAtraso = 0;
                    var minutos = moment.duration(sumAtraso).asMinutes()
                    // console.log(minutos)
                    if (minutos > 30 && minutos <= 45) {
                        numAtraso = 0.5
                    }
                    else if (minutos > 45 && minutos <= 60) {
                        numAtraso = 1
                    }
                    else if (minutos > 60 && minutos <= 75) {
                        numAtraso = 2
                    }
                    else if (minutos > 75 && minutos <= 100) {
                        numAtraso = 3
                    }
                    else if (minutos > 100 && minutos <= 150) {
                        numAtraso = 4
                    } else if (minutos > 150) {
                        numAtraso = 5
                    }
                    //--------------------FALTAS------------------
                    //EL CALCULO SE ESTA REALIZANDO CON LOS DIAS DDE TRABAJO

                    //--------------------SANCION FALTAS Y ATRASOS-----------------
                    var sancionAtraso = 0, sancionFaltas = 0;
                    if (numAtraso > 0) {
                        sancionAtraso = ((parseFloat(empleado[i].haber_basico)) / 30) * numAtraso
                    }
                    if (sumFaltas > 0) {
                        sancionFaltas = (((parseFloat(empleado[i].haber_basico)) / 30) * sumFaltas) * 2
                    }
                    const sancionTotal = sancionAtraso + sancionFaltas

                    //----------------BAJA MEDICA-------------

                    //-------------AFP-----------------------------
                    var descuentoAFP;
                    if (empleado[i].cotizante === '1') {
                        descuentoAFP = ((afp / 100).toFixed(4)) * totalIngreso
                        // console.log(descuentoAFP)
                    } else {
                        descuentoAFP = 0.11 * totalIngreso
                    }
                    //----------------RC-IVA--------------------------
                    var descuentoRCIVA = 0
                    //----------------SINDICATO--------------------
                    var descuentoSindicato = 0;
                    if (empleado[i].afilSindicato === 'si') {
                        descuentoSindicato = sindicato
                    }
                    //---------------TOTAL DESCUENTO---------------------------
                    const totalDesc = sancionTotal + descuentoAFP + descuentoRCIVA + descuentoSindicato
                    //---------------LIQUIDO PAGABLE--------------------------
                    var totalLiquido = totalIngreso - totalDesc
                    if (totalLiquido < 0) {
                        totalLiquido = 0
                    }
                    //------------------------------------------
                    array.push({
                        numItem: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        nameEmp: fullname,
                        cotizante: empleado[i].cotizante,
                        nacionality: empleado[i].nacionalityEmp,
                        sexoEmp: empleado[i].sexoEmp,
                        cargoEmp: empleado[i].cargoEmp,
                        departamentEmp: empleado[i].departamentEmp,
                        fechaIng: empleado[i].fechaini,
                        haber_basico: empleado[i].haber_basico,
                        diasTrabajados: sum,
                        sueldo: sueldos.toFixed(2),
                        bonoDeAntiguedad: bonoAntiguedad,
                        bonoRecargaNoc: calculoRecNoc.toFixed(2),
                        interinato: (0).toFixed(2),
                        numDominical: contDominical.toFixed(2),
                        domingosFeriados: calculosDominical.toFixed(2),
                        totalGanado: totalIngreso.toFixed(2),
                        atrasos: numAtraso.toFixed(2),
                        faltas: sumFaltas.toFixed(2),
                        sancionFaltasAtrasos: sancionTotal.toFixed(2),
                        bajaMedica: (0).toFixed(2),
                        AFP: descuentoAFP.toFixed(2),
                        RC_IVA: descuentoRCIVA.toFixed(2),
                        sind: descuentoSindicato.toFixed(2),
                        totalDescuento: totalDesc.toFixed(2),
                        liquidoPagable: totalLiquido.toFixed(2),
                        //---------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                        //--------------------------------------
                        auxTotalGanado: totalIngreso.toFixed(2),
                        auxTotalDescuento: totalDesc.toFixed(2),
                        auxLiquidoPagable: totalLiquido.toFixed(2),
                    })
                }
            } else {
                //no tiene marcaciones este mes
                console.log("no tiene marcaciones en el mes buscado")
            }
        }
    } else if (planilla === 'eventual') {
        // const empleado = await EMPLEADO.find({ "$and": [{ estadoEmp: 'activo' }, { typeContrato: planilla }] })
        const empleado = await EMPLEADO.find({ "$and": [{ typeContrato: planilla }] })
        const contEmp = empleado.length
        for (var i = 0; i < contEmp; i++) {
            const marcaciones = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: { $gte: diaini } }, { fecha: { $lte: diafin } }] })
            if (marcaciones.length > 0) {
                //si existe maracaciones este mes

                if (empleado[i].fechaini <= diaini && empleado[i].fechafin >= diafin) {
                    //--------------1 del mes al 31 del mes-------------------------------------------------
                    var fullname = empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM
                    //------busqueda de fechas ----------------------
                    var buscarFechaIni = new Date(diaini)
                    var buscarFechaFin = new Date(diafin)
                    var buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var contDias = 0
                    const contarDias = (buscarFechaIni, dias) => {
                        buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                        return buscarFechaIni
                    }
                    while (buscarFechaIni <= buscarFechaFin) {
                        contarDias(buscarFechaIni, 1)
                        contDias++
                    }
                    //SUMA DIAS DE TRABAJO------------------------------
                    var codHorario = empleado[i].cod_horario
                    codHorario = codHorario.split("")
                    arrayDiasTrabajo = []
                    if (codHorario[0] === '1') {
                        arrayDiasTrabajo.push('lunes')
                    }
                    if (codHorario[1] === '1') {
                        arrayDiasTrabajo.push('martes')
                    }
                    if (codHorario[2] === '1') {
                        arrayDiasTrabajo.push('miércoles')
                    }
                    if (codHorario[3] === '1') {
                        arrayDiasTrabajo.push('jueves')
                    }
                    if (codHorario[4] === '1') {
                        arrayDiasTrabajo.push('viernes')
                    }
                    if (codHorario[5] === '1') {
                        arrayDiasTrabajo.push('sábado')
                    }
                    if (codHorario[6] === '1') {
                        arrayDiasTrabajo.push('domingo')
                    }
                    var sum = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(kardexDia)
                        if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                            if (kardexDia.length > 0) {
                                var aux = kardexDia[0].diaTrabajado
                                // console.log(aux)
                                // aux = aux.split(".")
                                aux = parseFloat(aux)
                                sum = sum + aux
                                //----------------------FALTAS-------------
                                var aux2 = kardexDia[0].faltas
                                aux2 = parseFloat(aux2)
                                // aux2=parseInt(aux2[0])
                                sumFaltas = sumFaltas + aux2
                            } else {
                                console.log('no existe el kaxdex de asistencia de la fecha')
                            }
                        } else {
                            sum = sum + 1
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')

                    }
                    if (sum >= 28) { sum = 30 }

                    //--------------SUELDOS-----------------------
                    var sueldos = parseFloat(empleado[i].haber_basico)
                    sueldos = (sueldos / 30) * sum

                    //--BONO ANTIGUEDAD-------------------------
                    //NO EXISTE


                    //---------------BONO RECARGA NOCTURNA----------------------
                    var calculoRecNoc;
                    if (empleado[i].cod_estH === '2') {
                        //hacer calculos de bono recarga nocturna
                        const haberBasico = parseFloat(empleado[i].haber_basico)
                        calculoRecNoc = haberBasico * bonoRecNoc
                    } else {
                        //no hacer nada
                        calculoRecNoc = 0
                    }

                    //---------------INTERINATO-------------------------------
                    //NO EXISTE

                    //-----------DOMINICAL----------------------------
                    var contDominical = 0
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    for (var k = 0; k < contDias; k++) {
                        var feriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        if (feriado.length > 0 || nameDay === 'domingo') {
                            const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                            if (dominical.length > 0) {
                                contDominical++;
                            }
                        }
                        // else if(nameDay==='domingo'){
                        //     const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        //     if (dominical.length > 0) {
                        //         contDominical++;
                        //     }
                        // }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    //---------------DOMINGOS FERIADOS----------------------
                    // var contHorasDominical = 0
                    // for (var m = 0; m < contDominical; m++) {
                    //     contHorasDominical += 4
                    // }
                    var calculosDominical = contDominical * 50

                    //---------------GANADO TOTAL---------------------------
                    // console.log(typeof bonoAntiguedad)
                    // console.log(typeof sueldos)
                    // console.log(typeof calculosDominical)
                    // console.log(typeof calculoRecNoc)
                    const totalIngreso = sueldos + calculoRecNoc + calculosDominical

                    //-------------------ATRASO-----------------------
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var sumAtraso = moment(`1990-01-01 00:00:00`)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        if (kardexDia.length > 0) {
                            var atraso = kardexDia[0].atraso
                            atraso = atraso.split(":")
                            sumAtraso = moment(sumAtraso).add(parseInt(atraso[0]), 'h').add(parseInt(atraso[1]), 'm').add(parseInt(atraso[2]), 's')
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    sumAtraso = moment(sumAtraso).format("HH:mm:ss")
                    var numAtraso = 0;
                    var minutos = moment.duration(sumAtraso).asMinutes()
                    // console.log(minutos)
                    if (minutos > 30 && minutos <= 45) {
                        numAtraso = 0.5
                    }
                    else if (minutos > 45 && minutos <= 60) {
                        numAtraso = 1
                    }
                    else if (minutos > 60 && minutos <= 75) {
                        numAtraso = 2
                    }
                    else if (minutos > 75 && minutos <= 100) {
                        numAtraso = 3
                    }
                    else if (minutos > 100 && minutos <= 150) {
                        numAtraso = 4
                    } else if (minutos > 150) {
                        numAtraso = 5
                    }

                    //--------------------FALTAS------------------
                    //EL CALCULO SE ESTA REALIZANDO CON LOS DIAS DDE TRABAJO

                    //--------------------SANCION FALTAS Y ATRASOS-----------------
                    var sancionAtraso = 0, sancionFaltas = 0;
                    if (numAtraso > 0) {
                        sancionAtraso = ((parseFloat(empleado[i].haber_basico)) / 30) * numAtraso
                    }
                    if (sumFaltas > 0) {
                        sancionFaltas = (((parseFloat(empleado[i].haber_basico)) / 30) * sumFaltas) * 2
                    }
                    const sancionTotal = sancionAtraso + sancionFaltas

                    //----------------BAJA MEDICA-------------

                    //-------------AFP-----------------------------
                    var descuentoAFP;
                    if (empleado[i].cotizante === '1') {
                        descuentoAFP = ((afp / 100).toFixed(4)) * totalIngreso
                        // console.log(descuentoAFP)
                    } else {
                        descuentoAFP = 0.11 * totalIngreso
                    }
                    //----------------RC-IVA--------------------------
                    var descuentoRCIVA = 0

                    //----------------SINDICATO--------------------
                    //NO EXISTE

                    //---------------TOTAL DESCUENTO---------------------------
                    const totalDesc = sancionTotal + descuentoAFP + descuentoRCIVA
                    //---------------LIQUIDO PAGABLE--------------------------
                    var totalLiquido = totalIngreso - totalDesc
                    if (totalLiquido < 0) {
                        totalLiquido = 0
                    }
                    //------------------------------------------
                    array.push({
                        numItem: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        nameEmp: fullname,
                        cotizante: empleado[i].cotizante,
                        nacionality: empleado[i].nacionalityEmp,
                        sexoEmp: empleado[i].sexoEmp,
                        cargoEmp: empleado[i].cargoEmp,
                        departamentEmp: empleado[i].departamentEmp,
                        fechaIng: empleado[i].fechaini,
                        haber_basico: empleado[i].haber_basico,
                        diasTrabajados: sum,
                        sueldo: sueldos.toFixed(2),
                        bonoDeAntiguedad: (0).toFixed(2),
                        bonoRecargaNoc: calculoRecNoc.toFixed(2),
                        interinato: (0).toFixed(2),
                        numDominical: contDominical.toFixed(2),
                        domingosFeriados: calculosDominical.toFixed(2),
                        totalGanado: totalIngreso.toFixed(2),
                        atrasos: numAtraso.toFixed(2),
                        faltas: sumFaltas.toFixed(2),
                        sancionFaltasAtrasos: sancionTotal.toFixed(2),
                        bajaMedica: (0).toFixed(2),
                        AFP: descuentoAFP.toFixed(2),
                        RC_IVA: descuentoRCIVA.toFixed(2),
                        sind: (0).toFixed(2),
                        totalDescuento: totalDesc.toFixed(2),
                        liquidoPagable: totalLiquido.toFixed(2),
                        //---------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                        //--------------------------------------
                        auxTotalGanado: totalIngreso.toFixed(2),
                        auxTotalDescuento: totalDesc.toFixed(2),
                        auxLiquidoPagable: totalLiquido.toFixed(2),
                    })

                } else if (empleado[i].fechaini >= diaini && empleado[i].fechafin >= diafin) {
                    //---------------------------del 15 del mes al 31 de mes--------------------------------------
                    var fullname = empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM
                    //------BUSQUEDA DE FECHAS------------------
                    var buscarFechaIni = new Date(empleado[i].fechaini)
                    var buscarFechaFin = new Date(diafin)
                    var buscarFechaAux = moment(empleado[i].fechaini).format("YYYY-MM-DD")
                    var contDias = 0
                    const contarDias = (buscarFechaIni, dias) => {
                        buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                        return buscarFechaIni
                    }
                    while (buscarFechaIni <= buscarFechaFin) {
                        contarDias(buscarFechaIni, 1)
                        contDias++
                    }
                    //----SUMA DIAS DE TRABAJO------------------------------
                    var codHorario = empleado[i].cod_horario
                    codHorario = codHorario.split("")
                    arrayDiasTrabajo = []
                    if (codHorario[0] === '1') {
                        arrayDiasTrabajo.push('lunes')
                    }
                    if (codHorario[1] === '1') {
                        arrayDiasTrabajo.push('martes')
                    }
                    if (codHorario[2] === '1') {
                        arrayDiasTrabajo.push('miércoles')
                    }
                    if (codHorario[3] === '1') {
                        arrayDiasTrabajo.push('jueves')
                    }
                    if (codHorario[4] === '1') {
                        arrayDiasTrabajo.push('viernes')
                    }
                    if (codHorario[5] === '1') {
                        arrayDiasTrabajo.push('sábado')
                    }
                    if (codHorario[6] === '1') {
                        arrayDiasTrabajo.push('domingo')
                    }
                    var sum = 0;
                    var sumFaltas = 0;
                    // console.log(empleado[i].id_bio)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        // console.log(buscarFechaAux)
                        // console.log(kardexDia)
                        if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                            if (kardexDia.length > 0) {
                                var aux = kardexDia[0].diaTrabajado
                                // console.log(aux)
                                // aux = aux.split(".")
                                aux = parseFloat(aux)
                                sum = sum + aux
                                //----------------------FALTAS-------------
                                var aux2 = kardexDia[0].faltas
                                aux2 = parseFloat(aux2)
                                // aux2=parseInt(aux2[0])
                                sumFaltas = sumFaltas + aux2
                            } else {
                                console.log('no existe el kaxdex de asistencia de la fecha en la tabla kardex asistencia')
                            }
                        } else {
                            sum = sum + 1
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')

                    }
                    if (sum >= 28) { sum = 30 }

                    //-------------SUELDOS-----------------
                    var sueldos = parseFloat(empleado[i].haber_basico)
                    sueldos = (sueldos / 30) * sum

                    //--BONO ANTIGUEDAD-------------------------
                    //NO EXISTE

                    //---------------BONO RECARGA NOCTURNA----------------------
                    var calculoRecNoc;
                    if (empleado[i].cod_estH === '2') {
                        //hacer calculos de bono recarga nocturna
                        const haberBasico = parseFloat(empleado[i].haber_basico)
                        calculoRecNoc = haberBasico * bonoRecNoc
                    } else {
                        //no hacer nada
                        calculoRecNoc = 0
                    }

                    //---------------INTERINATO-------------------------------
                    //no existe

                    //-----------DOMINICAL----------------------------

                    var contDominical = 0
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    for (var k = 0; k < contDias; k++) {
                        var feriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        if (feriado.length > 0 || nameDay === 'domingo') {
                            const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                            if (dominical.length > 0) {
                                contDominical++;
                            }
                        }
                        // else if(nameDay==='domingo'){
                        //     const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        //     if (dominical.length > 0) {
                        //         contDominical++;
                        //     }
                        // }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    //---------------DOMINGOS FERIADOS----------------------
                    var calculosDominical = contDominical * 50

                    //---------------GANADO TOTAL---------------------------
                    const totalIngreso = sueldos + calculoRecNoc + calculosDominical

                    //-------------------ATRASO-----------------------
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var sumAtraso = moment(`1990-01-01 00:00:00`)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        if (kardexDia.length > 0) {
                            var atraso = kardexDia[0].atraso
                            atraso = atraso.split(":")
                            sumAtraso = moment(sumAtraso).add(parseInt(atraso[0]), 'h').add(parseInt(atraso[1]), 'm').add(parseInt(atraso[2]), 's')
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    sumAtraso = moment(sumAtraso).format("HH:mm:ss")
                    var numAtraso = 0;
                    var minutos = moment.duration(sumAtraso).asMinutes()
                    // console.log(minutos)
                    if (minutos > 30 && minutos <= 45) {
                        numAtraso = 0.5
                    }
                    else if (minutos > 45 && minutos <= 60) {
                        numAtraso = 1
                    }
                    else if (minutos > 60 && minutos <= 75) {
                        numAtraso = 2
                    }
                    else if (minutos > 75 && minutos <= 100) {
                        numAtraso = 3
                    }
                    else if (minutos > 100 && minutos <= 150) {
                        numAtraso = 4
                    } else if (minutos > 150) {
                        numAtraso = 5
                    }

                    //--------------------FALTAS------------------
                    //EL CALCULO SE ESTA REALIZANDO CON LOS DIAS DDE TRABAJO

                    //--------------------SANCION FALTAS Y ATRASOS-----------------
                    var sancionAtraso = 0, sancionFaltas = 0;
                    if (numAtraso > 0) {
                        sancionAtraso = ((parseFloat(empleado[i].haber_basico)) / 30) * numAtraso
                    }
                    if (sumFaltas > 0) {
                        sancionFaltas = (((parseFloat(empleado[i].haber_basico)) / 30) * sumFaltas) * 2
                    }
                    const sancionTotal = sancionAtraso + sancionFaltas

                    //----------------BAJA MEDICA-------------

                    //-------------AFP-----------------------------
                    var descuentoAFP;
                    if (empleado[i].cotizante === '1') {
                        descuentoAFP = ((afp / 100).toFixed(4)) * totalIngreso
                        // console.log(descuentoAFP)
                    } else {
                        descuentoAFP = 0.11 * totalIngreso
                    }
                    //----------------RC-IVA--------------------------
                    var descuentoRCIVA = 0
                    //----------------SINDICATO--------------------
                    //no existe

                    //---------------TOTAL DESCUENTO---------------------------
                    const totalDesc = sancionTotal + descuentoAFP + descuentoRCIVA
                    //---------------LIQUIDO PAGABLE--------------------------
                    var totalLiquido = totalIngreso - totalDesc
                    if (totalLiquido < 0) {
                        totalLiquido = 0
                    }
                    //------------------------------------------
                    array.push({
                        numItem: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        nameEmp: fullname,
                        cotizante: empleado[i].cotizante,
                        nacionality: empleado[i].nacionalityEmp,
                        sexoEmp: empleado[i].sexoEmp,
                        cargoEmp: empleado[i].cargoEmp,
                        departamentEmp: empleado[i].departamentEmp,
                        fechaIng: empleado[i].fechaini,
                        haber_basico: empleado[i].haber_basico,
                        diasTrabajados: sum,
                        sueldo: sueldos.toFixed(2),
                        bonoDeAntiguedad: (0).toFixed(2),
                        bonoRecargaNoc: calculoRecNoc.toFixed(2),
                        interinato: (0).toFixed(2),
                        numDominical: contDominical.toFixed(2),
                        domingosFeriados: calculosDominical.toFixed(2),
                        totalGanado: totalIngreso.toFixed(2),
                        atrasos: numAtraso.toFixed(2),
                        faltas: sumFaltas.toFixed(2),
                        sancionFaltasAtrasos: sancionTotal.toFixed(2),
                        bajaMedica: (0).toFixed(2),
                        AFP: descuentoAFP.toFixed(2),
                        RC_IVA: descuentoRCIVA.toFixed(2),
                        sind: (0).toFixed(2),
                        totalDescuento: totalDesc.toFixed(2),
                        liquidoPagable: totalLiquido.toFixed(2),
                        //---------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                        //--------------------------------------
                        auxTotalGanado: totalIngreso.toFixed(2),
                        auxTotalDescuento: totalDesc.toFixed(2),
                        auxLiquidoPagable: totalLiquido.toFixed(2),
                    })
                } else if (empleado[i].fechaini <= diaini && empleado[i].fechafin <= diafin) {
                    //------------------------------ del 1 del mes al 15 del mes---------------------------------------------------
                    var fullname = empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM
                    //------BUSQUEDA DE FECHAS-------------------
                    var buscarFechaIni = new Date(diaini)
                    var buscarFechaFin = new Date(empleado[i].fechafin)
                    var buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var contDias = 0
                    const contarDias = (buscarFechaIni, dias) => {
                        buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                        return buscarFechaIni
                    }
                    while (buscarFechaIni <= buscarFechaFin) {
                        contarDias(buscarFechaIni, 1)
                        contDias++
                    }
                    //----SUMA DIAS DE TRABAJO------------------------------
                    var codHorario = empleado[i].cod_horario
                    codHorario = codHorario.split("")
                    arrayDiasTrabajo = []
                    if (codHorario[0] === '1') {
                        arrayDiasTrabajo.push('lunes')
                    }
                    if (codHorario[1] === '1') {
                        arrayDiasTrabajo.push('martes')
                    }
                    if (codHorario[2] === '1') {
                        arrayDiasTrabajo.push('miércoles')
                    }
                    if (codHorario[3] === '1') {
                        arrayDiasTrabajo.push('jueves')
                    }
                    if (codHorario[4] === '1') {
                        arrayDiasTrabajo.push('viernes')
                    }
                    if (codHorario[5] === '1') {
                        arrayDiasTrabajo.push('sábado')
                    }
                    if (codHorario[6] === '1') {
                        arrayDiasTrabajo.push('domingo')
                    }
                    var sum = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(kardexDia)
                        if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                            if (kardexDia.length > 0) {
                                var aux = kardexDia[0].diaTrabajado
                                // console.log(aux)
                                // aux = aux.split(".")
                                aux = parseFloat(aux)
                                sum = sum + aux
                                //----------------------FALTAS-------------
                                var aux2 = kardexDia[0].faltas
                                aux2 = parseFloat(aux2)
                                // aux2=parseInt(aux2[0])
                                sumFaltas = sumFaltas + aux2
                            } else {
                                console.log('no existe el kaxdex de asistencia de la fecha')
                            }
                        } else {
                            sum = sum + 1
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')

                    }
                    if (sum >= 28) { sum = 30 }

                    //--------------SUELDOS-----------------------
                    var sueldos = parseFloat(empleado[i].haber_basico)
                    sueldos = (sueldos / 30) * sum

                    //--BONO ANTIGUEDAD-------------------------
                    //no existe

                    //---------------BONO RECARGA NOCTURNA----------------------
                    var calculoRecNoc;
                    if (empleado[i].cod_estH === '2') {
                        //hacer calculos de bono recarga nocturna
                        const haberBasico = parseFloat(empleado[i].haber_basico)
                        calculoRecNoc = haberBasico * bonoRecNoc
                    } else {
                        //no hacer nada
                        calculoRecNoc = 0
                    }

                    //---------------INTERINATO-------------------------------
                    //no existe

                    //-----------DOMINICAL----------------------------

                    var contDominical = 0
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    for (var k = 0; k < contDias; k++) {
                        var feriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        if (feriado.length > 0 || nameDay === 'domingo') {
                            const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                            if (dominical.length > 0) {
                                contDominical++;
                            }
                        }
                        // else if(nameDay==='domingo'){
                        //     const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        //     if (dominical.length > 0) {
                        //         contDominical++;
                        //     }
                        // }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    //---------------DOMINGOS FERIADOS----------------------
                    var calculosDominical = contDominical * 50

                    //---------------GANADO TOTAL---------------------------
                    const totalIngreso = sueldos + calculoRecNoc + calculosDominical

                    //-------------------ATRASO-----------------------
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var sumAtraso = moment(`1990-01-01 00:00:00`)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        if (kardexDia.length > 0) {
                            var atraso = kardexDia[0].atraso
                            atraso = atraso.split(":")
                            sumAtraso = moment(sumAtraso).add(parseInt(atraso[0]), 'h').add(parseInt(atraso[1]), 'm').add(parseInt(atraso[2]), 's')
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    sumAtraso = moment(sumAtraso).format("HH:mm:ss")
                    var numAtraso = 0;
                    var minutos = moment.duration(sumAtraso).asMinutes()
                    // console.log(minutos)
                    if (minutos > 30 && minutos <= 45) {
                        numAtraso = 0.5
                    }
                    else if (minutos > 45 && minutos <= 60) {
                        numAtraso = 1
                    }
                    else if (minutos > 60 && minutos <= 75) {
                        numAtraso = 2
                    }
                    else if (minutos > 75 && minutos <= 100) {
                        numAtraso = 3
                    }
                    else if (minutos > 100 && minutos <= 150) {
                        numAtraso = 4
                    } else if (minutos > 150) {
                        numAtraso = 5
                    }

                    //--------------------FALTAS------------------
                    //EL CALCULO SE ESTA REALIZANDO CON LOS DIAS DDE TRABAJO

                    //--------------------SANCION FALTAS Y ATRASOS-----------------
                    var sancionAtraso = 0, sancionFaltas = 0;
                    if (numAtraso > 0) {
                        sancionAtraso = ((parseFloat(empleado[i].haber_basico)) / 30) * numAtraso
                    }
                    if (sumFaltas > 0) {
                        sancionFaltas = (((parseFloat(empleado[i].haber_basico)) / 30) * sumFaltas) * 2
                    }
                    const sancionTotal = sancionAtraso + sancionFaltas

                    //----------------BAJA MEDICA-------------

                    //-------------AFP-----------------------------
                    var descuentoAFP;
                    if (empleado[i].cotizante === '1') {
                        descuentoAFP = ((afp / 100).toFixed(4)) * totalIngreso
                        // console.log(descuentoAFP)
                    } else {
                        descuentoAFP = 0.11 * totalIngreso
                    }
                    //----------------RC-IVA--------------------------
                    var descuentoRCIVA = 0
                    //----------------SINDICATO--------------------
                    //no existe

                    //---------------TOTAL DESCUENTO---------------------------
                    const totalDesc = sancionTotal + descuentoAFP + descuentoRCIVA
                    //---------------LIQUIDO PAGABLE--------------------------
                    var totalLiquido = totalIngreso - totalDesc
                    if (totalLiquido < 0) {
                        totalLiquido = 0
                    }
                    //------------------------------------------
                    array.push({
                        numItem: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        nameEmp: fullname,
                        cotizante: empleado[i].cotizante,
                        nacionality: empleado[i].nacionalityEmp,
                        sexoEmp: empleado[i].sexoEmp,
                        cargoEmp: empleado[i].cargoEmp,
                        departamentEmp: empleado[i].departamentEmp,
                        fechaIng: empleado[i].fechaini,
                        haber_basico: empleado[i].haber_basico,
                        diasTrabajados: sum,
                        sueldo: sueldos.toFixed(2),
                        bonoDeAntiguedad: (0).toFixed(2),
                        bonoRecargaNoc: calculoRecNoc.toFixed(2),
                        interinato: (0).toFixed(2),
                        numDominical: contDominical.toFixed(2),
                        domingosFeriados: calculosDominical.toFixed(2),
                        totalGanado: totalIngreso.toFixed(2),
                        atrasos: numAtraso.toFixed(2),
                        faltas: sumFaltas.toFixed(2),
                        sancionFaltasAtrasos: sancionTotal.toFixed(2),
                        bajaMedica: (0).toFixed(2),
                        AFP: descuentoAFP.toFixed(2),
                        RC_IVA: descuentoRCIVA.toFixed(2),
                        sind: (0).toFixed(2),
                        totalDescuento: totalDesc.toFixed(2),
                        liquidoPagable: totalLiquido.toFixed(2),
                        //---------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                        //--------------------------------------
                        auxTotalGanado: totalIngreso.toFixed(2),
                        auxTotalDescuento: totalDesc.toFixed(2),
                        auxLiquidoPagable: totalLiquido.toFixed(2),
                    })
                } else if (empleado[i].fechaini >= diaini && empleado[i].fechafin <= diafin) {
                    //calcular solo los dias de su contrato ejm 15 del mes al 25 del mes
                    var fullname = empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM
                    //------BUSQUEDA DE FECHAS------------------
                    var buscarFechaIni = new Date(empleado[i].fechaini)
                    var buscarFechaFin = new Date(empleado[i].fechafin)
                    var buscarFechaAux = moment(empleado[i].fechaini).format("YYYY-MM-DD")
                    var contDias = 0
                    const contarDias = (buscarFechaIni, dias) => {
                        buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                        return buscarFechaIni
                    }
                    while (buscarFechaIni <= buscarFechaFin) {
                        contarDias(buscarFechaIni, 1)
                        contDias++
                    }
                    //----SUMA DIAS DE TRABAJO------------------------------
                    var codHorario = empleado[i].cod_horario
                    codHorario = codHorario.split("")
                    arrayDiasTrabajo = []
                    if (codHorario[0] === '1') {
                        arrayDiasTrabajo.push('lunes')
                    }
                    if (codHorario[1] === '1') {
                        arrayDiasTrabajo.push('martes')
                    }
                    if (codHorario[2] === '1') {
                        arrayDiasTrabajo.push('miércoles')
                    }
                    if (codHorario[3] === '1') {
                        arrayDiasTrabajo.push('jueves')
                    }
                    if (codHorario[4] === '1') {
                        arrayDiasTrabajo.push('viernes')
                    }
                    if (codHorario[5] === '1') {
                        arrayDiasTrabajo.push('sábado')
                    }
                    if (codHorario[6] === '1') {
                        arrayDiasTrabajo.push('domingo')
                    }
                    var sum = 0;
                    var sumFaltas = 0;
                    // console.log(empleado[i].id_bio)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        // console.log(buscarFechaAux)
                        // console.log(kardexDia)
                        if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                            if (kardexDia.length > 0) {
                                var aux = kardexDia[0].diaTrabajado
                                // console.log(aux)
                                // aux = aux.split(".")
                                aux = parseFloat(aux)
                                sum = sum + aux
                                //----------------------FALTAS-------------
                                var aux2 = kardexDia[0].faltas
                                aux2 = parseFloat(aux2)
                                // aux2=parseInt(aux2[0])
                                sumFaltas = sumFaltas + aux2
                            } else {
                                console.log('no existe el kaxdex de asistencia de la fecha en la tabla kardex asistencia')
                            }
                        } else {
                            sum = sum + 1
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')

                    }
                    if (sum >= 28) { sum = 30 }

                    //-------------SUELDOS-----------------
                    var sueldos = parseFloat(empleado[i].haber_basico)
                    sueldos = (sueldos / 30) * sum

                    //--BONO ANTIGUEDAD-------------------------
                    //no existe

                    //---------------BONO RECARGA NOCTURNA----------------------
                    var calculoRecNoc;
                    if (empleado[i].cod_estH === '2') {
                        //hacer calculos de bono recarga nocturna
                        const haberBasico = parseFloat(empleado[i].haber_basico)
                        calculoRecNoc = haberBasico * bonoRecNoc
                    } else {
                        //no hacer nada
                        calculoRecNoc = 0
                    }
                    //---------------INTERINATO-------------------------------
                    //no existe

                    //-----------DOMINICAL----------------------------
                    var contDominical = 0
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    for (var k = 0; k < contDias; k++) {
                        var feriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        // console.log(nameDay)
                        if (feriado.length > 0 || nameDay === 'domingo') {
                            const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                            if (dominical.length > 0) {
                                contDominical++;
                            }
                        }
                        // else if(nameDay==='domingo'){
                        //     const dominical = await ASIS.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        //     if (dominical.length > 0) {
                        //         contDominical++;
                        //     }
                        // }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    //---------------DOMINGOS FERIADOS----------------------
                    var calculosDominical = contDominical * 50

                    //---------------GANADO TOTAL---------------------------
                    const totalIngreso = sueldos + calculoRecNoc + calculosDominical

                    //-------------------ATRASO-----------------------
                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    var sumAtraso = moment(`1990-01-01 00:00:00`)
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        if (kardexDia.length > 0) {
                            var atraso = kardexDia[0].atraso
                            atraso = atraso.split(":")
                            sumAtraso = moment(sumAtraso).add(parseInt(atraso[0]), 'h').add(parseInt(atraso[1]), 'm').add(parseInt(atraso[2]), 's')
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                    sumAtraso = moment(sumAtraso).format("HH:mm:ss")
                    var numAtraso = 0;
                    var minutos = moment.duration(sumAtraso).asMinutes()
                    // console.log(minutos)
                    if (minutos > 30 && minutos <= 45) {
                        numAtraso = 0.5
                    }
                    else if (minutos > 45 && minutos <= 60) {
                        numAtraso = 1
                    }
                    else if (minutos > 60 && minutos <= 75) {
                        numAtraso = 2
                    }
                    else if (minutos > 75 && minutos <= 100) {
                        numAtraso = 3
                    }
                    else if (minutos > 100 && minutos <= 150) {
                        numAtraso = 4
                    } else if (minutos > 150) {
                        numAtraso = 5
                    }
                    //--------------------FALTAS------------------
                    //EL CALCULO SE ESTA REALIZANDO CON LOS DIAS DDE TRABAJO

                    //--------------------SANCION FALTAS Y ATRASOS-----------------
                    var sancionAtraso = 0, sancionFaltas = 0;
                    if (numAtraso > 0) {
                        sancionAtraso = ((parseFloat(empleado[i].haber_basico)) / 30) * numAtraso
                    }
                    if (sumFaltas > 0) {
                        sancionFaltas = (((parseFloat(empleado[i].haber_basico)) / 30) * sumFaltas) * 2
                    }
                    const sancionTotal = sancionAtraso + sancionFaltas

                    //----------------BAJA MEDICA-------------

                    //-------------AFP-----------------------------
                    var descuentoAFP;
                    if (empleado[i].cotizante === '1') {
                        descuentoAFP = ((afp / 100).toFixed(4)) * totalIngreso
                        // console.log(descuentoAFP)
                    } else {
                        descuentoAFP = 0.11 * totalIngreso
                    }
                    //----------------RC-IVA--------------------------
                    var descuentoRCIVA = 0
                    //----------------SINDICATO--------------------
                    //no existe

                    //---------------TOTAL DESCUENTO---------------------------
                    const totalDesc = sancionTotal + descuentoAFP + descuentoRCIVA
                    //---------------LIQUIDO PAGABLE--------------------------
                    var totalLiquido = totalIngreso - totalDesc
                    if (totalLiquido < 0) {
                        totalLiquido = 0
                    }
                    //------------------------------------------
                    array.push({
                        numItem: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        nameEmp: fullname,
                        cotizante: empleado[i].cotizante,
                        nacionality: empleado[i].nacionalityEmp,
                        sexoEmp: empleado[i].sexoEmp,
                        cargoEmp: empleado[i].cargoEmp,
                        departamentEmp: empleado[i].departamentEmp,
                        fechaIng: empleado[i].fechaini,
                        haber_basico: empleado[i].haber_basico,
                        diasTrabajados: sum,
                        sueldo: sueldos.toFixed(2),
                        bonoDeAntiguedad: (0).toFixed(2),
                        bonoRecargaNoc: calculoRecNoc.toFixed(2),
                        interinato: (0).toFixed(2),
                        numDominical: contDominical.toFixed(2),
                        domingosFeriados: calculosDominical.toFixed(2),
                        totalGanado: totalIngreso.toFixed(2),
                        atrasos: numAtraso.toFixed(2),
                        faltas: sumFaltas.toFixed(2),
                        sancionFaltasAtrasos: sancionTotal.toFixed(2),
                        bajaMedica: (0).toFixed(2),
                        AFP: descuentoAFP.toFixed(2),
                        RC_IVA: descuentoRCIVA.toFixed(2),
                        sind: (0).toFixed(2),
                        totalDescuento: totalDesc.toFixed(2),
                        liquidoPagable: totalLiquido.toFixed(2),
                        //---------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                        //--------------------------------------
                        auxTotalGanado: totalIngreso.toFixed(2),
                        auxTotalDescuento: totalDesc.toFixed(2),
                        auxLiquidoPagable: totalLiquido.toFixed(2),
                    })
                }
            } else {
                //no tiene marcaciones este mes
                console.log("no tiene marcaciones en el mes buscado")
            }
        }
        // console.log('entra a enventual')
    }
    // }
    // console.log(array)
    res.status(200).json(array)
})


//----------------------------------------------------------
//----------------------------------------------------------
//----------------------------------------------------------
//----------------------CRUD PLANILLA DE SUELDOS-----------------

router.post("/planillaSueldo", async (req, res) => {
    const params = req.body
    const contParams = params.length
    try {
        for (var i = 0; i < contParams; i++) {
            const existe = await PLANILLASUELDO.find({ "$and": [{ id_bio: params[i].id_bio }, { typePlanilla: params[i].typePlanilla }, { buscarFechaInicio: params[i].buscarFechaInicio }, { buscarFechaFinal: params[i].buscarFechaFinal }] })
            if (existe.length > 0) {
                await PLANILLASUELDO.deleteMany({ "$and": [{ id_bio: params[i].id_bio }, { typePlanilla: params[i].typePlanilla }, { buscarFechaInicio: params[i].buscarFechaInicio }, { buscarFechaFinal: params[i].buscarFechaFinal }] })
                const planillaSueldo = new PLANILLASUELDO(params[i])
                planillaSueldo.save()
            } else {
                const planillaSueldo = new PLANILLASUELDO(params[i])
                planillaSueldo.save()
            }
        }
        res.status(200).json({ message: 'planilla guardada' })
    } catch (error) {
        console.log(error)
    }
})

//----------------------GET PLANILLA SUELDOS---------------------------
router.get("/planillaSueldo", async (req, res) => {
    // const fechaIni = req.query.fechaini
    // const fechaFin = req.query.fechafin
    const typePlan = req.query.typePlanilla
    // console.log(fechaIni)
    // console.log(fechaFin)
    // console.log(typePlan)
    const mes = req.query.mes
    const year = req.query.year
    var fechaIni;
    var fechaFin;
    switch(mes){
        case "ENERO":
            fechaIni=moment(`${year}-01-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-02-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "FEBRERO":
            fechaIni=moment(`${year}-02-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-03-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "MARZO":
            fechaIni=moment(`${year}-03-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-04-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "ABRIL":
            fechaIni=moment(`${year}-04-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-05-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "MAYO":
            fechaIni=moment(`${year}-05-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-06-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "JUNIO":
            fechaIni=moment(`${year}-06-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-07-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "JULIO":
            fechaIni=moment(`${year}-07-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-08-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "AGOSTO":
            fechaIni=moment(`${year}-08-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-09-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "SEPTIEMBRE":
            fechaIni=moment(`${year}-09-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-10-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "OCTUBRE":
            fechaIni=moment(`${year}-10-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-11-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "NOVIEMBRE":
            fechaIni=moment(`${year}-11-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-12-01`).subtract(1,'day').format("YYYY-MM-DD")
            break;
        case "DICIEMBRE":
            fechaIni=moment(`${year}-12-01`).format("YYYY-MM-DD")
            fechaFin=moment(`${year}-12-31`).format("YYYY-MM-DD")
            break;
        default:
            console.log('no existe el mes')
    }

    try {
        const planillasSueldo = await PLANILLASUELDO.find({ "$and": [{ buscarFechaInicio: fechaIni }, { buscarFechaFinal: fechaFin }, { typePlanilla: typePlan }] })
        // console.log(planillasSueldo)
        res.status(200).json(planillasSueldo)
    } catch (error) {
        console.log(error)
    }
})

//------------------------EDIT PLANILLA DE SUELDOS------------------------
router.put("/planillaSueldo/:id", async (req, res) => {
    const params = req.body
    // console.log(params)
    var array = []
    //-----INTERINATO-------------
    const totalGanado = parseFloat(params.interinato) + parseFloat(params.totalGanado)
    //-----------BAJA MEDICA S.S.U.-----------
    const reBajaMedica = parseFloat(params.bajaMedica)
    //-------------------------
    const totalFinal = totalGanado - parseFloat(params.totalDescuento)
    //-------------------------
    array.push({
        numItem: params.numItem,
        CIEmp: params.CIEmp,
        nameEmp: params.nameEmp,
        nacionality: params.nacionality,
        sexoEmp: params.sexoEmp,
        cargoEmp: params.cargoEmp,
        departamentEmp: params.departamentEmp,
        fechaIng: params.fechaIng,
        haber_basico: params.haber_basico,
        diasTrabajados: params.diasTrabajados,
        sueldo: params.sueldo,
        bonoDeAntiguedad: params.bonoDeAntiguedad,
        bonoRecargaNoc: params.bonoRecargaNoc,
        interinato: params.interinato,
        numDominical: params.numDominical,
        domingosFeriados: params.domingosFeriados,
        totalGanado: params.totalGanado,
        //----------------------------------------
        atrasos: params.atrasos,
        faltas: params.faltas,
        sancionFaltasAtrasos: params.sancionFaltasAtrasos,
        bajaMedica: reBajaMedica.toFixed(2),
        AFP: params.AFP,
        RC_IVA: params.RC_IVA,
        sind: params.sind,
        totalDescuento: params.totalDescuento,
        //---------------------------------------
        liquidoPagable: totalFinal.toFixed(2),
        //---------------------------------------
        id_bio: params.id_bio,
        buscarFechaInicio: params.buscarFechaInicio,
        buscarFechaFinal: params.buscarFechaFinal,
        typePlanilla: params.typePlanilla,
        //--------------------------------------
        auxTotalGanado: totalGanado.toFixed(2),
        auxTotalDescuento: params.auxTotalDescuento,
        auxLiquidoPagable: totalFinal.toFixed(2),
    })
    await PLANILLASUELDO.findByIdAndUpdate({ _id: req.params.id }, array[0])
    res.status(200).json({ message: 'planilla actualizada' })

})




module.exports = router