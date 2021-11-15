const express = require('express')
const router = express.Router()
const HORARIO = require('../models/Horario')
const EMPLEADO = require('../models/Empleado')

router.post('/horario', async (req, res) => {
    const params = req.body
    var aux = params.est
    aux = aux.split("/")
    const est = aux[0]
    const cod_est = aux[1]
    // console.log(params)

    // var aux = params.observaciones
    // aux = aux.split("/")
    // // console.log(params)

    const descripcion = await HORARIO.find({ descripcion: params.descripcion })
    // const tipoHorario = await HORARIO.find({ tipoHorario: params.tipoHorario })
    if (descripcion.length >= 1 /*|| tipoHorario.length >= 1*/) {
        res.status(300).json({ "msn": "el horario o el tipo de horario ya existe" })
        return;
    }

    // const codMod = aux[0]
    // const observacionesMod = aux[1]
    // const horario = new HORARIO({
    //     descripcion: params.descripcion,
    //     observaciones: observacionesMod,
    //     cod: codMod,
    //     tolerancia: params.tolerancia,
    //     ingreso1: params.ingreso1,
    //     salida1: params.salida1,
    //     ingreso2: params.ingreso2,
    //     salida2: params.salida2,
    //     tipoHorario: params.tipoHorario,
    //     feriado: params.feriado,
    //     orden: params.orden,
    //     est: params.est,
    // })

    // const horario=new HORARIO(params)
    const horario = new HORARIO({
        descripcion: params.descripcion,
        cod: params.cod,
        tolerancia: params.tolerancia,
        ingreso1: params.ingreso1,
        salida1: params.salida1,
        ingreso2: params.ingreso2,
        salida2: params.salida2,
        tipoHorario: cod_est,
        feriado: params.feriado,
        orden: params.orden,
        est: est,
    })
    console.log(horario)
    horario.save().then(() => {
        res.status(200).json({ message: 'horario registrado' })
    })
})

router.get('/horario', async (req, res) => {
    const horario = await HORARIO.find()
    res.status(200).json(horario)
})

router.put('/horario/:id', async (req, res) => {
    const params = req.body
    try {
        const horario = await HORARIO.findById({ _id: req.params.id })
        await HORARIO.findByIdAndUpdate({ _id: req.params.id }, params)
        await EMPLEADO.updateMany({ typeHorario: horario.descripcion },
            {
                $set: {
                    typeHorario: params.descripcion,
                    cod_estH: params.tipoHorario,
                    ingreso1: params.ingreso1,
                    salida1: params.salida1,
                    ingreso2: params.ingreso2,
                    salida2: params.salida2,
                    cod_horario: params.cod
                }
            })
        res.status(200).json({ message: 'horario actualizado' })
    } catch (error) {
        console.log(error)
    }
})

router.delete('/horario/:id', async (req, res) => {
    const params = req.params.id
    try {
        await HORARIO.findByIdAndDelete({ _id: params })
        res.status(200).json({ message: 'horario eliminado' })
    } catch (error) {
        console.log(error)
    }
})

//-----------------------CONSULTA DE HORARIOS-----------------------------
router.get('/consulta', async (req, res) => {
    const params = req.query
    try {
        const horario = await EMPLEADO.find({ CIEmp: params.cedula })
        res.status(200).json(horario)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router