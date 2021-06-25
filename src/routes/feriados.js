const express = require('express')
const router = express.Router()
const FERIADO = require('../models/Feriado')
const EMPLEADO = require('../models/Empleado')

// router.post('/feriado', async (req, res) => {
//     const params = req.body
//     const empleado = await EMPLEADO.find()
//     for (var i = 0; i < empleado.length; i++) {
//         const feriado = new FERIADO({
//             nameFeriado: params.nameFeriado,
//             tipoFeriado: params.tipoFeriado,
//             fechaFeriadoIni: params.fechaFeriadoIni,
//             fechaFeriadoFin: params.fechaFeriadoFin
//         })
//         feriado.save().then(()=>{
//             res.status(200).json({message:'dia feriado registrado'})
//         })
//     }
// })

router.post('/feriado', async (req, res) => {
    const params = req.body
    const feriado = new FERIADO(params)
    feriado.save().then(() => {
        res.status(200).json({ message: 'feriado registrado' })
    })
})

router.get('/feriado', async (req, res) => {
    const feriado = await FERIADO.find()
    res.status(200).json(feriado)
})

router.delete('/feriado/:id', async (req, res) => {
    const params = req.params.id
    try {
        await FERIADO.findByIdAndDelete({ _id: params })
        res.status(200).json({ message: 'feriado eliminado' })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router