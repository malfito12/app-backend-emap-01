const express = require('express')
const router = express.Router()
const moment = require('moment')
const EMPLEADO = require('../../models/Empleado')
const ASIS = require('../../models/Asistencia')
const PERMISO = require('../../models/Permiso')
const FERIADO = require('../../models/Feriado')
const KARDEXASISTENCIA = require('../../models/modelsPlanillas/KardexAsistencia')


router.get('/sueldo/:id', async (req, res) => {
    const params = req.params.id
    const fechas = req.query
    const empleado = await EMPLEADO.find({ id_bio: params })
    if (empleado != 0) {
        // console.log(codHorario)
        var fechaini = new Date(empleado[0].fechaini)
        var fechafin = new Date(empleado[0].fechafin)
        //----sumar dias de contrato-----------------------------
        var contFechas = 0
        const sumarDias = (fechaini, dias) => {
            fechaini.setDate(fechaini.getDate() + dias)
            return fechaini
        }
        while (fechaini <= fechafin) {
            sumarDias(fechaini, 1)
            contFechas++
        }
        //------busqueda de fechas ----------------------
        var buscarFechaIni = new Date(fechas.fechaini)
        var buscarFechaFin = new Date(fechas.fechafin)
        var buscarFechaFinAux = moment(fechas.fechafin) // auxiliar para el caso de permisos y feriados que no entren al primer if por culpa de moment()
        var buscarFechaAux = moment(fechas.fechaini).format('YYYY-MM-DD')

        var contDias = 0
        const contarDias = (buscarFechaIni, dias) => {
            buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
            return buscarFechaIni
        }
        while (buscarFechaIni <= buscarFechaFin) {
            contarDias(buscarFechaIni, 1)
            contDias++
        }
        //--------HORARIOS----------------------------
        //-----------OPCION 1------------------------
        const a = moment(`1990-01-01 ${empleado[0].ingreso1}`).subtract(2, 'h').format('HH:mm:ss')
        const b = moment(`1990-01-01 ${empleado[0].ingreso1}`).add(2, 'h').format('HH:mm:ss')
        const c = moment(`1990-01-01 ${empleado[0].salida1}`).add(1, 'h').format('HH:mm:ss')
        const d = moment(`1990-01-01 ${empleado[0].ingreso2}`).add(2, 'h').format('HH:mm:ss')
        const e = moment(`1990-01-01 ${empleado[0].salida2}`).add(2, 'h').format('HH:mm:ss')
        //------------OPCION 2----------------------------
        const aa = moment(`1990-01-01 ${empleado[0].ingreso1}`).subtract(2, 'h')
        const bb = moment(`1990-01-01 ${empleado[0].ingreso1}`).add(2, 'h')
        const cc = moment(`1990-01-01 ${empleado[0].salida1}`).add(1, 'h')
        const dd = moment(`1990-01-01 ${empleado[0].ingreso2}`).add(2, 'h')
        const ee = moment(`1990-01-01 ${empleado[0].salida2}`).add(2, 'h')
        // console.log(aa)
        // console.log(bb)
        // console.log(cc)
        // console.log(dd)
        // console.log(ee)
        //-------------------NOCTURNOS----------------------------
        const ingreNoc = moment(`1990-01-01 ${empleado[0].ingreso1}`).subtract(1, 'h').format("HH:mm:ss")
        const salidaNoc = moment(`1990-01-01 ${empleado[0].salida1}`).add(2, 'h').format("HH:mm:ss")
        var toleranciaNoc = moment(`1990-01-01 ${empleado[0].ingreso1}`).add(empleado[0].tolerancia, 'm').format("HH:mm:ss")
        var horaExtraNoc = moment(`1990-01-01 ${empleado[0].salida1}`).format("HH:mm:ss")

        //--------TOLERANCIAS--------------------------
        const tolerancia = empleado[0].tolerancia
        var tolerancia1 = moment(`1990-01-01 ${empleado[0].ingreso1}`).add(tolerancia, 'm').format("HH:mm:ss")
        var tolerancia2 = moment(`1990-01-01 ${empleado[0].ingreso2}`).add(tolerancia, 'm').format("HH:mm:ss")

        //--------HORAS EXTRAS--------------------------
        var horaextra1 = moment(`1990-01-01 ${empleado[0].salida1}`).format("HH:mm:ss")
        var horaextra2 = moment(`1990-01-01 ${empleado[0].salida2}`).format("HH:mm:ss")
        //-------------------OBTENER EL CODIGO DE HORARIO----------------------
        var codHorario = empleado[0].cod_horario
        codHorario = codHorario.split("")
        arrayDiasTrabajo = []
        if (codHorario[0] === '1') {
            arrayDiasTrabajo.push('lunes')
        }
        if (codHorario[1] === '1') {
            arrayDiasTrabajo.push('martes')
        }
        if (codHorario[2] === '1') {
            arrayDiasTrabajo.push('mi??rcoles')
        }
        if (codHorario[3] === '1') {
            arrayDiasTrabajo.push('jueves')
        }
        if (codHorario[4] === '1') {
            arrayDiasTrabajo.push('viernes')
        }
        if (codHorario[5] === '1') {
            arrayDiasTrabajo.push('s??bado')
        }
        if (codHorario[6] === '1') {
            arrayDiasTrabajo.push('domingo')
        }
        console.log(arrayDiasTrabajo)
        //----------CALCULOS DE KARDEX DE ASISTENCIA-----------------
        var array = []
        var auxPrueba3 = []

        //------------HORARIO CONTINUO----------------------------

        if (empleado[0].cod_estH == "1") {
            //---------------HORARIO DIURNO-------------------------
            for (var i = 0; i < contDias; i++) {
                if (empleado[0].fechaini <= buscarFechaAux && empleado[0].fechafin >= buscarFechaAux) {
                    //SI ESTA DENTRO DEL PARAMETRO FECHAS DE CONTRATO
                    const getMarcacion = await ASIS.find({ "$and": [{ id_bio: params }, { fecha: buscarFechaAux }] })
                    var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                    // if (nameDay === 'lunes' || nameDay === 'martes' || nameDay === 'mi??rcoles' || nameDay === 'jueves' || nameDay === 'viernes') {
                    if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {

                        var contIngreso1 = '0'
                        var contSalida1 = '0'
                        var contIngreso2 = '0'
                        var contSalida2 = '0'
                        var result;
                        var aux = []
                        var auxPrueba = []
                        var auxPrueba2 = []
                        // if (getMarcacion != "") {
                        if (getMarcacion.length > 0) {
                            //SI EXISTE MARCACION
                            const num = getMarcacion.length
                            const buscarFeriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux }).sort({ nameFeriado: 1 })
                            if (buscarFeriado.length > 0) {
                                var suma = 0;
                                var diaFeriado = nameDay
                                var desde = moment(buscarFeriado[0].fechaFeriadoIni, 'YYYY-MM-DD')
                                var hasta = moment(buscarFeriado[0].fechaFeriadoFin, 'YYYY-MM-DD')
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        array.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado
                                        })
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        array.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado
                                        })
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                }
                                buscarFechaAux = moment(buscarFechaAux).add(suma, 'day').format('YYYY-MM-DD')
                            } else {
                                //--------------------PRUEBAS -------------------------------------------------
                                // console.log(getMarcacion)
                                console.log('entra')
                                for (var n = 0; n < num; n++) {
                                    auxPrueba.push(getMarcacion[n].hora)
                                }
                                // console.log(auxPrueba)
                                for (var m = 0; m < auxPrueba.length; m++) {
                                    if (auxPrueba.length > m + 1) {
                                        var hora1 = moment(`1990-01-01 ${auxPrueba[m]}`).add(15, 'm').format("HH:mm:ss")
                                        var hora2 = moment(`1990-01-01 ${auxPrueba[m + 1]}`).format("HH:mm:ss")
                                        if (hora2 < hora1) {
                                            auxPrueba2.push(auxPrueba[m])
                                            auxPrueba.splice(m + 1, 1)
                                        } else {
                                            auxPrueba2.push(auxPrueba[m])
                                        }
                                        // console.log(hora1)
                                        // console.log(hora2)
                                    } else {
                                        var hora = moment(`1990-01-01 ${auxPrueba[m]}`).format("HH:mm:ss")
                                        auxPrueba2.push(hora)
                                        // console.log(hora)
                                    }
                                }
                                // console.log(auxPrueba2)


                                //------------------------HORARIO NOCTURNO-------------------------------------------

                                //-------------------------------------------------------------------------
                                //-------------------------------------------------------------------------
                                for (var j = 0; j < num; j++) {
                                    //--------------------OPCION 1--------------------------------------
                                    // if (getMarcacion[j].hora >= a && getMarcacion[j].hora <= b) {
                                    //     contIngreso1 = '1'
                                    //     aux.push({ hora: getMarcacion[j].hora })
                                    // } else if (getMarcacion[j].hora > b && getMarcacion[j].hora <= c) {
                                    //     contSalida1 = '1'
                                    //     aux.push({ hora: getMarcacion[j].hora })
                                    //     // console.log('salida 1')
                                    // } else if (getMarcacion[j].hora > c && getMarcacion[j].hora <= d) {
                                    //     contIngreso2 = '1'
                                    //     aux.push({ hora: getMarcacion[j].hora })
                                    //     // console.log('ingreso 2')
                                    // } else if (getMarcacion[j].hora > d && getMarcacion[j].hora <= e) {
                                    //     contSalida2 = '1'
                                    //     aux.push({ hora: getMarcacion[j].hora })
                                    //     // console.log('salida 2')
                                    // } else { console.log('fuera de horario') }
                                    //------------------------OPCION 2----------------------------------------
                                    var cambio = moment(`1990-01-01 ${getMarcacion[j].hora}`)
                                    // console.log(cambio)
                                    if (cambio >= aa && cambio <= bb) {
                                        contIngreso1 = '1'
                                        aux.push({ hora: getMarcacion[j].hora })
                                    } else if (cambio > bb && cambio <= cc) {
                                        contSalida1 = '1'
                                        aux.push({ hora: getMarcacion[j].hora })
                                        // console.log('salida 1')
                                    } else if (cambio > cc && cambio <= dd) {
                                        contIngreso2 = '1'
                                        aux.push({ hora: getMarcacion[j].hora })
                                        // console.log('ingreso 2')
                                    } else if (cambio > dd && cambio <= ee) {
                                        contSalida2 = '1'
                                        aux.push({ hora: getMarcacion[j].hora })
                                        // console.log('salida 2')
                                    } else { console.log('fuera de horario') }
                                }
                                // console.log(aux)
                                result = contIngreso1 + contSalida1 + contIngreso2 + contSalida2
                                //-----------ATRASOS----------------------------------
                                const una = new Date('1990-01-01 00:00:00')
                                const atraso = (a, b) => {
                                    var sum1 = atraso1(a)
                                    var sum2 = atraso2(b)
                                    sum1 = sum1.split(":")
                                    var sum = new Date(`1990-01-01 ${sum2}`)
                                    sum = moment(sum).add(parseInt(sum1[0]), 'h').add(parseInt(sum1[1]), 'm').add(parseInt(sum1[2]), 's').format("HH:mm:ss")
                                    // console.log(sum)
                                    return sum
                                }
                                const atraso1 = (e) => {
                                    var data1 = new Date(`1990-01-01 ${e}`)
                                    if (e > tolerancia1) {
                                        var aux = tolerancia1.split(":")
                                        data1 = moment(data1).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                        return data1
                                    } else return moment(una).format("HH:mm:ss")
                                }
                                const atraso2 = (e) => {
                                    // console.log(e)
                                    // console.log(tolerancia2)
                                    var data2 = new Date(`1990-01-01 ${e}`)
                                    if (e > tolerancia2) {
                                        // data=moment(data)
                                        var aux = tolerancia2.split(":")
                                        data2 = moment(data2).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                        // console.log(data)
                                        return data2
                                    } else return moment(una).format("HH:mm:ss")
                                }
                                //------------HORAS EXTRAS------------------------------------
                                const dos = new Date(`1990-01-01 00:00:00`)
                                const horasExtra = (a, b) => {
                                    var sum1 = horasExtra1(a)
                                    var sum2 = horasExtra2(b)
                                    sum1 = sum1.split(":")
                                    var sum = new Date(`1990-01-01 ${sum2}`)
                                    sum = moment(sum).add(parseInt(sum1[0]), 'h').add(parseInt(sum1[1]), 'm').add(parseInt(sum1[2]), 's').format("HH:mm:ss")
                                    // console.log(sum)
                                    return sum

                                }
                                const horasExtra1 = (e) => {
                                    var data1 = new Date(`1990-01-01 ${e}`)
                                    if (e > horaextra1) {
                                        var aux = horaextra1.split(":")
                                        data1 = moment(data1).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                        return data1
                                    } else return moment(dos).format("HH:mm:ss")
                                }
                                const horasExtra2 = (e) => {
                                    var data2 = new Date(`1990-01-01 ${e}`)
                                    if (e > horaextra2) {
                                        var aux = horaextra2.split(":")
                                        data2 = moment(data2).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                        return data2
                                    } else return moment(dos).format("HH:mm:ss")
                                }
                                //-----------------HORAS DE TRABAJO---------------------
                                // const horasTrabajo = (a, b, c, d) => {
                                //     console.log(a)
                                //     console.log(b)
                                //     console.log(c)
                                //     console.log(d)
                                //     var hora1=moment(a)
                                // }
                                const entrada1 = (a, b) => {

                                }
                                const entrada2 = (c, d) => {

                                }
                                // const prueba=()=>{
                                //     const hora1=moment("2000-01-01 23:20:00","YYYY-MM-DD HH:mm:ss")
                                //     const hora2=moment("2000-01-02 02:25:00","YYYY-MM-DD HH:mm:ss")
                                //     const result1=hora2.diff(hora1,'hours')
                                //     const result2=hora2.diff(hora1,'m')
                                //     const horaprueba=moment("2000-01-02 23:00:00","YYYY-MM-DD HH:mm:ss").add(2,'h')
                                //     // console.log(hora1)
                                //     // console.log(hora2)
                                //     // console.log(result1)
                                //     // console.log(result2)
                                //     // console.log(horaprueba)
                                // }
                                // prueba()
                                //-------------------------PRUEBAS MARCACIONES------------------------
                                const numAux = auxPrueba2.length
                                if (numAux == 1) {
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: '00:00:00',
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: atraso(auxPrueba2[0]),
                                        // horasExtra: horasExtra(aux[0].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'
                                    })
                                }
                                else if (numAux == 2) {
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: auxPrueba2[1],
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: atraso(auxPrueba2[0]),
                                        horasExtra: horasExtra(auxPrueba2[1]),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'
                                    })
                                }
                                else if (numAux == 3) {
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: auxPrueba2[1],
                                        ingreso2: auxPrueba2[2],
                                        salida2: '00:00:00',
                                        atraso: atraso(auxPrueba2[0], auxPrueba2[2]),
                                        horasExtra: horasExtra(auxPrueba2[1]),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'
                                    })
                                }
                                else if (numAux == 4) {
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: auxPrueba2[1],
                                        ingreso2: auxPrueba2[2],
                                        salida2: auxPrueba2[3],
                                        atraso: atraso(auxPrueba2[0], auxPrueba2[2]),
                                        horasExtra: horasExtra(auxPrueba2[1], auxPrueba2[3]),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: ''
                                    })
                                }
                                //------------------------------------------------------
                                //-----------------LLENADO DE MARCACIONES POR FECHA---------------------
                                if (result === '0000') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: '00:00:00',
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: '00:00:00',
                                        horasExtra: '00:00:00',
                                        diaTrabajado: '0.0',
                                        faltas: '0.0',
                                        observaciones: 'fuera de horario'
                                    })
                                }
                                else if (result === '0001') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: '00:00:00',
                                        ingreso2: '00:00:00',
                                        salida2: aux[0].hora,
                                        // atraso: atraso(aux[0].hora),
                                        horasExtra: horasExtra(aux[0].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '0010') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: '00:00:00',
                                        ingreso2: aux[0].hora,
                                        atraso: atraso(aux[0].hora),
                                        horasExtra: '00:00:00',
                                        salida2: '00:00:00',
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '0011') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: '00:00:00',
                                        ingreso2: aux[0].hora,
                                        salida2: aux[1].hora,
                                        atraso: atraso(aux[0].hora),
                                        horasExtra: horasExtra(aux[1].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '0100') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: aux[0].hora,
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: '00:00:00',
                                        horasExtra: horasExtra(aux[0].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '0101') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: aux[0].hora,
                                        ingreso2: '00:00:00',
                                        salida2: aux[1].hora,
                                        atraso: '00:00:00',
                                        horasExtra: horasExtra(aux[0].hora, aux[1].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '0110') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: aux[0].hora,
                                        ingreso2: aux[1].hora,
                                        salida2: '00:00:00',
                                        atraso: atraso(aux[1].hora),
                                        horasExtra: horasExtra(aux[0].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '0111') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: aux[0].hora,
                                        ingreso2: aux[1].hora,
                                        salida2: aux[2].hora,
                                        atraso: atraso(aux[1].hora),
                                        horasExtra: horasExtra(aux[0].hora, aux[2].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '1000') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: aux[0].hora,
                                        salida1: '00:00:00',
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: atraso(aux[0].hora),
                                        horasExtra: '00:00:00',
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '1001') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: aux[0].hora,
                                        salida1: '00:00:00',
                                        ingreso2: '00:00:00',
                                        salida2: aux[1].hora,
                                        atraso: atraso(aux[0].hora),
                                        horasExtra: horasExtra(aux[1].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '1010') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: aux[0].hora,
                                        salida1: '00:00:00',
                                        ingreso2: aux[1].hora,
                                        salida2: '00:00:00',
                                        atraso: atraso(aux[0].hora, aux[1].hora),
                                        horasExtra: '00:00:00',
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '1011') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: aux[0].hora,
                                        salida1: '00:00:00',
                                        ingreso2: aux[1].hora,
                                        salida2: aux[2].hora,
                                        atraso: atraso(aux[0].hora, aux[1].hora),
                                        horasExtra: horasExtra(aux[2].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '1100') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: aux[0].hora,
                                        salida1: aux[1].hora,
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: atraso(aux[0].hora),
                                        horasExtra: horasExtra(aux[1].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '1101') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: aux[0].hora,
                                        salida1: aux[1].hora,
                                        ingreso2: '00:00:00',
                                        salida2: aux[2].hora,
                                        atraso: atraso(aux[0].hora),
                                        horasExtra: horasExtra(aux[1].hora, aux[2].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '1110') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: aux[0].hora,
                                        salida1: aux[1].hora,
                                        ingreso2: aux[2].hora,
                                        salida2: '00:00:00',
                                        atraso: atraso(aux[0].hora, aux[2].hora),
                                        horasExtra: horasExtra(aux[1].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }
                                else if (result === '1111') {
                                    array.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: aux[0].hora,
                                        salida1: aux[1].hora,
                                        ingreso2: aux[2].hora,
                                        salida2: aux[3].hora,
                                        atraso: atraso(aux[0].hora, aux[2].hora),
                                        horasExtra: horasExtra(aux[1].hora, aux[3].hora),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'

                                    })
                                }

                                buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')

                            }
                            // console.log(result)
                        } else {
                            // SI NO EXISTE MARCACION ---------------------
                            var suma = 0;
                            var buscarPermiso = await PERMISO.find({ '$and': [{ id_bio: params }, { fechaPermisoIni: buscarFechaAux }] })
                            var buscarFeriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux }).sort({ nameFeriado: 1 })
                            if (buscarPermiso != 0) {
                                var diaPermiso = nameDay
                                var desde = moment(buscarPermiso[0].fechaPermisoIni, "YYYY-MM-DD")
                                var hasta = moment(buscarPermiso[0].fechaPermisoFin, "YYYY-MM-DD")
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        array.push({
                                            id_bio: params,
                                            dia: diaPermiso,
                                            fecha: moment(desde).format("YYYY-MM-DD"),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarPermiso[0].namePermiso
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaPermiso = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        array.push({
                                            id_bio: params,
                                            dia: diaPermiso,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarPermiso[0].namePermiso
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaPermiso = moment(desde).locale('es').format('dddd')
                                        suma++;
                                    }
                                    i = i + suma;
                                    i--
                                }
                            }
                            else if (buscarFeriado != 0) {
                                var diaFeriado = nameDay
                                var desde = moment(buscarFeriado[0].fechaFeriadoIni, 'YYYY-MM-DD')
                                var hasta = moment(buscarFeriado[0].fechaFeriadoFin, 'YYYY-MM-DD')
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        array.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        array.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                }
                            }
                            else {
                                array.push({
                                    id_bio: params,
                                    dia: nameDay,
                                    fecha: buscarFechaAux,
                                    ingreso1: '00:00:00',
                                    salida1: '00:00:00',
                                    ingreso2: '00:00:00',
                                    salida2: '00:00:00',
                                    atraso: '00:00:00',
                                    horasExtra: '00:00:00',
                                    horasTrabajo: '00:00:00',
                                    diaTrabajado: '0.0',
                                    faltas: '1.0',
                                    observaciones: 'Falta'
                                })
                                suma++;
                            }

                            // console.log('no')
                            buscarFechaAux = moment(buscarFechaAux).add(suma, 'day').format('YYYY-MM-DD')
                            // result = contIngreso1 + contSalida1 + contIngreso2 + contSalida2
                            // console.log(result)

                        }
                        // console.log(nameDay + ' <----')
                    } else {
                        //-------------------SI NO ESTA PROGRAMADO EN EL COD-HORARIO-------------
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                        // console.log(nameDay + '---->')
                    }
                } else {
                    //SI NO ESTA DENTRO DEL PARAMETRO FECHAS DE CONTRATO
                    buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    // console.log(' no entra') 
                }
                // console.log(aux)
            }

        } else {
            console.log('entra')
            //---------------HORARIO NOCTURNO------------------------
            for (var i = 0; i < contDias; i++) {
                if (empleado[0].fechaini <= buscarFechaAux && empleado[0].fechafin >= buscarFechaAux) {
                    const getMarcacion = await ASIS.find({ "$and": [{ id_bio: params }, { fecha: buscarFechaAux }] })
                    var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                    // console.log(buscarFechaAux)
                    if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                        var auxPrueba = []
                        var auxPrueba2 = []
                        var unDiaMenos = moment(buscarFechaAux).subtract(1, 'day').format("YYYY-MM-DD")
                        const getMarcacion2 = await ASIS.find({ "$and": [{ id_bio: params }, { fecha: unDiaMenos }] })
                        //----------------------------------
                        // if (getMarcacion2.length > 0) {
                        //     //CALCULOS DE MARCACION DIA ANTES
                        //     const contMarcacion = getMarcacion2.length
                        //     for (var m = 0; m < contMarcacion; m++) {
                        //         var n = moment(`1990-01-01 ${getMarcacion2[m].hora}`).format("HH:mm:ss")
                        //         if (n > ingreNoc) {
                        //             auxPrueba.push(getMarcacion2[m].hora)
                        //         }
                        //         else { contador1++ }
                        //     }
                        // }
                        // else {
                        //     contador1++;
                        //     var hora = moment(`1990-01-01 00:00:00`).format("HH:mm:ss")
                        //     auxPrueba.push(hora)
                        // }

                        //--------------SI EXISTE MARCACIONES DIA ACTUAL O DIA ANTES---------------------------
                        if (getMarcacion.length > 0 || getMarcacion2.length > 0) {
                            //----CALCULOS DE MARCACION DIA ANTES----
                            if (getMarcacion2.length > 0) {
                                const contMarcacion = getMarcacion2.length
                                for (var m = 0; m < contMarcacion; m++) {
                                    var n = moment(`1990-01-01 ${getMarcacion2[m].hora}`).format("HH:mm:ss")
                                    if (n > ingreNoc) {
                                        auxPrueba.push(getMarcacion2[m].hora)
                                    }
                                    // else { 
                                    //     var hora = moment(`1990-01-01 00:00:00`).format("HH:mm:ss")
                                    //     auxPrueba[0]=hora 
                                    // }
                                }
                            }
                            // else {
                            //     var hora = moment(`1990-01-01 00:00:00`).format("HH:mm:ss")
                            //     auxPrueba.push(hora)
                            // }
                            //--------------SI EXISTE MARCACIONES DIA ACTUAL------------------
                            const num = getMarcacion.length
                            // const buscarFeriado
                            for (var j = 0; j < num; j++) {
                                var n = moment(`1990-01-01 ${getMarcacion[j].hora}`).format("HH:mm:ss")
                                // console.log(n)
                                // console.log(salidaNoc)
                                if (n < salidaNoc) {
                                    // console.log('si')
                                    auxPrueba.push(getMarcacion[j].hora)
                                    // console.log(auxPrueba)
                                }
                            }
                            //SI EXISTEN MARCACIONES SIGUIDAS CON MENOS DE 15 MIN
                            for (var k = 0; k < auxPrueba.length; k++) {
                                if (auxPrueba.length > k + 1) {
                                    var hora1 = moment(`1990-01-01 ${auxPrueba[k]}`).add(15, 'm').format("HH:mm:ss")
                                    var hora2 = moment(`1990-01-01 ${auxPrueba[k + 1]}`).format("HH:mm:ss")
                                    if (hora2 < hora1) {
                                        auxPrueba2.push(auxPrueba[k])
                                        auxPrueba.splice(k + 1, 1)
                                    }
                                    else { auxPrueba2.push(auxPrueba[k]) }
                                } else {
                                    var hora = moment(`1990-01-01 ${auxPrueba[k]}`).format("HH:mm:ss")
                                    auxPrueba2.push(hora)
                                }
                            }
                            //----------------ATRASOS NOCTURNOS--------------------------
                            const atrasoNoc = (a) => {
                                // var data=moment()
                                var sum = moment(`1990-01-01 ${a}`).format("HH:mm:ss")
                                if (toleranciaNoc < sum) {
                                    var aux = toleranciaNoc.split(":")
                                    sum = moment(sum).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                    return sum
                                } else return moment(`1990-01-01 00:00:00`).format("HH:mm:ss")
                            }
                            //----------------HORAS EXTRA NOCTURNOS--------------------------
                            const horasExtraNoc = (a) => {
                                var data = moment(`1990-01-01 ${a}`)
                                var data2 = moment(`1990-01-01 ${horaExtraNoc}`)
                                if (data2 < data) {
                                    data2 = moment(data2).format("HH:mm:ss")
                                    var aux = data2.split(":")
                                    data = moment(data).subtract(parseInt(aux[0]), "h").subtract(parseInt(aux[1]), "m").format("HH:mm:ss")
                                    return data
                                }
                                else return moment(`1990-01-01 00:00:00`).format("HH:mm:ss")

                            }
                            //--------------PRUEBAS MARCACIONES--------------------------
                            const numAux = auxPrueba2.length
                            if (auxPrueba2.length > 0) {
                                if (numAux == 1) {
                                    //NO ENTRO DIA ANTES PERO SI AL DIAL ACTUAL
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: auxPrueba2[0],
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: '00:00:00',
                                        horasExtra: horasExtraNoc(auxPrueba2[0]),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: 'verificar marcaci??n'
                                    })
                                }
                                else if (numAux == 2) {
                                    //ENTR?? AL DIA ANTES Y TAMBIEN AL DIA ACTUAL
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: auxPrueba2[1],
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: atrasoNoc(auxPrueba2[0]),
                                        horasExtra: horasExtraNoc(auxPrueba2[1]),
                                        diaTrabajado: '1.0',
                                        faltas: '0.0',
                                        observaciones: ''
                                    })

                                } else if (numAux == 0) {
                                    //NO ENTRA AL ACRTUAL NI AL DIA ANTES
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: "00:00:00",
                                        salida1: "00:00:00",
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        // atraso: atraso(auxPrueba2[0]),
                                        // horasExtra: horasExtra(aux[0].hora),
                                        diaTrabajado: '0.0',
                                        faltas: '1.0',
                                        observaciones: 'Falta'
                                    })
                                }
                                buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                            } else {
                                //ENTRA A GET_MARCACIONES Y GET_MARCACIONES2 PERO NO PUSHEA NUNGUNA MARCACION
                                var suma = 0;
                                var buscarPermiso = await PERMISO.find({ '$and': [{ id_bio: params }, { fechaPermisoIni: buscarFechaAux }] })
                                var buscarFeriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux }).sort({ nameFeriado: 1 })
                                if (buscarPermiso.length > 0) {
                                    var diaPermiso = nameDay
                                    var desde = moment(buscarPermiso[0].fechaPermisoIni, "YYYY-MM-DD")
                                    var hasta = moment(buscarPermiso[0].fechaPermisoFin, "YYYY-MM-DD")
                                    if (hasta <= buscarFechaFin) {
                                        while (desde.isSameOrBefore(hasta)) {
                                            auxPrueba3.push({
                                                id_bio: params,
                                                dia: diaPermiso,
                                                fecha: moment(desde).format("YYYY-MM-DD"),
                                                ingreso1: '00:00:00',
                                                salida1: '00:00:00',
                                                ingreso2: '00:00:00',
                                                salida2: '00:00:00',
                                                atraso: '00:00:00',
                                                horasExtra: '00:00:00',
                                                horasTrabajo: '00:00:00',
                                                diaTrabajado: '1.0',
                                                faltas: '0.0',
                                                observaciones: buscarPermiso[0].namePermiso
                                            })
                                            desde = moment(desde).add(1, 'day')
                                            diaPermiso = moment(desde).locale('es').format('dddd')
                                            suma++
                                        }
                                        i = i + suma
                                        i--
                                    } else if (hasta >= buscarFechaFinAux) {
                                        while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                            auxPrueba3.push({
                                                id_bio: params,
                                                dia: diaPermiso,
                                                fecha: moment(desde).format('YYYY-MM-DD'),
                                                ingreso1: '00:00:00',
                                                salida1: '00:00:00',
                                                ingreso2: '00:00:00',
                                                salida2: '00:00:00',
                                                atraso: '00:00:00',
                                                horasExtra: '00:00:00',
                                                horasTrabajo: '00:00:00',
                                                diaTrabajado: '1.0',
                                                faltas: '0.0',
                                                observaciones: buscarPermiso[0].namePermiso
                                            })
                                            desde = moment(desde).add(1, 'day')
                                            diaPermiso = moment(desde).locale('es').format('dddd')
                                            suma++;
                                        }
                                        i = i + suma;
                                        i--;
                                    }
                                }
                                else if (buscarFeriado.length > 0) {
                                    // console.log('entra a feriado')
                                    var diaFeriado = nameDay
                                    var desde = moment(buscarFeriado[0].fechaFeriadoIni, 'YYYY-MM-DD')
                                    var hasta = moment(buscarFeriado[0].fechaFeriadoFin, 'YYYY-MM-DD')
                                    if (hasta <= buscarFechaFin) {
                                        while (desde.isSameOrBefore(hasta)) {
                                            auxPrueba3.push({
                                                id_bio: params,
                                                dia: diaFeriado,
                                                fecha: moment(desde).format('YYYY-MM-DD'),
                                                ingreso1: '00:00:00',
                                                salida1: '00:00:00',
                                                ingreso2: '00:00:00',
                                                salida2: '00:00:00',
                                                atraso: '00:00:00',
                                                horasExtra: '00:00:00',
                                                horasTrabajo: '00:00:00',
                                                diaTrabajado: '1.0',
                                                faltas: '0.0',
                                                observaciones: buscarFeriado[0].nameFeriado
                                            })
                                            desde = moment(desde).add(1, 'day')
                                            diaFeriado = moment(desde).locale('es').format('dddd')
                                            suma++
                                        }
                                        i = i + suma;
                                        i--;
                                    } else if (hasta >= buscarFechaFinAux) {
                                        while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                            auxPrueba3.push({
                                                id_bio: params,
                                                dia: diaFeriado,
                                                fecha: moment(desde).format('YYYY-MM-DD'),
                                                ingreso1: '00:00:00',
                                                salida1: '00:00:00',
                                                ingreso2: '00:00:00',
                                                salida2: '00:00:00',
                                                atraso: '00:00:00',
                                                horasExtra: '00:00:00',
                                                horasTrabajo: '00:00:00',
                                                diaTrabajado: '1.0',
                                                faltas: '0.0',
                                                observaciones: buscarFeriado[0].nameFeriado
                                            })
                                            desde = moment(desde).add(1, 'day')
                                            diaFeriado = moment(desde).locale('es').format('dddd')
                                            suma++
                                        }
                                        i = i + suma;
                                        i--;
                                    }
                                } else {
                                    auxPrueba3.push({
                                        id_bio: params,
                                        dia: nameDay,
                                        fecha: buscarFechaAux,
                                        ingreso1: '00:00:00',
                                        salida1: '00:00:00',
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: '00:00:00',
                                        horasExtra: '00:00:00',
                                        horasTrabajo: '00:00:00',
                                        diaTrabajado: '0.0',
                                        faltas: '1.0',
                                        observaciones: 'Falta'
                                    })
                                    suma++;
                                }
                                buscarFechaAux = moment(buscarFechaAux).add(suma, 'day').format('YYYY-MM-DD')
                            }
                        } else {
                            //---SI NO EXISTE MARCACION DIAL ACTUAL NI DIA ANTES--------------
                            var suma = 0;
                            var buscarPermiso = await PERMISO.find({ '$and': [{ id_bio: params }, { fechaPermisoIni: buscarFechaAux }] })
                            var buscarFeriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux }).sort({ nameFeriado: 1 })
                            if (buscarPermiso.length > 0) {
                                var diaPermiso = nameDay
                                var desde = moment(buscarPermiso[0].fechaPermisoIni, "YYYY-MM-DD")
                                var hasta = moment(buscarPermiso[0].fechaPermisoFin, "YYYY-MM-DD")
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaPermiso,
                                            fecha: moment(desde).format("YYYY-MM-DD"),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarPermiso[0].namePermiso
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaPermiso = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma
                                    i--
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaPermiso,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarPermiso[0].namePermiso
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaPermiso = moment(desde).locale('es').format('dddd')
                                        suma++;
                                    }
                                    i = i + suma;
                                    i--;
                                }
                            }
                            else if (buscarFeriado.length > 0) {
                                // console.log('entra a feriado')
                                var diaFeriado = nameDay
                                var desde = moment(buscarFeriado[0].fechaFeriadoIni, 'YYYY-MM-DD')
                                var hasta = moment(buscarFeriado[0].fechaFeriadoFin, 'YYYY-MM-DD')
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasTrabajo: '00:00:00',
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                }
                            } else {
                                auxPrueba3.push({
                                    id_bio: params,
                                    dia: nameDay,
                                    fecha: buscarFechaAux,
                                    ingreso1: '00:00:00',
                                    salida1: '00:00:00',
                                    ingreso2: '00:00:00',
                                    salida2: '00:00:00',
                                    atraso: '00:00:00',
                                    horasExtra: '00:00:00',
                                    horasTrabajo: '00:00:00',
                                    diaTrabajado: '0.0',
                                    faltas: '1.0',
                                    observaciones: 'Falta'
                                })
                                suma++;
                            }
                            buscarFechaAux = moment(buscarFechaAux).add(suma, 'day').format('YYYY-MM-DD')
                        }
                    } else {
                        //---SI NO ESTA PROGRAMADO CON LOS CODIGO DE DIAS---
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                } else {
                    //----SI NO ESTA DENTRO DEL PARAMETRO FECHAS DE CONTRATO
                    buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                }
                // const contArray=array.length
                // for(var i=0;i<contArray;i++){
                //     const existe=await KARDEXASISTENCIA.find({"$and":[{id_bio:array[i].id_bio},{fecha:array[i].fecha}]}).countDocuments()
                //     if(existe==0){
                //         const kardexAsistencia=new KARDEXASISTENCIA(array[i])
                //         kardexAsistencia.save()
                //     }else{
                //         await KARDEXASISTENCIA.deleteOne({fecha:array[i].fecha})
                //         const kardexAsistencia= new KARDEXASISTENCIA(array[i])
                //         kardexAsistencia.save()
                //     }
                // }

                // console.log(array)
            }
        }
        console.log(auxPrueba3)
        res.status(200).json(array)
    } else {
        console.log('empleado no existe')
    }

    // console.log(empleado)

})

