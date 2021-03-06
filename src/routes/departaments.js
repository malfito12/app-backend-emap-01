const express = require('express')
const CARGO = require('../models/Cargo')
const router = express.Router()
const DEPARTAMENT = require('../models/Departament')

router.post('/departament', async (req, res) => {
    const params = req.body
    try {
        const departament = new DEPARTAMENT(params)
        departament.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: (err.name === 'MongoError' && err.code === 11000) ? 'el codigo ya existe' : 'es otro error'
                })
            } else {
                return res.status(200).json({ message: 'Departamento registrado' })
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/departament', async (req, res) => {
    try {
        const departament = await DEPARTAMENT.find()
        res.status(200).json(departament)
    } catch (error) {
        console.log(error)
    }
})

router.put('/departament/:id', async (req, res) => {
    const params = req.params.id
    try {
        await DEPARTAMENT.findByIdAndUpdate({ _id: params }, {
            cod_dep: params.cod_dep,
            nameDepartament: params.nameDepartament
        })
        res.status(200).json({ message: 'Departamento actualizado' })
    } catch (error) {
        console.log(error)
    }
})

router.delete('/departament/:id', async (req, res) => {
    const params = req.params.id
    const aux = await DEPARTAMENT.find({ _id: params })
    const aux2 = aux[0].nameDepartament
    const aux3 = await CARGO.find({ nameDepartament: aux2 }).countDocuments()
    try {
        if (aux3 === 0) {
            await DEPARTAMENT.findByIdAndDelete({ _id: params })
            res.status(200).json({ message: 'Departamento eliminado' })
        } else {
            res.status(300).json({ message: 'error aun existen cargos en el departamento' })
        }
    } catch (error) {
        console.log(error)
    }
})
module.exports = router