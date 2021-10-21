const express = require('express')
const EMPLEADO = require('../../models/Empleado')
const router = express.Router()
const CONFIG = require('../../models/GeneralConfig')
const KARDEXASISTENCIA = require('../../models/modelsPlanillas/KardexAsistencia')
const moment = require('moment')
const PLANILLAREFRIGERIO = require("../../models/modelsPlanillas/PlanillaRefrigerio")

router.get("/pre-planillarefrigerio", async (req, res) => {
    const diaini = req.query.fechaini
    const diafin = req.query.fechafin
    const planilla = req.query.typePlanilla
    // console.log(diaini)
    // console.log(diafin)
    // console.log(planilla)

    const configGeneral = await CONFIG.find({ estado: 'A' }).sort({ gestion: -1 }).limit(1)
    const RCIVA = parseFloat(configGeneral[0].RCIVA) / 100
    // console.log(RCIVA)
    const bonoRefrigerioP = parseFloat(configGeneral[0].bonoTeRefrigerio)
    const bonoRefrigerioE = parseFloat(configGeneral[0].teEventual)
    var array = []
    if (planilla === 'permanente') {
        //-----------PLANILLA PERMANENTE--------------
        const empleado = await EMPLEADO.find({ typeContrato: planilla })
        const contEmp = empleado.length
        for (var i = 0; i < contEmp; i++) {
            const marcaciones = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: { $gte: diaini } }, { fecha: { $lte: diafin } }] })
            if (marcaciones.length > 0) {
                //----SI TIENE MARCACIONES---------
                if (empleado[i].fechaini <= diaini && empleado[i].fechafin >= diafin) {
                    //-------------1 del mes al 31 del mes----------
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
                    var sumDias = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        if (kardexDia.observaciones2 != "Feriado") {
                            if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                                if (kardexDia.length > 0) {
                                    var aux = kardexDia[0].diaTrabajado
                                    // console.log(aux)
                                    // aux = aux.split(".")
                                    aux = parseFloat(aux)
                                    sumDias = sumDias + aux
                                    //----------------------FALTAS-------------
                                    var aux2 = kardexDia[0].faltas
                                    aux2 = parseFloat(aux2)
                                    // aux2=parseInt(aux2[0])
                                    sumFaltas = sumFaltas + aux2
                                } else {
                                    // console.log(buscarFechaAux)
                                    console.log('no existe el kaxdex de asistencia de la fecha')
                                }
                            } else {
                                sumDias = sumDias + 1
                            }
                        } else {
                            console.log("el dia es feriado")
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    //----SERVICIO DE REFRIGERION POR DIA------

                    //----TOTAL SERVICIO REFRIGERIO-------------
                    const totalServicioRefrigerio = bonoRefrigerioP * sumDias

                    //-----------------RC-IVA 13%-----------------------
                    const impuestosRCIVA = totalServicioRefrigerio * RCIVA

                    //-----------------RC-IVA 13%  PRESENTADO-----------------------
                    const RCIVApresentado = 0
                    //-----------------TOTAL DESCUENTO-----------------------
                    const descuentoTotal = impuestosRCIVA

                    //-----------------TOTAL GANADO-----------------------
                    const ganadoTotal = totalServicioRefrigerio - descuentoTotal
                    //-----------------OTROS DESCUENTOS-----------------------
                    const otrosDes = 0
                    //-----------------LIQUIDO PAGABLE-----------------------
                    const totalPagable = ganadoTotal - otrosDes

                    //------------------------------------------
                    array.push({
                        itemEmp: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        fullName: fullname,
                        cargoEmp: empleado[i].cargoEmp,
                        diasTrabajado: sumDias,
                        pagoPorDia: bonoRefrigerioP.toFixed(2),
                        totalServicio: totalServicioRefrigerio,
                        RC_IVA: impuestosRCIVA.toFixed(2),
                        RC_IVA_presentado: RCIVApresentado,
                        totalDescuento: descuentoTotal.toFixed(2),
                        totalGanado: ganadoTotal.toFixed(2),
                        otrosDescuentos: otrosDes.toFixed(2),
                        liquidoPagable: totalPagable.toFixed(2),
                        //--------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
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
                    var sumDias = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        if (kardexDia.observaciones2 != "Feriado") {
                            if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                                if (kardexDia.length > 0) {
                                    var aux = kardexDia[0].diaTrabajado
                                    // console.log(aux)
                                    // aux = aux.split(".")
                                    aux = parseFloat(aux)
                                    sumDias = sumDias + aux
                                    //----------------------FALTAS-------------
                                    var aux2 = kardexDia[0].faltas
                                    aux2 = parseFloat(aux2)
                                    // aux2=parseInt(aux2[0])
                                    sumFaltas = sumFaltas + aux2
                                } else {
                                    // console.log(buscarFechaAux)
                                    console.log('no existe el kaxdex de asistencia de la fecha')
                                }
                            } else {
                                sumDias = sumDias + 1
                            }
                        } else {
                            console.log("el dia es feriado")
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    //----SERVICIO DE REFRIGERION POR DIA------

                    //----TOTAL SERVICIO REFRIGERIO-------------
                    const totalServicioRefrigerio = bonoRefrigerioP * sumDias

                    //-----------------RC-IVA 13%-----------------------
                    const impuestosRCIVA = totalServicioRefrigerio * RCIVA

                    //-----------------RC-IVA 13%  PRESENTADO-----------------------
                    const RCIVApresentado = 0
                    //-----------------TOTAL DESCUENTO-----------------------
                    const descuentoTotal = impuestosRCIVA

                    //-----------------TOTAL GANADO-----------------------
                    const ganadoTotal = totalServicioRefrigerio - descuentoTotal
                    //-----------------OTROS DESCUENTOS-----------------------
                    const otrosDes = 0
                    //-----------------LIQUIDO PAGABLE-----------------------
                    const totalPagable = ganadoTotal - otrosDes

                    //------------------------------------------
                    array.push({
                        itemEmp: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        fullName: fullname,
                        cargoEmp: empleado[i].cargoEmp,
                        diasTrabajado: sumDias,
                        pagoPorDia: bonoRefrigerioP.toFixed(2),
                        totalServicio: totalServicioRefrigerio,
                        RC_IVA: impuestosRCIVA.toFixed(2),
                        RC_IVA_presentado: RCIVApresentado,
                        totalDescuento: descuentoTotal.toFixed(2),
                        totalGanado: ganadoTotal.toFixed(2),
                        otrosDescuentos: otrosDes.toFixed(2),
                        liquidoPagable: totalPagable.toFixed(2),
                        //--------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
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
                    var sumDias = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        if (kardexDia.observaciones2 != "Feriado") {
                            if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                                if (kardexDia.length > 0) {
                                    var aux = kardexDia[0].diaTrabajado
                                    // console.log(aux)
                                    // aux = aux.split(".")
                                    aux = parseFloat(aux)
                                    sumDias = sumDias + aux
                                    //----------------------FALTAS-------------
                                    var aux2 = kardexDia[0].faltas
                                    aux2 = parseFloat(aux2)
                                    // aux2=parseInt(aux2[0])
                                    sumFaltas = sumFaltas + aux2
                                } else {
                                    // console.log(buscarFechaAux)
                                    console.log('no existe el kaxdex de asistencia de la fecha')
                                }
                            } else {
                                sumDias = sumDias + 1
                            }
                        } else {
                            console.log("el dia es feriado")
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    //----SERVICIO DE REFRIGERION POR DIA------

                    //----TOTAL SERVICIO REFRIGERIO-------------
                    const totalServicioRefrigerio = bonoRefrigerioP * sumDias

                    //-----------------RC-IVA 13%-----------------------
                    const impuestosRCIVA = totalServicioRefrigerio * RCIVA

                    //-----------------RC-IVA 13%  PRESENTADO-----------------------
                    const RCIVApresentado = 0
                    //-----------------TOTAL DESCUENTO-----------------------
                    const descuentoTotal = impuestosRCIVA

                    //-----------------TOTAL GANADO-----------------------
                    const ganadoTotal = totalServicioRefrigerio - descuentoTotal
                    //-----------------OTROS DESCUENTOS-----------------------
                    const otrosDes = 0
                    //-----------------LIQUIDO PAGABLE-----------------------
                    const totalPagable = ganadoTotal - otrosDes

                    //------------------------------------------
                    array.push({
                        itemEmp: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        fullName: fullname,
                        cargoEmp: empleado[i].cargoEmp,
                        diasTrabajado: sumDias,
                        pagoPorDia: bonoRefrigerioP.toFixed(2),
                        totalServicio: totalServicioRefrigerio,
                        RC_IVA: impuestosRCIVA.toFixed(2),
                        RC_IVA_presentado: RCIVApresentado,
                        totalDescuento: descuentoTotal.toFixed(2),
                        totalGanado: ganadoTotal.toFixed(2),
                        otrosDescuentos: otrosDes.toFixed(2),
                        liquidoPagable: totalPagable.toFixed(2),
                        //--------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
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
                    var sumDias = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        if (kardexDia.observaciones2 != "Feriado") {
                            if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                                if (kardexDia.length > 0) {
                                    var aux = kardexDia[0].diaTrabajado
                                    // console.log(aux)
                                    // aux = aux.split(".")
                                    aux = parseFloat(aux)
                                    sumDias = sumDias + aux
                                    //----------------------FALTAS-------------
                                    var aux2 = kardexDia[0].faltas
                                    aux2 = parseFloat(aux2)
                                    // aux2=parseInt(aux2[0])
                                    sumFaltas = sumFaltas + aux2
                                } else {
                                    // console.log(buscarFechaAux)
                                    console.log('no existe el kaxdex de asistencia de la fecha')
                                }
                            } else {
                                sumDias = sumDias + 1
                            }
                        } else {
                            console.log("el dia es feriado")
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    //----SERVICIO DE REFRIGERION POR DIA------

                    //----TOTAL SERVICIO REFRIGERIO-------------
                    const totalServicioRefrigerio = bonoRefrigerioP * sumDias

                    //-----------------RC-IVA 13%-----------------------
                    const impuestosRCIVA = totalServicioRefrigerio * RCIVA

                    //-----------------RC-IVA 13%  PRESENTADO-----------------------
                    const RCIVApresentado = 0
                    //-----------------TOTAL DESCUENTO-----------------------
                    const descuentoTotal = impuestosRCIVA

                    //-----------------TOTAL GANADO-----------------------
                    const ganadoTotal = totalServicioRefrigerio - descuentoTotal
                    //-----------------OTROS DESCUENTOS-----------------------
                    const otrosDes = 0
                    //-----------------LIQUIDO PAGABLE-----------------------
                    const totalPagable = ganadoTotal - otrosDes

                    //------------------------------------------
                    array.push({
                        itemEmp: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        fullName: fullname,
                        cargoEmp: empleado[i].cargoEmp,
                        diasTrabajado: sumDias,
                        pagoPorDia: bonoRefrigerioP.toFixed(2),
                        totalServicio: totalServicioRefrigerio,
                        RC_IVA: impuestosRCIVA.toFixed(2),
                        RC_IVA_presentado: RCIVApresentado,
                        totalDescuento: descuentoTotal.toFixed(2),
                        totalGanado: ganadoTotal.toFixed(2),
                        otrosDescuentos: otrosDes.toFixed(2),
                        liquidoPagable: totalPagable.toFixed(2),
                        //--------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                    })
                } else {
                    console.log("no tiene marcaciones en el mes buscado")
                }
            }
        }
    } else {
        //----------PLANILLA EVENTUAL---------------------
        const empleado = await EMPLEADO.find({ typeContrato: planilla })
        const contEmp = empleado.length
        for (var i = 0; i < contEmp; i++) {
            const marcaciones = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: { $gte: diaini } }, { fecha: { $lte: diafin } }] })
            if (marcaciones.length > 0) {
                //----SI TIENE MARCACIONES---------
                if (empleado[i].fechaini <= diaini && empleado[i].fechafin >= diafin) {
                    //-------------1 del mes al 31 del mes----------
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
                    var sumDias = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        if (kardexDia.observaciones2 != "Feriado") {
                            if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                                if (kardexDia.length > 0) {
                                    var aux = kardexDia[0].diaTrabajado
                                    // console.log(aux)
                                    // aux = aux.split(".")
                                    aux = parseFloat(aux)
                                    sumDias = sumDias + aux
                                    //----------------------FALTAS-------------
                                    var aux2 = kardexDia[0].faltas
                                    aux2 = parseFloat(aux2)
                                    // aux2=parseInt(aux2[0])
                                    sumFaltas = sumFaltas + aux2
                                } else {
                                    // console.log(buscarFechaAux)
                                    console.log('no existe el kaxdex de asistencia de la fecha')
                                }
                            } else {
                                sumDias = sumDias + 1
                            }
                        } else {
                            console.log("el dia es feriado")
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    //----SERVICIO DE REFRIGERION POR DIA------

                    //----TOTAL SERVICIO REFRIGERIO-------------
                    const totalServicioRefrigerio = bonoRefrigerioE * sumDias

                    //-----------------RC-IVA 13%-----------------------
                    const impuestosRCIVA = totalServicioRefrigerio * RCIVA

                    //-----------------RC-IVA 13%  PRESENTADO-----------------------
                    const RCIVApresentado = 0
                    //-----------------TOTAL DESCUENTO-----------------------
                    const descuentoTotal = impuestosRCIVA

                    //-----------------TOTAL GANADO-----------------------
                    const ganadoTotal = totalServicioRefrigerio - descuentoTotal
                    //-----------------OTROS DESCUENTOS-----------------------
                    const otrosDes = 0
                    //-----------------LIQUIDO PAGABLE-----------------------
                    const totalPagable = ganadoTotal - otrosDes

                    //------------------------------------------
                    array.push({
                        itemEmp: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        fullName: fullname,
                        cargoEmp: empleado[i].cargoEmp,
                        diasTrabajado: sumDias,
                        pagoPorDia: bonoRefrigerioP.toFixed(2),
                        totalServicio: totalServicioRefrigerio,
                        RC_IVA: impuestosRCIVA.toFixed(2),
                        RC_IVA_presentado: RCIVApresentado,
                        totalDescuento: descuentoTotal.toFixed(2),
                        totalGanado: ganadoTotal.toFixed(2),
                        otrosDescuentos: otrosDes.toFixed(2),
                        liquidoPagable: totalPagable.toFixed(2),
                        //--------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
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
                    var sumDias = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        if (kardexDia.observaciones2 != "Feriado") {
                            if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                                if (kardexDia.length > 0) {
                                    var aux = kardexDia[0].diaTrabajado
                                    // console.log(aux)
                                    // aux = aux.split(".")
                                    aux = parseFloat(aux)
                                    sumDias = sumDias + aux
                                    //----------------------FALTAS-------------
                                    var aux2 = kardexDia[0].faltas
                                    aux2 = parseFloat(aux2)
                                    // aux2=parseInt(aux2[0])
                                    sumFaltas = sumFaltas + aux2
                                } else {
                                    // console.log(buscarFechaAux)
                                    console.log('no existe el kaxdex de asistencia de la fecha')
                                }
                            } else {
                                sumDias = sumDias + 1
                            }
                        } else {
                            console.log("el dia es feriado")
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    //----SERVICIO DE REFRIGERION POR DIA------

                    //----TOTAL SERVICIO REFRIGERIO-------------
                    const totalServicioRefrigerio = bonoRefrigerioE * sumDias

                    //-----------------RC-IVA 13%-----------------------
                    const impuestosRCIVA = totalServicioRefrigerio * RCIVA

                    //-----------------RC-IVA 13%  PRESENTADO-----------------------
                    const RCIVApresentado = 0
                    //-----------------TOTAL DESCUENTO-----------------------
                    const descuentoTotal = impuestosRCIVA

                    //-----------------TOTAL GANADO-----------------------
                    const ganadoTotal = totalServicioRefrigerio - descuentoTotal
                    //-----------------OTROS DESCUENTOS-----------------------
                    const otrosDes = 0
                    //-----------------LIQUIDO PAGABLE-----------------------
                    const totalPagable = ganadoTotal - otrosDes

                    //------------------------------------------
                    array.push({
                        itemEmp: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        fullName: fullname,
                        cargoEmp: empleado[i].cargoEmp,
                        diasTrabajado: sumDias,
                        pagoPorDia: bonoRefrigerioP.toFixed(2),
                        totalServicio: totalServicioRefrigerio,
                        RC_IVA: impuestosRCIVA.toFixed(2),
                        RC_IVA_presentado: RCIVApresentado,
                        totalDescuento: descuentoTotal.toFixed(2),
                        totalGanado: ganadoTotal.toFixed(2),
                        otrosDescuentos: otrosDes.toFixed(2),
                        liquidoPagable: totalPagable.toFixed(2),
                        //--------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
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
                    var sumDias = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        if (kardexDia.observaciones2 != "Feriado") {
                            if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                                if (kardexDia.length > 0) {
                                    var aux = kardexDia[0].diaTrabajado
                                    // console.log(aux)
                                    // aux = aux.split(".")
                                    aux = parseFloat(aux)
                                    sumDias = sumDias + aux
                                    //----------------------FALTAS-------------
                                    var aux2 = kardexDia[0].faltas
                                    aux2 = parseFloat(aux2)
                                    // aux2=parseInt(aux2[0])
                                    sumFaltas = sumFaltas + aux2
                                } else {
                                    // console.log(buscarFechaAux)
                                    console.log('no existe el kaxdex de asistencia de la fecha')
                                }
                            } else {
                                sumDias = sumDias + 1
                            }
                        } else {
                            console.log("el dia es feriado")
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    //----SERVICIO DE REFRIGERION POR DIA------

                    //----TOTAL SERVICIO REFRIGERIO-------------
                    const totalServicioRefrigerio = bonoRefrigerioE * sumDias

                    //-----------------RC-IVA 13%-----------------------
                    const impuestosRCIVA = totalServicioRefrigerio * RCIVA

                    //-----------------RC-IVA 13%  PRESENTADO-----------------------
                    const RCIVApresentado = 0
                    //-----------------TOTAL DESCUENTO-----------------------
                    const descuentoTotal = impuestosRCIVA

                    //-----------------TOTAL GANADO-----------------------
                    const ganadoTotal = totalServicioRefrigerio - descuentoTotal
                    //-----------------OTROS DESCUENTOS-----------------------
                    const otrosDes = 0
                    //-----------------LIQUIDO PAGABLE-----------------------
                    const totalPagable = ganadoTotal - otrosDes

                    //------------------------------------------
                    array.push({
                        itemEmp: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        fullName: fullname,
                        cargoEmp: empleado[i].cargoEmp,
                        diasTrabajado: sumDias,
                        pagoPorDia: bonoRefrigerioP.toFixed(2),
                        totalServicio: totalServicioRefrigerio,
                        RC_IVA: impuestosRCIVA.toFixed(2),
                        RC_IVA_presentado: RCIVApresentado,
                        totalDescuento: descuentoTotal.toFixed(2),
                        totalGanado: ganadoTotal.toFixed(2),
                        otrosDescuentos: otrosDes.toFixed(2),
                        liquidoPagable: totalPagable.toFixed(2),
                        //--------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
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
                    var sumDias = 0;
                    var sumFaltas = 0;
                    for (var j = 0; j < contDias; j++) {
                        var kardexDia = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: buscarFechaAux }] }).sort({ fecha: 1 })
                        var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                        if (kardexDia.observaciones2 != "Feriado") {
                            if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                                if (kardexDia.length > 0) {
                                    var aux = kardexDia[0].diaTrabajado
                                    // console.log(aux)
                                    // aux = aux.split(".")
                                    aux = parseFloat(aux)
                                    sumDias = sumDias + aux
                                    //----------------------FALTAS-------------
                                    var aux2 = kardexDia[0].faltas
                                    aux2 = parseFloat(aux2)
                                    // aux2=parseInt(aux2[0])
                                    sumFaltas = sumFaltas + aux2
                                } else {
                                    // console.log(buscarFechaAux)
                                    console.log('no existe el kaxdex de asistencia de la fecha')
                                }
                            } else {
                                sumDias = sumDias + 1
                            }
                        } else {
                            console.log("el dia es feriado")
                        }
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                    buscarFechaAux = moment(diaini).format("YYYY-MM-DD")
                    //----SERVICIO DE REFRIGERION POR DIA------

                    //----TOTAL SERVICIO REFRIGERIO-------------
                    const totalServicioRefrigerio = bonoRefrigerioE * sumDias

                    //-----------------RC-IVA 13%-----------------------
                    const impuestosRCIVA = totalServicioRefrigerio * RCIVA

                    //-----------------RC-IVA 13%  PRESENTADO-----------------------
                    const RCIVApresentado = 0
                    //-----------------TOTAL DESCUENTO-----------------------
                    const descuentoTotal = impuestosRCIVA

                    //-----------------TOTAL GANADO-----------------------
                    const ganadoTotal = totalServicioRefrigerio - descuentoTotal
                    //-----------------OTROS DESCUENTOS-----------------------
                    const otrosDes = 0
                    //-----------------LIQUIDO PAGABLE-----------------------
                    const totalPagable = ganadoTotal - otrosDes

                    //------------------------------------------
                    array.push({
                        itemEmp: empleado[i].itemEmp,
                        CIEmp: empleado[i].CIEmp,
                        fullName: fullname,
                        cargoEmp: empleado[i].cargoEmp,
                        diasTrabajado: sumDias,
                        pagoPorDia: bonoRefrigerioP.toFixed(2),
                        totalServicio: totalServicioRefrigerio,
                        RC_IVA: impuestosRCIVA.toFixed(2),
                        RC_IVA_presentado: RCIVApresentado,
                        totalDescuento: descuentoTotal.toFixed(2),
                        totalGanado: ganadoTotal.toFixed(2),
                        otrosDescuentos: otrosDes.toFixed(2),
                        liquidoPagable: totalPagable.toFixed(2),
                        //--------------------------------------
                        id_bio: empleado[i].id_bio,
                        buscarFechaInicio: diaini,
                        buscarFechaFinal: diafin,
                        typePlanilla: planilla,
                    })
                } else {
                    console.log("no tiene marcaciones en el mes buscado")
                }
            }
        }
    }
    // console.log(array)
    res.status(200).json(array)
})


//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//--------------------------------CRUD PLANILLA DE REFRIGERIO---------------------
//-------------------------POST---------------------
router.post("/planillarefrigerio", async (req, res) => {
    const params = req.body
    const contParams = params.length
    try {
        for (var i = 0; i < contParams; i++) {
            const existe = await PLANILLAREFRIGERIO.find({ "$and": [{ id_bio: params[i].id_bio }, { typePlanilla: params[i].typePlanilla }, { buscarFechaInicio: params[i].buscarFechaInicio }, { buscarFechaFinal: params[i].buscarFechaFinal }] })
            if (existe.length > 0) {
                await PLANILLAREFRIGERIO.deleteMany({ "$and": [{ id_bio: params[i].id_bio }, { typePlanilla: params[i].typePlanilla }, { buscarFechaInicio: params[i].buscarFechaInicio }, { buscarFechaFinal: params[i].buscarFechaFinal }] })
                const planillaRefrigerio = new PLANILLAREFRIGERIO(params[i])
                planillaRefrigerio.save()
            } else {
                const planillaRefrigerio = new PLANILLAREFRIGERIO(params[i])
                planillaRefrigerio.save()
            }
        }
        res.status(200).json({ message: 'planilla refrigerio guardada' })
    } catch (error) {
        console.log(error)
    }
})

//----------------------GET PLANLLA REFRIGERIO-------------------------
router.get("/planillarefrigerio", async (req, res) => {
    const fechaIni = req.query.fechaini
    const fechaFin = req.query.fechafin
    const typePlan = req.query.typePlanilla

    try {
        const planillaRefrigerio = await PLANILLAREFRIGERIO.find({ "$and": [{ buscarFechaInicio: fechaIni }, { buscarFechaFinal: fechaFin }, { typePlanilla: typePlan }] })
        res.status(200).json(planillaRefrigerio)
    } catch (error) {
        console.log(error)
    }
})

//-----------------EDIT PLANILLA REFRIGERIO-----------------------------
router.put("/planillarefrigerio/:id", async (req, res) => {
    const params = req.body
    const configGeneral = await CONFIG.find({ estado: 'A' }).sort({ gestion: -1 }).limit(1)
    const RCIVA = parseFloat(configGeneral[0].RCIVA) / 100
    // console.log(params)
    //auxTotalServicio
    //auxLiquidoPagable
    //auxTotalGanado
    var array = []
    //---------TOTAL SERVICIO REFRIGERIO-----------------
    const servicioTotal = parseFloat(params.diasTrabajado) * parseFloat(params.pagoPorDia)

    //-----------------RC-IVA 13%-----------------------
    const impuestosRCIVA = servicioTotal * RCIVA

    //-----------------RC-IVA 13% presentado-----------------------
    const IVA_presentado = parseFloat(params.RC_IVA_presentado)

    //---------TOTAL DESCUENTO----------------
    var descuentoTotal;
    if (IVA_presentado >= impuestosRCIVA) {
        descuentoTotal = 0
    }else{
        descuentoTotal=impuestosRCIVA
    }
    //------TOTAL GANADO--------------------
    const ganadoTotal = servicioTotal - descuentoTotal
    //--------LIQUIDO PAGABLE----------------------
    const totalPagable = ganadoTotal - parseFloat(params.otrosDescuentos)
    //------------------------------------------
    array.push({
        itemEmp: params.itemEmp,
        CIEmp: params.CIEmp,
        fullName: params.fullName,
        cargoEmp: params.cargoEmp,
        diasTrabajado: params.diasTrabajado,
        pagoPorDia: params.pagoPorDia,
        totalServicio: servicioTotal.toFixed(2),
        RC_IVA: impuestosRCIVA.toFixed(2),
        RC_IVA_presentado: IVA_presentado.toFixed(2),
        totalDescuento: descuentoTotal.toFixed(2),
        totalGanado: ganadoTotal.toFixed(2),
        otrosDescuentos: params.otrosDescuentos,
        liquidoPagable: totalPagable.toFixed(2),
        //--------------------------------------
        id_bio: params.id_bio,
        buscarFechaInicio: params.buscarFechaInicio,
        buscarFechaFinal: params.buscarFechaFinal,
        typePlanilla: params.typePlanilla,
    })
    await PLANILLAREFRIGERIO.findByIdAndUpdate({_id:req.params.id},array[0])
    res.status(200).json({message:'planilla refrigerio actualizada'})

})

module.exports = router