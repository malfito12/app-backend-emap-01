const express = require('express')
const moment = require('moment')
const EMPLEADO = require('../models/Empleado')
const VACACION = require('../models/Vacaciones')
const router = express.Router()

router.post('/vacacion', async (req, res) => {
    const params = req.body
    // console.log(params)
    const mes = moment(params.fechaVacacionIni).format("YYYY-MM")
    const mes1 = moment(`${mes}-01`).format("YYYY-MM-DD")
    const mes2 = moment(`${mes}-31`).format("YYYY-MM-DD")
    const existe1 = await VACACION.find({
        "$and": [{ id_bio: params.id_bio },
        { fechaVacacionIni: { $gte: mes1 } },
        { fechaVacacionIni: { $lte: mes2 } }
        ]
    })

    if (existe1.length > 0) {
        console.log('la vacacion ya existe dde es mes')
        res.status(300).json({ message: 'la vacacion ya existe de ese mes' })
    } else {
        const year = moment(params.fechaVacacionIni).format("YYYY")
        const year1 = moment(`${year}-01-01`).format("YYYY-MM-DD")
        const year2 = moment(`${year}-12-31`).format("YYYY-MM-DD")
        const vacaciones = await VACACION.find({ "$and": [{ id_bio: params.id_bio }, { fechaVacacionIni: { $gte: year1 } }, { fechaVacacionIni: { $lte: year2 } }] }).sort({ fechaVacacionIni: 1 })
        var diasVacaciones = 0;
        if (vacaciones.length > 0) {
            const empleado = await EMPLEADO.find({ id_bio: params.id_bio })
            //DIAS OTORGADOS POR AÑOS DE SERVICIO
            const constYears = moment().diff(`${empleado[0].fechaini}`, 'years', false)
            if (constYears < 5) {
                diasVacaciones = 15;
            } else if (constYears >= 5 && constYears < 10) {
                diasVacaciones = 20
            } else if (constYears >= 10) {
                diasVacaciones = 30
            }
            var contDias = 0
            for (var i = 0; i < vacaciones.length; i++) {
                var buscarFechaIni = new Date(vacaciones[i].fechaVacacionIni)
                var buscarFechaFin = new Date(vacaciones[i].fechaVacacionFin)
                const contarDias = (buscarFechaIni, dias) => {
                    buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                    return buscarFechaIni
                }
                while (buscarFechaIni <= buscarFechaFin) {
                    contarDias(buscarFechaIni, 1)
                    contDias++
                }
                // console.log(contDias)
            }
            //NUEVA PETICION DE VACACIONES
            var contPeticion = 0
            var buscarFechaIni = new Date(params.fechaVacacionIni)
            var buscarFechaFin = new Date(params.fechaVacacionFin)
            const contarDias = (buscarFechaIni, dias) => {
                buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                return buscarFechaIni
            }
            while (buscarFechaIni <= buscarFechaFin) {
                contarDias(buscarFechaIni, 1)
                contPeticion++
            }
            // console.log(contDias)
            const result2 = diasVacaciones - contDias
            const result = diasVacaciones - contDias - contPeticion
            if (result < 0) {
                console.log('solo tienes ' + result2 + ' dias')
                res.status(300).json({ message: 'solo tienes ' + result2 + ' dias' })
            } else {
                try {
                    if (empleado.length > 0) {
                        if (params.fechaVacacionIni <= params.fechaVacacionFin) {
                            const vacaciones = new VACACION({
                                id_bio: params.id_bio,
                                firstNameEmp: empleado[0].firstNameEmp,
                                lastNameEmpP: empleado[0].lastNameEmpP,
                                lastNameEmpM: empleado[0].lastNameEmpP,
                                CIEmp: empleado[0].CIEmp,
                                tipoVacacion: params.tipoVacacion,
                                nameVacaciones: params.nameVacaciones,
                                fechaVacacionIni: params.fechaVacacionIni,
                                fechaVacacionFin: params.fechaVacacionFin,
                                diasOtorgados: diasVacaciones,
                                diasGastados: result,
                            })
                            vacaciones.save().then(() => {
                                res.status(200).json({ message: 'vacacion registrada' })
                            })
                        }
                    } else {
                        console.log('el empleado existe')
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        } else {
            //NO EXISTE VACACIONES REGISTRADAS
            const empleado = await EMPLEADO.find({ id_bio: params.id_bio })
            //DIAS OTORGADOS POR AÑOS DE SERVICIO
            const constYears = moment().diff(`${empleado[0].fechaini}`, 'years', false)
            if (constYears < 5) {
                diasVacaciones = 15;
            } else if (constYears >= 5 && constYears < 10) {
                diasVacaciones = 20
            } else if (constYears >= 10) {
                diasVacaciones = 30
            }
            //NUEVA PETICION DE VACACIONES
            var contPeticion = 0
            var buscarFechaIni = new Date(params.fechaVacacionIni)
            var buscarFechaFin = new Date(params.fechaVacacionFin)
            const contarDias = (buscarFechaIni, dias) => {
                buscarFechaIni.setDate(buscarFechaIni.getDate() + dias)
                return buscarFechaIni
            }
            while (buscarFechaIni <= buscarFechaFin) {
                contarDias(buscarFechaIni, 1)
                contPeticion++
            }
            if (contPeticion <= diasVacaciones) {
                try {
                    if (empleado.length > 0) {
                        if (params.fechaVacacionIni <= params.fechaVacacionFin) {
                            const vacaciones = new VACACION({
                                id_bio: params.id_bio,
                                firstNameEmp: empleado[0].firstNameEmp,
                                lastNameEmpP: empleado[0].lastNameEmpP,
                                lastNameEmpM: empleado[0].lastNameEmpP,
                                CIEmp: empleado[0].CIEmp,
                                tipoVacacion: params.tipoVacacion,
                                nameVacaciones: params.nameVacaciones,
                                fechaVacacionIni: params.fechaVacacionIni,
                                fechaVacacionFin: params.fechaVacacionFin,
                                diasOtorgados: diasVacaciones,
                                diasGastados: contPeticion,
                            })
                            vacaciones.save().then(() => {
                                res.status(200).json({ message: 'vacacion registrada' })
                            })
                        }
                    } else {
                        console.log('el empleado existe')
                    }
                } catch (error) {
                    console.log(error)
                }
            } else {
                console.log('los dias de vacacion es mayor a lo permitido')
                res.status(300).json({ message: 'los dias de vacacion es mayor a lo permitido' })
            }

        }
    }
})

router.get('/vacacion', async (req, res) => {
    const vacaciones = await VACACION.find({})
    res.status(200).json(vacaciones)
})

router.put('/vacacion/:id', async (req, res) => {
    const params = req.body
    // console.log(req.params.id)
    try {
        if (params.fechaVacacionIni <= params.fechaVacacionFin) {
            await VACACION.findByIdAndUpdate({ _id: req.params.id }, params)
            res.status(200).json({ message: 'vacacion editada' })
        }
    } catch (error) {
        console.log(error)
    }
})

router.delete('/vacacion/:id', async (req, res) => {
    const params = req.params.id
    try {
        await VACACION.findByIdAndDelete({ _id: params })
        res.status(200).json({ message: 'vacacion eliminada' })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router