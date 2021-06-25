const express = require('express');
const moment = require('moment');
const router = express.Router();
const ASIS = require('../models/Asistencia');
const FERIADO = require('../models/Feriado');
const HORARIO = require('../models/Horario');
const PERMISO = require('../models/Permiso');
const ASIGHRS = require('../models/horarioAsig')

router.post('/asistencia', async (req, res) => {
    const params = req.body
    const asistencia = new ASIS({
        id_bio: params.id_bio,
        fecha: params.fecha,
        hora: params.hora
    })
    await asistencia.save().then(() => {
        res.status(200).json({ message: asistencia })
    })

})
router.get('/asistencia', async (req, res) => {
    var params = req.query
    var SKIP = 0;
    var LIMIT = 100;
    var filter = {}
    if (params.skip) {
        SKIP = parseInt(params.skip)
    }
    if (params.limit) {
        LIMIT = parseInt(params.limit)
    }
    if (params.id_bio) {
        filter["id_bio"] = params.id_bio
    }
    const asis = await ASIS.find(filter).skip(SKIP).limit(LIMIT)
    res.json(asis)
})

router.get('/asistencia/:id', async (req, res) => {
    const params = req.params.id
    var id_bio = parseInt(params)
    // const horario = await HORARIO.find({ id_bio: id_bio })
    const horario = await ASIGHRS.find({ id_bio: req.params.id })
    if (horario != 0) {
        var fechaini = moment(horario[0].fechaini)
        var fechafin = moment(horario[0].fechafin)
        var fechacont = moment(horario[0].fechaini)
        var cont = 0;
        while (fechacont <= fechafin) {
            fechacont = moment(fechacont).add(1, 'day')
            cont++;
        }
        fechaini = moment(fechaini, "YYYY-MM-DD").format("YYYY-MM-DD")
        var array = []
        // if(horario[0].tipoHorario =='1'){
        const asignar = await ASIGHRS.find({ id_bio: params })
        for (var i = 0; i < cont; i++) {
            // const a = "07:00:00"
            // const b = "10:00:00"
            // const c = "13:00:00"
            // const d = "16:00:00"
            // const e = "19:00:00"

            const a = moment(`1994-01-01 ${asignar[0].ingreso1}`).subtract(1, 'h').format('HH:mm:ss')
            const b = moment(`1994-01-01 ${asignar[0].ingreso1}`).add(2, 'h').format('HH:mm:ss')
            const c = moment(`1994-01-01 ${asignar[0].ingreso2}`).subtract(1, 'h').format('HH:mm:ss')
            const d = moment(`1994-01-01 ${asignar[0].ingreso2}`).add(2, 'h').format('HH:mm:ss')
            const e = moment(`1994-01-01 ${asignar[0].ingreso2}`).add(5, 'h').format('HH:mm:ss')

            var contIngre1 = "0";
            var contSalid1 = "0";
            var contIngre2 = "0";
            var contSalid2 = "0";

            var weekday = moment(fechaini).locale('es').format('dddd')
            var asisSearch = await ASIS.find({ "$and": [{ id_bio: params }, { fecha: fechaini }] }).countDocuments()
            var aux = []
            // var aux2=[]
            if (asisSearch == 0) {
                var suma = 0;
                var buscarPermiso = await PERMISO.find({ "$and": [{ id_bio: params }, { fechaPermisoIni: fechaini }] })
                var buscarFeriado = await FERIADO.find({ fechaFeriadoIni: fechaini }, { nameFeriado: 1 })
                if (weekday == 'domingo') {
                    array.push({
                        id_bio: params,
                        dia: weekday,
                        fecha: fechaini,
                        ingreso1: '00:00',
                        salida1: '00:00',
                        ingreso2: '00:00',
                        salida2: '00:00',
                        observaciones: 'Domingo'
                    })
                    suma++;
                } else if (buscarPermiso != 0) {
                    var weekdayP = weekday
                    var desde = moment(buscarPermiso[0].fechaPermisoIni, "YYYY-MM-DD")
                    var hasta = moment(buscarPermiso[0].fechaPermisoFin, "YYYY-MM-DD")
                    while (desde.isSameOrBefore(hasta)) {
                        array.push({
                            id_bio: params,
                            dia: weekdayP,
                            ingreso1: '00:00',
                            salida1: '00:00',
                            ingreso2: '00:00',
                            salida2: '00:00',
                            fecha: moment(desde).format("YYYY-MM-DD"),
                            observaciones: buscarPermiso[0].namePermiso
                        })
                        desde = moment(desde).add(1, 'day')
                        weekdayP = moment(desde).locale('es').format('dddd')
                        suma++;
                    }
                    i = i + suma;
                    i--;
                } else if (buscarFeriado != 0) {
                    array.push({
                        id_bio: params,
                        dia: weekday,
                        ingreso1: '00:00',
                        salida1: '00:00',
                        ingreso2: '00:00',
                        salida2: '00:00',
                        fecha: fechaini,
                        observaciones: buscarFeriado[0].nameFeriado
                    })
                    suma++;
                } else if (buscarPermiso == 0) {
                    array.push({
                        id_bio: params,
                        dia: weekday,
                        fecha: fechaini,
                        ingreso1: '00:00',
                        salida1: '00:00',
                        ingreso2: '00:00',
                        salida2: '00:00'
                    })
                    suma++;
                }
                fechaini = moment(fechaini).add(suma, 'day')
                fechaini = moment(fechaini, 'YYYY-MM-DD').format('YYYY-MM-DD')
            }
            if (asisSearch != 0) {
                var buscar = await ASIS.find({ "$and": [{ id_bio: params }, { fecha: fechaini }] })
                for (var j = 0; j < buscar.length; j++) {
                    if (buscar[j].hora > a && buscar[j].hora < b) {
                        contIngre1 = '1'
                        aux.push({ hora: buscar[j].hora })
                    } else if (buscar[j].hora > b && buscar[j].hora < c) {
                        contSalid1 = '1'
                        aux.push({ hora: buscar[j].hora })
                    } else if (buscar[j].hora > c && buscar[j].hora < d) {
                        contIngre2 = '1'
                        aux.push({ hora: buscar[j].hora })
                    } else if (buscar[j].hora > d && buscar[j].hora < e) {
                        contSalid2 = '1'
                        aux.push({ hora: buscar[j].hora })
                    } else aux.push({ hora: buscar[j].hora })
                }
                var result = contIngre1.concat(contSalid1, contIngre2, contSalid2)
                const una = new Date('1990-01-01 00:00:00')
                const temprano1 = () => {
                    if (aux[0].hora > "08:10:00") {
                        var aux2 = aux[0]
                        var aux3 = aux2.hora
                        var data = new Date(`1990-01-01 ${aux3}`)
                        data = moment(data).subtract(8, 'h').subtract(10, 'm').format('HH:mm:ss')
                        return data
                    } else if (aux[0].hora > '14:00:00') {
                        var aux2 = aux[0]
                        var aux3 = aux3.hora
                        var data = new Date(`1990-01-01 ${aux3}`)
                        data = moment(data).subtract(14, 'h').format('HH:mm:ss')
                        return data
                    }
                    else return moment(una).format('HH:mm:ss')
                }
                const temprano2 = () => {
                    if (aux[1].hora > '14:00:00') {
                        var aux2 = aux[1]
                        var aux3 = aux2.hora
                        var data = new Date(`1990-01-01 ${aux3}`)
                        data = moment(data).subtract(14, 'h').format('HH:mm:ss')
                        return data
                    } else return moment(una).format('HH:mm:ss')
                }
                if (result == '0001') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: '00:00',
                        salida1: '00:00',
                        ingreso2: '00:00',
                        salida2: aux[0].hora,
                        observaciones: 'verificar marcación'
                    })
                } else if (result == '0010') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: '00:00',
                        salida1: '00:00',
                        ingreso2: aux[0].hora,
                        atraso2: temprano2(),
                        salida2: '00:00',
                        observaciones: 'verificar marcación'
                    })
                } else if (result == '0011') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: '00:00',
                        salida1: '00:00',
                        ingreso2: aux[0].hora,
                        atraso2: temprano2(),
                        salida2: aux[1].hora,
                    })
                } else if (result == '0100') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: '00:00',
                        salida1: aux[0].hora,
                        ingreso2: '00:00',
                        salida2: '00:00',
                        observaciones: 'verificar marcación'
                    })
                } else if (result == '0101') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: '00:00',
                        salida1: aux[0].hora,
                        ingreso2: '00:00',
                        salida2: aux[1].hora,
                        observaciones: 'verificar marcación'
                    })
                } else if (result == '0110') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: '00:00',
                        salida1: aux[0].hora,
                        ingreso2: aux[1].hora,
                        atraso2: temprano2(),
                        salida2: '00:00',
                        observaciones: 'verificar marcación'
                    })
                } else if (result == '0111') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: '00:00',
                        salida1: aux[0].hora,
                        ingreso2: aux[1].hora,
                        atraso2: temprano2(),
                        salida2: aux[2].hora,
                        observaciones: 'verificar marcación'
                    })
                } else if (result == '1000') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: aux[0].hora,
                        atraso1: temprano1(),
                        salida1: '00:00',
                        ingreso2: '00:00',
                        salida2: '00:00',
                        observaciones: 'verificar marcación'
                    })
                } else if (result == '1001') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: aux[0].hora,
                        atraso1: temprano1(),
                        salida1: '00:00',
                        ingreso2: '00:00',
                        salida2: aux[1].hora,
                        observaciones: 'verificar marcación'
                    })
                } else if (result == '1010') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: aux[0].hora,
                        atraso1: temprano1(),
                        salida1: '00:00',
                        ingreso2: aux[1].hora,
                        atraso2: temprano2(),
                        salida2: '00:00',
                        observaciones: 'verificar marcación'
                    })
                } else if (result == '1011') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: aux[0].hora,
                        atraso1: temprano1(),
                        salida1: '00:00',
                        ingreso2: aux[1].hora,
                        atraso2: temprano2(),
                        salida2: aux[1].hora,
                    })
                } else if (result == '1100') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: aux[0].hora,
                        atraso1: temprano1(),
                        salida1: aux[1].hora,
                        ingreso2: '00:00',
                        salida2: '00:00',
                        observaciones: 'medio dia'
                    })
                } else if (result == '1101') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: aux[0].hora,
                        salida1: aux[1].hora,
                        ingreso2: '00:00',
                        salida2: aux[2].hora,
                    })
                } else if (result == '1110') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: aux[0].hora,
                        salida1: aux[1].hora,
                        ingreso2: aux[2].hora,
                        salida2: '00:00',
                    })
                } else if (result == '1111') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        ingreso1: aux[0].hora,
                        atraso1: temprano1(),
                        salida1: aux[1].hora,
                        ingreso2: aux[2].hora,
                        atraso2: temprano2(),
                        salida2: aux[3].hora,
                    })
                } else if (result == '0000') {
                    array.push({
                        id_bio: params,
                        fecha: fechaini,
                        dia: weekday,
                        hora: aux[0].hora,
                        ingreso1: '00:00',
                        salida1: '00:00',
                        ingreso2: '00:00',
                        salida2: '00:00',
                        observaciones: 'no cumple el horario'
                    })
                }
                fechaini = moment(fechaini).add(1, 'day')
                fechaini = moment(fechaini, "YYYY-MM-DD").format('YYYY-MM-DD')
            }
        }
        res.json(array)
    } else res.status(300).json({ message: 'aun no existe asignacion de fecha y horario' })
})

module.exports = router