//----------------------PLANILLA KARDEX ASISTENCIA 2------------------------
router.get("/nuevoTodo/:id", async (req, res) => {
    const params = req.params.id
    const fechas = req.query
    const empleado = await EMPLEADO.find({ id_bio: params })
    if (empleado.length > 0) {
        //SI EXISTE EMPLEADO
        var fechaini = new Date(empleado[0].fechaini)
        var fechafin = new Date(empleado[0].fechafin)
        //----sumar dias de contrato-----------------------------
        var contFechas = 0
        const sumarDias = (fechaini, dias) => {
            fechaini.setDate(fechaini.getDate() + dias)
            return fechaini
        }
        while (fechaini <= fechafin) {
            sumarDias(fechaini, 1)
            contFechas++
        }
        //------busqueda de fechas ----------------------
        var buscarFechaIni = new Date(fechas.fechaini)
        var buscarFechaFin = new Date(fechas.fechafin)
        var buscarFechaFinAux = moment(fechas.fechafin) // auxiliar para el caso de permisos y feriados que no entren al primer if por culpa de moment()
        var buscarFechaAux = moment(fechas.fechaini).format('YYYY-MM-DD')

        var contDias = 0
        const contarDias = (buscarFechaIni, dias) => {
            buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
            return buscarFechaIni
        }
        while (buscarFechaIni <= buscarFechaFin) {
            contarDias(buscarFechaIni, 1)
            contDias++
        }
        //--------HORARIOS----------------------------
        //-------------------NOCTURNOS----------------------------
        const ingreNoc = moment(`1990-01-01 ${empleado[0].ingreso1}`).subtract(1, 'h').format("HH:mm:ss")
        const salidaNoc = moment(`1990-01-01 ${empleado[0].salida1}`).add(2, 'h').format("HH:mm:ss")
        //------------TOLERANCIA NOCTURNOS------------------
        var toleranciaNoc = moment(`1990-01-01 ${empleado[0].ingreso1}`).add(empleado[0].tolerancia, 'm').format("HH:mm:ss")
        var horaExtraNoc = moment(`1990-01-01 ${empleado[0].salida1}`).format("HH:mm:ss")

        //--------TOLERANCIAS--------------------------
        const tolerancia = empleado[0].tolerancia
        var tolerancia1 = moment(`1990-01-01 ${empleado[0].ingreso1}`).add(tolerancia, 'm').format("HH:mm:ss")
        var tolerancia2 = moment(`1990-01-01 ${empleado[0].ingreso2}`).add(tolerancia, 'm').format("HH:mm:ss")

        //--------HORAS EXTRAS--------------------------
        var horaextra1 = moment(`1990-01-01 ${empleado[0].salida1}`).format("HH:mm:ss")
        var horaextra2 = moment(`1990-01-01 ${empleado[0].salida2}`).format("HH:mm:ss")
        //-------------------OBTENER EL CODIGO DE HORARIO----------------------
        var codHorario = empleado[0].cod_horario
        codHorario = codHorario.split("")
        arrayDiasTrabajo = []
        if (codHorario[0] === '1') {
            arrayDiasTrabajo.push('lunes')
        }
        if (codHorario[1] === '1') {
            arrayDiasTrabajo.push('martes')
        }
        if (codHorario[2] === '1') {
            arrayDiasTrabajo.push('mi??rcoles')
        }
        if (codHorario[3] === '1') {
            arrayDiasTrabajo.push('jueves')
        }
        if (codHorario[4] === '1') {
            arrayDiasTrabajo.push('viernes')
        }
        if (codHorario[5] === '1') {
            arrayDiasTrabajo.push('s??bado')
        }
        if (codHorario[6] === '1') {
            arrayDiasTrabajo.push('domingo')
        }
        console.log(arrayDiasTrabajo)
        //----------CALCULOS DE KARDEX DE ASISTENCIA-----------------
        var array = []
        var auxPrueba3 = []

        //------------HORARIO CONTINUO----------------------------
        if (empleado[0].cod_estH === '1') {
            for (var i = 0; i < contDias; i++) {
                if (empleado[0].fechaini <= buscarFechaAux && empleado[0].fechafin >= buscarFechaAux) {
                    //SI ESTA DENTRO DEL PARAMETRO FECHAS DE CONTRATO
                    const getMarcacion = await ASIS.find({ "$and": [{ id_bio: params }, { fecha: buscarFechaAux }] })
                    var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                    if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                        var auxPrueba = []
                        var auxPrueba2 = []
                        if (getMarcacion.length > 0) {
                            //SI EXISTE MARCACION
                            const num = getMarcacion.length
                            const buscarFeriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux }).sort({ nameFeriado: 1 })
                            if (buscarFeriado.length > 0) {
                                //----FERIADOS------------------
                                var suma = 0;
                                var diaFeriado = nameDay
                                var desde = moment(buscarFeriado[0].fechaFeriadoIni, 'YYYY-MM-DD')
                                var hasta = moment(buscarFeriado[0].fechaFeriadoFin, 'YYYY-MM-DD')
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado,
                                            observaciones2: "Feriado",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado,
                                            observaciones2: "Feriado",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                }
                                buscarFechaAux = moment(buscarFechaAux).add(suma, 'day').format('YYYY-MM-DD')
                            } else {
                                //---------------PRUEBAS-----------------
                                for (var n = 0; n < num; n++) {
                                    auxPrueba.push(getMarcacion[n].hora)
                                }
                                //----CALCULOS PARA MARCACIONES CON DIFERENCIA DE 15MIN------
                                for (var m = 0; m < auxPrueba.length; m++) {
                                    if (auxPrueba.length > m + 1) {
                                        var hora1 = moment(`1990-01-01 ${auxPrueba[m]}`).add(15, 'm').format("HH:mm:ss")
                                        var hora2 = moment(`1990-01-01 ${auxPrueba[m + 1]}`).format("HH:mm:ss")
                                        if (hora2 < hora1) {
                                            auxPrueba2.push(auxPrueba[m])
                                            auxPrueba.splice(m + 1, 1)
                                        } else {
                                            auxPrueba2.push(auxPrueba[m])
                                        }
                                        // console.log(hora1)
                                        // console.log(hora2)
                                    } else {
                                        var hora = moment(`1990-01-01 ${auxPrueba[m]}`).format("HH:mm:ss")
                                        auxPrueba2.push(hora)
                                        // console.log(hora)
                                    }
                                }
                                //------------------------HORARIO NOCTURNO-------------------------------------------
                                //-----------ATRASOS----------------------------------
                                const una = new Date('1990-01-01 00:00:00')
                                const atraso = (a, b) => {
                                    var sum1 = atraso1(a)
                                    var sum2 = atraso2(b)
                                    sum1 = sum1.split(":")
                                    var sum = new Date(`1990-01-01 ${sum2}`)
                                    sum = moment(sum).add(parseInt(sum1[0]), 'h').add(parseInt(sum1[1]), 'm').add(parseInt(sum1[2]), 's').format("HH:mm:ss")
                                    // console.log(sum)
                                    return sum
                                }
                                const atraso1 = (e) => {
                                    var data1 = new Date(`1990-01-01 ${e}`)
                                    if (e > tolerancia1) {
                                        var aux = tolerancia1.split(":")
                                        data1 = moment(data1).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                        return data1
                                    } else return moment(una).format("HH:mm:ss")
                                }
                                const atraso2 = (e) => {
                                    // console.log(e)
                                    // console.log(tolerancia2)
                                    var data2 = new Date(`1990-01-01 ${e}`)
                                    if (e > tolerancia2) {
                                        // data=moment(data)
                                        var aux = tolerancia2.split(":")
                                        data2 = moment(data2).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                        // console.log(data)
                                        return data2
                                    } else return moment(una).format("HH:mm:ss")
                                }
                                //------------HORAS EXTRAS------------------------------------
                                const dos = new Date(`1990-01-01 00:00:00`)
                                const horasExtra = (a, b) => {
                                    var sum1 = horasExtra1(a)
                                    var sum2 = horasExtra2(b)
                                    sum1 = sum1.split(":")
                                    var sum = new Date(`1990-01-01 ${sum2}`)
                                    sum = moment(sum).add(parseInt(sum1[0]), 'h').add(parseInt(sum1[1]), 'm').add(parseInt(sum1[2]), 's').format("HH:mm:ss")
                                    // console.log(sum)
                                    return sum

                                }
                                const horasExtra1 = (e) => {
                                    var data1 = new Date(`1990-01-01 ${e}`)
                                    if (e > horaextra1) {
                                        var aux = horaextra1.split(":")
                                        data1 = moment(data1).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                        return data1
                                    } else return moment(dos).format("HH:mm:ss")
                                }
                                const horasExtra2 = (e) => {
                                    var data2 = new Date(`1990-01-01 ${e}`)
                                    if (e > horaextra2) {
                                        var aux = horaextra2.split(":")
                                        data2 = moment(data2).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                        return data2
                                    } else return moment(dos).format("HH:mm:ss")
                                }
                                //-----------------HORAS DE TRABAJO---------------------
                                const horasTrabajo = (a, b, c, d) => {
                                    if (a != undefined && b != undefined && c != undefined && d != undefined) {
                                        var data1 = moment(`1990-01-01 ${a}`)
                                        var data2 = moment(`1990-01-01 ${b}`)
                                        var data3 = moment(`1990-01-01 ${c}`)
                                        var data4 = moment(`1990-01-01 ${d}`)
                                        var duration1 = moment.duration(data2.diff(data1)).asHours()
                                        var duration2 = moment.duration(data4.diff(data3)).asHours()
                                        var durationTotal = duration1 + duration2
                                        var result = 0;
                                        if (durationTotal > 7) {
                                            result = 1.0
                                        } else { result = 0.5 }
                                        return { durationTotal, result }

                                    }
                                    else if (a != undefined && b != undefined && c != undefined) {
                                        var data1 = moment(`1990-01-01 ${a}`)
                                        var data2 = moment(`1990-01-01 ${b}`)
                                        // var duration=moment.duration(data2.diff(data1)).asMinutes()
                                        var duration = moment.duration(data2.diff(data1)).asHours()
                                        var result = 0;
                                        if (duration > 7) {
                                            result = 0
                                        } else {
                                            result = 0.5
                                        }
                                        return { duration, result }

                                    }
                                    else if (a != undefined && b != undefined) {
                                        var data1 = moment(`1990-01-01 ${a}`)
                                        var data2 = moment(`1990-01-01 ${b}`)
                                        // var duration=moment.duration(data2.diff(data1)).asMinutes()
                                        var duration = moment.duration(data2.diff(data1)).asHours()
                                        var result = 0;
                                        if (duration > 7) {
                                            result = 0
                                        } else {
                                            result = 0.5
                                        }
                                        return { duration, result }

                                    } else if (a != undefined || b != undefined || c != undefined || d != undefined) {
                                        var duration = 0
                                        var result = 0.5
                                        return { duration, result }
                                    }


                                }
                                //-------------------------PRUEBAS MARCACIONES------------------------
                                const numAux = auxPrueba2.length
                                if (numAux == 1) {
                                    const { duration, result } = horasTrabajo(auxPrueba2[0])
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: '00:00:00',
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: atraso(auxPrueba2[0]),
                                        horasExtra: "00:00:00",
                                        diaTrabajado: '1.0',
                                        horasDeTrabajo: duration.toFixed(2),
                                        faltas: result.toFixed(2),
                                        observaciones: 'verificar marcaci??n',
                                        observaciones2: "",
                                    })
                                }
                                else if (numAux == 2) {
                                    const { duration, result } = horasTrabajo(auxPrueba2[0], auxPrueba2[1])

                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: auxPrueba2[1],
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: atraso(auxPrueba2[0]),
                                        horasExtra: horasExtra(auxPrueba2[1]),
                                        horasDeTrabajo: duration.toFixed(2),
                                        diaTrabajado: '1.0',
                                        faltas: result.toFixed(2),
                                        observaciones: 'verificar marcaci??n',
                                        observaciones2: "",
                                    })
                                }
                                else if (numAux == 3) {
                                    const { duration, result } = horasTrabajo(auxPrueba2[0], auxPrueba2[1])
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: auxPrueba2[1],
                                        ingreso2: auxPrueba2[2],
                                        salida2: '00:00:00',
                                        atraso: atraso(auxPrueba2[0], auxPrueba2[2]),
                                        horasExtra: horasExtra(auxPrueba2[1]),
                                        horasDeTrabajo: duration.toFixed(2),
                                        diaTrabajado: '1.0',
                                        faltas: result.toFixed(2),
                                        observaciones: 'verificar marcaci??n',
                                        observaciones2: "",
                                    })
                                }
                                else if (numAux == 4) {
                                    const { duration, result } = horasTrabajo(auxPrueba2[0], auxPrueba2[1], auxPrueba2[3], auxPrueba2[4])
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: auxPrueba2[1],
                                        ingreso2: auxPrueba2[2],
                                        salida2: auxPrueba2[3],
                                        atraso: atraso(auxPrueba2[0], auxPrueba2[2]),
                                        horasExtra: horasExtra(auxPrueba2[1], auxPrueba2[3]),
                                        horasDeTrabajo: duration.toFixed(2),
                                        diaTrabajado: '1.0',
                                        faltas: result.toFixed(2),
                                        observaciones: '',
                                        observaciones2: "",
                                    })
                                }

                                //------------------------------------------------------
                                buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                            }
                        } else {
                            //SI NO EXISTE MARCACION
                            var suma = 0;
                            var buscarPermiso = await PERMISO.find({ '$and': [{ id_bio: params }, { fechaPermisoIni: buscarFechaAux }] })
                            var buscarFeriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux }).sort({ nameFeriado: 1 })
                            if (buscarPermiso != 0) {
                                var diaPermiso = nameDay
                                var desde = moment(buscarPermiso[0].fechaPermisoIni, "YYYY-MM-DD")
                                var hasta = moment(buscarPermiso[0].fechaPermisoFin, "YYYY-MM-DD")
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaPermiso,
                                            fecha: moment(desde).format("YYYY-MM-DD"),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarPermiso[0].namePermiso,
                                            observaciones2: "Permiso",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaPermiso = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaPermiso,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarPermiso[0].namePermiso,
                                            observaciones2: "Permiso",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaPermiso = moment(desde).locale('es').format('dddd')
                                        suma++;
                                    }
                                    i = i + suma;
                                    i--
                                }
                            }
                            else if (buscarFeriado != 0) {
                                var diaFeriado = nameDay
                                var desde = moment(buscarFeriado[0].fechaFeriadoIni, 'YYYY-MM-DD')
                                var hasta = moment(buscarFeriado[0].fechaFeriadoFin, 'YYYY-MM-DD')
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado,
                                            observaciones2: "Feriado",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado,
                                            observaciones2: "Feriado",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                }
                            }
                            else {
                                auxPrueba3.push({
                                    id_bio: params,
                                    dia: nameDay,
                                    fecha: buscarFechaAux,
                                    ingreso1: '00:00:00',
                                    salida1: '00:00:00',
                                    ingreso2: '00:00:00',
                                    salida2: '00:00:00',
                                    atraso: '00:00:00',
                                    horasExtra: '00:00:00',
                                    horasDeTrabajo: "0:00",
                                    diaTrabajado: '0.0',
                                    faltas: '1.0',
                                    observaciones: 'Falta',
                                    observaciones2: "Falta",
                                })
                                suma++;
                            }

                            // console.log('no')
                            buscarFechaAux = moment(buscarFechaAux).add(suma, 'day').format('YYYY-MM-DD')
                        }
                    } else {
                        //-------------------SI NO ESTA PROGRAMADO EN EL COD-HORARIO-------------
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }
                } else {
                    //SI NO ESTA DENTRO DEL PARAMETRO FECHAS DE CONTRATO
                    buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                }
            }
        }
        else {
            //---------HORARIO NOCTURNO---------------------
            for (var i = 0; i < contDias; i++) {
                if (empleado[0].fechaini <= buscarFechaAux && empleado[0].fechafin >= buscarFechaAux) {
                    const getMarcacion = await ASIS.find({ "$and": [{ id_bio: params }, { fecha: buscarFechaAux }] })
                    var nameDay = moment(buscarFechaAux).locale('es').format('dddd')
                    if (nameDay === arrayDiasTrabajo[0] || nameDay === arrayDiasTrabajo[1] || nameDay === arrayDiasTrabajo[2] || nameDay === arrayDiasTrabajo[3] || nameDay === arrayDiasTrabajo[4] || nameDay === arrayDiasTrabajo[5] || nameDay === arrayDiasTrabajo[6]) {
                        var auxPrueba = []
                        var auxPrueba2 = []
                        var unDiaMenos = moment(buscarFechaAux).subtract(1, 'day').format("YYYY-MM-DD")
                        const getMarcacion2 = await ASIS.find({ "$and": [{ id_bio: params }, { fecha: unDiaMenos }] })
                        //--------------SI EXISTE MARCACIONES DIA ACTUAL O DIA ANTES---------------------------
                        if (getMarcacion.length > 0 || getMarcacion2.length > 0) {
                            //----CALCULOS DE MARCACION DIA ANTES----
                            if (getMarcacion2.length > 0) {
                                const contMarcacion = getMarcacion2.length
                                for (var m = 0; m < contMarcacion; m++) {
                                    var n = moment(`1990-01-01 ${getMarcacion2[m].hora}`).format("HH:mm:ss")
                                    if (n > ingreNoc) {
                                        auxPrueba.push(getMarcacion2[m].hora)
                                    }
                                }
                            }
                            //--------------SI EXISTE MARCACIONES DIA ACTUAL------------------
                            const num = getMarcacion.length
                            // const buscarFeriado
                            for (var j = 0; j < num; j++) {
                                var n = moment(`1990-01-01 ${getMarcacion[j].hora}`).format("HH:mm:ss")
                                if (n < salidaNoc) {
                                    auxPrueba.push(getMarcacion[j].hora)
                                }
                            }
                            //----------SI EXISTEN MARCACIONES SIGUIDAS CON MENOS DE 15 MIN-----
                            for (var k = 0; k < auxPrueba.length; k++) {
                                if (auxPrueba.length > k + 1) {
                                    var hora1 = moment(`1990-01-01 ${auxPrueba[k]}`).add(15, 'm').format("HH:mm:ss")
                                    var hora2 = moment(`1990-01-01 ${auxPrueba[k + 1]}`).format("HH:mm:ss")
                                    if (hora2 < hora1) {
                                        auxPrueba2.push(auxPrueba[k])
                                        auxPrueba.splice(k + 1, 1)
                                    }
                                    else { auxPrueba2.push(auxPrueba[k]) }
                                } else {
                                    var hora = moment(`1990-01-01 ${auxPrueba[k]}`).format("HH:mm:ss")
                                    auxPrueba2.push(hora)
                                }
                            }
                            //----------------ATRASOS NOCTURNOS--------------------------
                            const atrasoNoc = (a) => {
                                // var data=moment()
                                var data = moment(`1990-01-01 ${a}`)
                                var data2 = moment(`1990-01-01 ${toleranciaNoc}`).format("HH:mm:ss")
                                if (data2 < data) {
                                    data2 = moment(data2).format("HH:mm:ss")
                                    var aux = toleranciaNoc.split(":")
                                    data = moment(data).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                                    return data
                                } else return moment(`1990-01-01 00:00:00`).format("HH:mm:ss")
                            }
                            //----------------HORAS EXTRA NOCTURNOS--------------------------
                            const horasExtraNoc = (a) => {
                                var data = moment(`1990-01-01 ${a}`)
                                var data2 = moment(`1990-01-01 ${horaExtraNoc}`)
                                if (data2 < data) {
                                    data2 = moment(data2).format("HH:mm:ss")
                                    var aux = data2.split(":")
                                    data = moment(data).subtract(parseInt(aux[0]), "h").subtract(parseInt(aux[1]), "m").format("HH:mm:ss")
                                    return data
                                }
                                else return moment(`1990-01-01 00:00:00`).format("HH:mm:ss")

                            }
                            //--------------HORAS DE TRABAJO---------------------
                            const horasTrabajo = (a, b) => {
                                if (a != undefined && b != undefined) {
                                    var data1 = moment(`1990-01-01 ${a}`)
                                    var data2 = moment(`1990-01-02 ${b}`)
                                    var duration = moment.duration(data2.diff(data1)).asHours()
                                    var result = 0;
                                    if (duration > 7) {
                                        result = 0
                                    } else { result = 0.5 }
                                    return { duration, result }
                                } else if (a != undefined || b != undefined) {
                                    var duration = 0
                                    var result = 0.5
                                    return { duration, result }
                                }
                            }
                            //--------------PRUEBAS MARCACIONES--------------------------
                            const numAux = auxPrueba2.length
                            if (auxPrueba2.length > 0) {
                                const { duration, result } = horasTrabajo(auxPrueba2[0])
                                if (numAux == 1) {
                                    //NO ENTRO DIA ANTES PERO SI AL DIAL ACTUAL
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: '00:00:00',
                                        salida1: auxPrueba2[0],
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: '00:00:00',
                                        horasExtra: horasExtraNoc(auxPrueba2[0]),
                                        diaTrabajado: '1.0',
                                        horasDeTrabajo: duration.toFixed(2),
                                        faltas: result.toFixed(2),
                                        observaciones: 'verificar marcaci??n',
                                        observaciones2: "",
                                    })
                                }
                                else if (numAux == 2) {
                                    //ENTR?? AL DIA ANTES Y TAMBIEN AL DIA ACTUAL
                                    const { duration, result } = horasTrabajo(auxPrueba2[0], auxPrueba2[1])
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: auxPrueba2[0],
                                        salida1: auxPrueba2[1],
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: atrasoNoc(auxPrueba2[0]),
                                        horasExtra: horasExtraNoc(auxPrueba2[1]),
                                        diaTrabajado: '1.0',
                                        horasDeTrabajo: duration.toFixed(2),
                                        faltas: result.toFixed(2),
                                        observaciones: '',
                                        observaciones2: "",
                                    })

                                } else if (numAux == 0) {
                                    //NO ENTRA AL ACRTUAL NI AL DIA ANTES
                                    auxPrueba3.push({
                                        id_bio: params,
                                        fecha: buscarFechaAux,
                                        dia: nameDay,
                                        ingreso1: "00:00:00",
                                        salida1: "00:00:00",
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: "00:00:00",
                                        horasExtra: "00:00:00",
                                        diaTrabajado: '0.0',
                                        horasDeTrabajo: "0:00",
                                        faltas: '1.0',
                                        observaciones: 'Falta',
                                        observaciones2: "",
                                    })
                                }
                                buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                            } else {
                                //ENTRA A GET_MARCACIONES Y GET_MARCACIONES2 PERO NO PUSHEA NUNGUNA MARCACION
                                var suma = 0;
                                var buscarPermiso = await PERMISO.find({ '$and': [{ id_bio: params }, { fechaPermisoIni: buscarFechaAux }] })
                                //---NOCTURNOS NO TIENEN FERIADO---------
                                // var buscarFeriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux }).sort({ nameFeriado: 1 })
                                if (buscarPermiso.length > 0) {
                                    var diaPermiso = nameDay
                                    var desde = moment(buscarPermiso[0].fechaPermisoIni, "YYYY-MM-DD")
                                    var hasta = moment(buscarPermiso[0].fechaPermisoFin, "YYYY-MM-DD")
                                    if (hasta <= buscarFechaFin) {
                                        while (desde.isSameOrBefore(hasta)) {
                                            auxPrueba3.push({
                                                id_bio: params,
                                                dia: diaPermiso,
                                                fecha: moment(desde).format("YYYY-MM-DD"),
                                                ingreso1: '00:00:00',
                                                salida1: '00:00:00',
                                                ingreso2: '00:00:00',
                                                salida2: '00:00:00',
                                                atraso: '00:00:00',
                                                horasExtra: '00:00:00',
                                                horasDeTrabajo: "0:00",
                                                diaTrabajado: '1.0',
                                                faltas: '0.0',
                                                observaciones: buscarPermiso[0].namePermiso,
                                                observaciones2: "Permiso",
                                            })
                                            desde = moment(desde).add(1, 'day')
                                            diaPermiso = moment(desde).locale('es').format('dddd')
                                            suma++
                                        }
                                        i = i + suma
                                        i--
                                    } else if (hasta >= buscarFechaFinAux) {
                                        while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                            auxPrueba3.push({
                                                id_bio: params,
                                                dia: diaPermiso,
                                                fecha: moment(desde).format('YYYY-MM-DD'),
                                                ingreso1: '00:00:00',
                                                salida1: '00:00:00',
                                                ingreso2: '00:00:00',
                                                salida2: '00:00:00',
                                                atraso: '00:00:00',
                                                horasExtra: '00:00:00',
                                                horasDeTrabajo: "0:00",
                                                diaTrabajado: '1.0',
                                                faltas: '0.0',
                                                observaciones: buscarPermiso[0].namePermiso,
                                                observaciones2: "Permiso",
                                            })
                                            desde = moment(desde).add(1, 'day')
                                            diaPermiso = moment(desde).locale('es').format('dddd')
                                            suma++;
                                        }
                                        i = i + suma;
                                        i--;
                                    }
                                }
                                //-----NOCTURNOS NO TIENEN FERIADO-------------
                                // else if (buscarFeriado.length > 0) {
                                //     // console.log('entra a feriado')
                                //     var diaFeriado = nameDay
                                //     var desde = moment(buscarFeriado[0].fechaFeriadoIni, 'YYYY-MM-DD')
                                //     var hasta = moment(buscarFeriado[0].fechaFeriadoFin, 'YYYY-MM-DD')
                                //     if (hasta <= buscarFechaFin) {
                                //         while (desde.isSameOrBefore(hasta)) {
                                //             auxPrueba3.push({
                                //                 id_bio: params,
                                //                 dia: diaFeriado,
                                //                 fecha: moment(desde).format('YYYY-MM-DD'),
                                //                 ingreso1: '00:00:00',
                                //                 salida1: '00:00:00',
                                //                 ingreso2: '00:00:00',
                                //                 salida2: '00:00:00',
                                //                 atraso: '00:00:00',
                                //                 horasExtra: '00:00:00',
                                //                 horasDeTrabajo: "0:00",
                                //                 diaTrabajado: '1.0',
                                //                 faltas: '0.0',
                                //                 observaciones: buscarFeriado[0].nameFeriado
                                //             })
                                //             desde = moment(desde).add(1, 'day')
                                //             diaFeriado = moment(desde).locale('es').format('dddd')
                                //             suma++
                                //         }
                                //         i = i + suma;
                                //         i--;
                                //     } else if (hasta >= buscarFechaFinAux) {
                                //         while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                //             auxPrueba3.push({
                                //                 id_bio: params,
                                //                 dia: diaFeriado,
                                //                 fecha: moment(desde).format('YYYY-MM-DD'),
                                //                 ingreso1: '00:00:00',
                                //                 salida1: '00:00:00',
                                //                 ingreso2: '00:00:00',
                                //                 salida2: '00:00:00',
                                //                 atraso: '00:00:00',
                                //                 horasExtra: '00:00:00',
                                //                 horasDeTrabajo: "0:00",
                                //                 diaTrabajado: '1.0',
                                //                 faltas: '0.0',
                                //                 observaciones: buscarFeriado[0].nameFeriado
                                //             })
                                //             desde = moment(desde).add(1, 'day')
                                //             diaFeriado = moment(desde).locale('es').format('dddd')
                                //             suma++
                                //         }
                                //         i = i + suma;
                                //         i--;
                                //     }
                                // } 
                                else {
                                    auxPrueba3.push({
                                        id_bio: params,
                                        dia: nameDay,
                                        fecha: buscarFechaAux,
                                        ingreso1: '00:00:00',
                                        salida1: '00:00:00',
                                        ingreso2: '00:00:00',
                                        salida2: '00:00:00',
                                        atraso: '00:00:00',
                                        horasExtra: '00:00:00',
                                        horasDeTrabajo: "0:00",
                                        diaTrabajado: '0.0',
                                        faltas: '1.0',
                                        observaciones: 'Falta',
                                        observaciones2: "",
                                    })
                                    suma++;
                                }
                                buscarFechaAux = moment(buscarFechaAux).add(suma, 'day').format('YYYY-MM-DD')
                            }
                        } else {
                            //---SI NO EXISTE MARCACION DIAL ACTUAL NI DIA ANTES--------------
                            var suma = 0;
                            var buscarPermiso = await PERMISO.find({ '$and': [{ id_bio: params }, { fechaPermisoIni: buscarFechaAux }] })
                            var buscarFeriado = await FERIADO.find({ fechaFeriadoIni: buscarFechaAux }).sort({ nameFeriado: 1 })
                            if (buscarPermiso.length > 0) {
                                var diaPermiso = nameDay
                                var desde = moment(buscarPermiso[0].fechaPermisoIni, "YYYY-MM-DD")
                                var hasta = moment(buscarPermiso[0].fechaPermisoFin, "YYYY-MM-DD")
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaPermiso,
                                            fecha: moment(desde).format("YYYY-MM-DD"),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarPermiso[0].namePermiso,
                                            observaciones2: "Permiso",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaPermiso = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma
                                    i--
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaPermiso,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarPermiso[0].namePermiso,
                                            observaciones2: "Permiso",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaPermiso = moment(desde).locale('es').format('dddd')
                                        suma++;
                                    }
                                    i = i + suma;
                                    i--;
                                }
                            }
                            else if (buscarFeriado.length > 0) {
                                // console.log('entra a feriado')
                                var diaFeriado = nameDay
                                var desde = moment(buscarFeriado[0].fechaFeriadoIni, 'YYYY-MM-DD')
                                var hasta = moment(buscarFeriado[0].fechaFeriadoFin, 'YYYY-MM-DD')
                                if (hasta <= buscarFechaFin) {
                                    while (desde.isSameOrBefore(hasta)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado,
                                            observaciones2: "Feriado",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                } else if (hasta >= buscarFechaFinAux) {
                                    while (desde.isSameOrBefore(buscarFechaFinAux)) {
                                        auxPrueba3.push({
                                            id_bio: params,
                                            dia: diaFeriado,
                                            fecha: moment(desde).format('YYYY-MM-DD'),
                                            ingreso1: '00:00:00',
                                            salida1: '00:00:00',
                                            ingreso2: '00:00:00',
                                            salida2: '00:00:00',
                                            atraso: '00:00:00',
                                            horasExtra: '00:00:00',
                                            horasDeTrabajo: "0:00",
                                            diaTrabajado: '1.0',
                                            faltas: '0.0',
                                            observaciones: buscarFeriado[0].nameFeriado,
                                            observaciones2: "Feriado",
                                        })
                                        desde = moment(desde).add(1, 'day')
                                        diaFeriado = moment(desde).locale('es').format('dddd')
                                        suma++
                                    }
                                    i = i + suma;
                                    i--;
                                }
                            } else {
                                auxPrueba3.push({
                                    id_bio: params,
                                    dia: nameDay,
                                    fecha: buscarFechaAux,
                                    ingreso1: '00:00:00',
                                    salida1: '00:00:00',
                                    ingreso2: '00:00:00',
                                    salida2: '00:00:00',
                                    atraso: '00:00:00',
                                    horasExtra: '00:00:00',
                                    horasDeTrabajo: "0:00",
                                    diaTrabajado: '0.0',
                                    faltas: '1.0',
                                    observaciones: 'Falta',
                                    observaciones2: "",
                                })
                                suma++;
                            }
                            buscarFechaAux = moment(buscarFechaAux).add(suma, 'day').format('YYYY-MM-DD')
                        }
                    }
                    else {
                        //---SI NO ESTA PROGRAMADO CON LOS CODIGO DE DIAS---
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                    }

                } else {
                    //----SI NO ESTA DENTRO DEL PARAMETRO FECHAS DE CONTRATO
                    buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format('YYYY-MM-DD')
                }
            }
        }
        // console.log(auxPrueba3)
        res.status(200).json(auxPrueba3)

    } else {
        //SI NO EXISTE EMPLEADO
        console.log('empleado no existe')
    }
})

