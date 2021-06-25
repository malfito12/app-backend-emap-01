const express = require('express')
const router = express.Router()
const HORARIO = require('../models/Horario')
const EMPLEADO = require('../models/Empleado')

router.post('/horario', async (req, res) => {
    const params = req.body
    const descripcion = await HORARIO.find({descripcion:params.descripcion})
    const tipoHorario = await HORARIO.find({descripcion:params.descripcion})
    if(descripcion.length>=1|| tipoHorario.length>=1){
        res.status(300).json({"msn":"el horario o el tipo de horario ya existe"})
        return;
    }
    const horario = new HORARIO(params)
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
        await HORARIO.findByIdAndUpdate({ _id: req.params.id }, {
            descripcion: params.descripcion,
            observaciones: params.observaciones,
            tolerancia: params.tolerancia,
            ingreso1: params.ingreso1,
            salida1: params.salida1,
            ingreso2: params.ingreso2,
            salida2: params.salida2,
            tipoHorario: params.tipoHorario,
            feriado: params.feriado,
            orden: params.orden,
            est: params.est,
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

module.exports = router