//--------------------------REGISTRAR PRE-REVISION KARDEX--------------------------------------------------------------
router.post('/subirinfo', async (req, res) => {
    const params = req.body
    // console.log(params)
    const contParams = params.length
    // const contArray = array.length
    for (var i = 0; i < contParams; i++) {
        const existe = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: params[i].id_bio }, { fecha: params[i].fecha }] })
        if (existe.length == 0) {
            const kardexAsistencia = new KARDEXASISTENCIA(params[i])
            kardexAsistencia.save()
        } else {
            // await KARDEXASISTENCIA.deleteOne({ _id: params[i]._id })
            await KARDEXASISTENCIA.deleteMany({ "$and": [{ id_bio: params[i].id_bio }, { fecha: params[i].fecha }] })
            const kardexAsistencia = new KARDEXASISTENCIA(params[i])
            kardexAsistencia.save()
        }
    }
    res.status(200).json({ message: 'informacion guardada' })
})

//------------------CRUD KARDEX ASISTENCIA REVISION-----------------------------
//----------------GET KARDEX ASISTENCIA-----------------------------
router.get("/kardexAsistencia/:id", async (req, res) => {
    const params = req.params.id
    const fechaini = req.query.fechaini
    const fechafin = req.query.fechafin

    const empleado = await EMPLEADO.find({ id_bio: params })
    var array = []
    try {
        if (empleado.length > 0) {
            //-------------busqueda de marcaciones por fechaini y fechafin-----------
            var buscarFechaIni = new Date(fechaini)
            var buscarFechaFin = new Date(fechafin)
            var buscarFechaAux = moment(fechaini).format("YYYY-MM-DD")
            var contDias = 0
            const contarDias = (buscarFechaIni, dias) => {
                buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
            }
            while (buscarFechaIni <= buscarFechaFin) {
                contarDias(buscarFechaIni, 1)
                contDias++;
            }
            // console.log(contDias)
            // console.log(buscarFechaAux)
            // console.log(params)
            // console.log(fechas)
            // while()
            for (var i = 0; i < contDias; i++) {
                if (empleado[0].fechaini <= buscarFechaAux && empleado[0].fechafin >= buscarFechaAux) {
                    const marcacion = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: params }, { fecha: buscarFechaAux }] })
                    if (marcacion.length > 0) {
                        array.push(marcacion[0])
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format("YYYY-MM-DD")
                    } else {
                        //no existe marcacion
                        buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format("YYYY-MM-DD")
                        // console.log('no hay marcacion')
                    }

                } else {
                    //no esta dentro de parametro de contratacion
                    buscarFechaAux = moment(buscarFechaAux).add(1, 'day').format("YYYY-MM-DD")
                    // console.log('fuera del parametro')
                }

            }
            // console.log(array)
            res.status(200).json(array)
        } else {
            //no existe empleado
        }
    } catch (error) {
        console.log(error)
    }

})

//-----------------EDITAR KARDEX ASISTENCIA----------------------------
router.put("/kardexAsistencia/:id", async (req, res) => {
    const params = req.body
    // console.log(params)
    const empleado = await EMPLEADO.find({ id_bio: params.id_bio })

    if (empleado[0].cod_estH === '1') {
        //------------------HORARIO DIURNO-----------------------------
        const tolerancia = empleado[0].tolerancia
        // console.log(empleado)
        var ingreso1 = moment(`1990-01-01 ${empleado[0].ingreso1}`).add(tolerancia, 'm').format("HH:mm:ss")
        var ingreso2 = moment(`1990-01-01 ${empleado[0].ingreso2}`).add(tolerancia, 'm').format("HH:mm:ss")
        var salida1 = moment(`1990-01-01 ${empleado[0].salida1}`).format("HH:mm:ss")
        var salida2 = moment(`1990-01-01 ${empleado[0].salida2}`).format("HH:mm:ss")

        var ingreso1b = moment(`1990-01-01 ${params.ingreso1}`).format("HH:mm:ss")
        var ingreso2b = moment(`1990-01-01 ${params.ingreso2}`).format("HH:mm:ss")
        var salida1b = moment(`1990-01-01 ${params.salida1}`).format("HH:mm:ss")
        var salida2b = moment(`1990-01-01 ${params.salida2}`).format("HH:mm:ss")
        var array = []
        var diaTrabajadoObser;
        var faltasObser;
        var obser;
        //--------------ATRASOS-------------------------
        const una = new Date('1990-01-01 00:00:00')
        const atraso = (a, b) => {
            var sum1 = atraso1(a)
            var sum2 = atraso2(b)
            sum1 = sum1.split(":")
            var sum = new Date(`1990-01-01 ${sum2}`)
            sum = moment(sum).add(parseInt(sum1[0]), 'h').add(parseInt(sum1[1]), 'm').add(parseInt(sum1[2]), 's').format("HH:mm:ss")
            return sum
        }
        const atraso1 = (e) => {
            var data1 = new Date(`1990-01-01 ${e}`)
            if (e > ingreso1) {
                var aux = ingreso1.split(":")
                data1 = moment(data1).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                return data1
            } else return moment(una).format("HH:mm:ss")
        }
        const atraso2 = (e) => {
            var data2 = new Date(`1990-01-01 ${e}`)
            if (e > ingreso2) {
                var aux = ingreso2.split(":")
                data2 = moment(data2).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                return data2
            } else return moment(una).format("HH:mm:ss")
        }
        //--------------TIEMPOS EXTRA----------------------
        const dos = new Date(`1990-01-01 00:00:00`)
        const horasExtra = (a, b) => {
            var sum1 = horasExtra1(a)
            var sum2 = horasExtra2(b)
            sum1 = sum1.split(":")
            var sum = new Date(`1990-01-01 ${sum2}`)
            sum = moment(sum).add(parseInt(sum1[0]), 'h').add(parseInt(sum1[1]), 'm').add(parseInt(sum1[2]), 's').format("HH:mm:ss")
            // console.log(sum)
            return sum
        }
        const horasExtra1 = (e) => {
            var data1 = new Date(`1990-01-01 ${e}`)
            if (e > salida1) {
                var aux = salida1.split(":")
                data1 = moment(data1).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                return data1
            } else return moment(dos).format("HH:mm:ss")
        }
        const horasExtra2 = (e) => {
            var data2 = new Date(`1990-01-01 ${e}`)
            if (e > salida2) {
                var aux = salida2.split(":")
                data2 = moment(data2).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                return data2
            } else return moment(dos).format("HH:mm:ss")
        }
        //-------------------HORAS DE TRABAJO----------------------------
        const horasTrabajo = (a, b, c, d) => {
            if (a != '00:00:00' && b != '00:00:00' && c != '00:00:00' && d != '00:00:00') {
                var data1 = moment(`1990-01-01 ${a}`)
                var data2 = moment(`1990-01-01 ${b}`)
                var data3 = moment(`1990-01-01 ${c}`)
                var data4 = moment(`1990-01-01 ${d}`)
                var duration1 = moment.duration(data2.diff(data1)).asHours()
                var duration2 = moment.duration(data4.diff(data3)).asHours()
                var durationTotal = duration1 + duration2
                var result = 0;
                if (durationTotal > 7) {
                    result = 0
                } else { result = 0.5 }
                return { durationTotal, result }
            }
            else if (a != '00:00:00' && b != '00:00:00' && c != '00:00:00') {
                var data1 = moment(`1990-01-01 ${a}`)
                var data2 = moment(`1990-01-01 ${b}`)
                // var duration=moment.duration(data2.diff(data1)).asMinutes()
                var durationTotal = moment.duration(data2.diff(data1)).asHours()
                var result = 0;
                if (durationTotal > 7) {
                    result = 0
                } else {
                    result = 0.5
                }
                return { durationTotal, result }

            }
            else if (a != '00:00:00' && b != '00:00:00') {
                var data1 = moment(`1990-01-01 ${a}`)
                var data2 = moment(`1990-01-01 ${b}`)
                // var duration=moment.duration(data2.diff(data1)).asMinutes()
                var durationTotal = moment.duration(data2.diff(data1)).asHours()
                var result = 0;
                if (durationTotal > 7) {
                    result = 0
                } else {
                    result = 0.5
                }
                return { durationTotal, result }

            }
            else if (a != '00:00:00' || b != '00:00:00' || c != '00:00:00' || d != '00:00:00') {
                var durationTotal = 0
                var result = 0.5
                return { durationTotal, result }
            }
            else if (a === '00:00:00' && b === '00:00:00' && c === '00:00:00' && d === '00:00:00') {
                var durationTotal = 0
                var result = 1
                return { durationTotal, result }
            }
        }
        //---------------------------------------------------
        if (ingreso1b === '00:00:00' && ingreso2b === '00:00:00' && salida1b === '00:00:00' && salida2b === '00:00:00') {
            obser = 'falta'
            diaTrabajadoObser = '0.0'
            faltasObser = '1.0'
        }
        else if (ingreso1b === '00:00:00' || ingreso2b === '00:00:00' || salida1b === '00:00:00' || salida2b === '00:00:00') {
            obser = 'verificar marcaci??n'
            diaTrabajadoObser = '1.0'
            faltasObser = '0.0'
        }
        else if (ingreso1b != '00:00:00' && ingreso2b != '00:00:00' && salida1b != '00:00:00' && salida2b != '00:00:00') {
            obser = ''
            diaTrabajadoObser = '1.0'
            faltasObser = '0.0'
        }
        //-------------------------------------------
        const { durationTotal, result } = horasTrabajo(ingreso1b, salida1b, ingreso2b, salida2b)
        array.push({
            id_bio: params.id_bio,
            fecha: params.fecha,
            dia: params.dia,
            ingreso1: ingreso1b,
            salida1: salida1b,
            ingreso2: ingreso2b,
            salida2: salida2b,
            atraso: atraso(ingreso1b, ingreso2b),
            horasExtra: horasExtra(salida1b, salida2b),
            diaTrabajado: diaTrabajadoObser,
            horasDeTrabajo: durationTotal.toFixed(2),
            // faltas: faltasObser,
            faltas: result.toFixed(2),
            observaciones: obser
        })
        await KARDEXASISTENCIA.findByIdAndUpdate({ _id: req.params.id }, array[0])
        res.status(200).json({ message: 'marcacion actualizada' })
    } else {
        //------------------HORARIO NOCTURNO-----------------------------
        //-------------------NOCTURNOS----------------------------
        const ingreNoc = moment(`1990-01-01 ${params.ingreso1}`).format("HH:mm:ss")
        const saliNoc = moment(`1990-01-01 ${params.salida1}`).format("HH:mm:ss")
        // console.log(ingreNoc)
        // console.log(saliNoc)
        //------------TOLERANCIA NOCTURNOS------------------
        var toleranciaNoc = moment(`1990-01-01 ${empleado[0].ingreso1}`).add(empleado[0].tolerancia, 'm').format("HH:mm:ss")
        var horaExtraNoc = moment(`1990-01-01 ${empleado[0].salida1}`).format("HH:mm:ss")

        var ingresoNoc = moment(`1990-01-01 ${params.ingreso1}`).format("HH:mm:ss")
        var salidaNoc = moment(`1990-01-01 ${params.salida1}`).format("HH:mm:ss")

        var array = []
        var diaTrabajadoObser;
        var faltasObser;
        var obser;
        const una = new Date(`1990-01-01 00:00:00`)
        const atrasoNoc = (a) => {
            var data = moment(`1990-01-01 ${a}`)
            var data2 = moment(`1990-01-01 ${toleranciaNoc}`).format("HH:mm:ss")
            if (data2 < data) {
                data2 = moment(data2).format("HH:mm:ss")
                var aux = toleranciaNoc.split(":")
                data = moment(data).subtract(parseInt(aux[0]), 'h').subtract(parseInt(aux[1]), 'm').format("HH:mm:ss")
                return data
            } else return moment(`1990-01-01 00:00:00`).format("HH:mm:ss")
        }
        const horasExtraNoc = (a) => {
            var data = moment(`1990-01-01 ${a}`)
            var data2 = moment(`1990-01-01 ${horaExtraNoc}`)
            if (data2 < data) {
                data2 = moment(data2).format("HH:mm:ss")
                var aux = data2.split(":")
                data = moment(data).subtract(parseInt(aux[0]), "h").subtract(parseInt(aux[1]), "m").format("HH:mm:ss")
                return data
            }
            else return moment(`1990-01-01 00:00:00`).format("HH:mm:ss")
        }
        //--------------HORAS DE TRABAJO-------------------
        const horasTrabajo = (a, b) => {
            if (a != '00:00:00' && b != '00:00:00') {
                var data1 = moment(`1990-01-01 ${a}`)
                var data2 = moment(`1990-01-02 ${b}`)
                var duration = moment.duration(data2.diff(data1)).asHours()
                var result = 0;
                if (duration > 7) {
                    result = 0
                } else { result = 0.5 }
                return { duration, result }
            } else if (a != '00:00:00' || b != '00:00:00') {
                var duration = 0
                var result = 0.5
                return { duration, result }
            }
        }
        //------------------------------------------------

        if (ingreNoc === "00:00:00" && saliNoc === '00:00:00') {
            obser = 'falta'
            diaTrabajadoObser = "0.0"
            faltasObser = '1.0'
        }
        else if (ingreNoc === "00:00:00" || saliNoc === '00:00:00') {
            obser = 'verficar marcacion'
            diaTrabajadoObser = "1.0"
            faltasObser = '0.0'
        }
        else if (ingreNoc != "00:00:00" && saliNoc != '00:00:00') {
            obser = ""
            diaTrabajadoObser = "1.0"
            faltasObser = '0.0'
        }
        //--------------------------------------------
        const { duration, result } = horasTrabajo(ingresoNoc, salidaNoc)
        array.push({
            id_bio: params.id_bio,
            fecha: params.fecha,
            dia: params.dia,
            ingreso1: ingresoNoc,
            salida1: salidaNoc,
            ingreso2: "00:00:00",
            salida2: "00:00:00",
            atraso: atrasoNoc(ingresoNoc),
            horasExtra: horasExtraNoc(salidaNoc),
            diaTrabajado: diaTrabajadoObser,
            horasDeTrabajo: duration.toFixed(2),
            // faltas: faltasObser,
            faltas: result.toFixed(2),
            observaciones: obser,
            observaciones2: params.observaciones2,
        })
        await KARDEXASISTENCIA.findByIdAndUpdate({ _id: req.params.id }, array[0])
        res.status(200).json({ message: 'marcacion actualizada' })
    }

})
module.exports = router