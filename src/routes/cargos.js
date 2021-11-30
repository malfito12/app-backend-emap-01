const express = require('express')
const router = express.Router()
const CARGO = require('../models/Cargo')
const EMPLEADO = require('../models/Empleado')
const EMPLE = require('../models/Empleado')
const uuid=require('uuid')

router.post('/cargo', async (req, res) => {
    const params = req.body
    const clave=uuid.v4()
    const data={...params,idCargo:clave}
    try {
        const cargo = new CARGO(data)
        cargo.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: (err.name === 'MongoError' && err.code === 11000) ? 'el codigo ya existe' : 'es otro error'
                })
            } else {
                return res.status(200).json({ message: ' cargo registrado' })
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/cargo', async (req, res) => {
    const cargos = await CARGO.find()
    res.status(200).json(cargos)
})

router.get('/cargo/:id', async (req, res) => {
    const params = req.params.id
    // console.log(params)
    try {
        const cargos = await CARGO.find({ nameDepartament: params })
        res.status(200).json(cargos)
        // console.log(cargos)
    } catch (error) {
        console.log(error)
    }
})


router.put('/cargo/:id', async (req, res) => {
    const params = req.body

    try {
        const cargo=await CARGO.findById({_id:req.params.id})
        await CARGO.findByIdAndUpdate({_id:req.params.id},params)
        await EMPLEADO.updateMany({departamentEmp:cargo.nameDepartament,cargoEmp:cargo.nameCargo},{$set:{departamentEmp:params.nameDepartament,cargoEmp:params.nameCargo,haber_basico:params.haber_basico}})
        // await CARGO.findByIdAndUpdate({ _id: req.params.id }, {
        //     cod_cargo: params.cod_cargo,
        //     nameCargo: params.nameCargo,
        //     cod_dep: params.cod_dep,
        //     nameDepartament: params.nameDepartament,
        //     haber_basico:params.haber_basico
        // })
        res.status(200).json({ message: 'Cargo Actualizado' })
    } catch (error) {
        console.log(error)
    }
})

router.delete('/cargo/:id', async (req, res) => {
    const params = req.params.id
    const aux = await CARGO.find({ _id: params })
    const aux2 = aux[0].nameCargo
    try {
        const existe = await EMPLE.find({ cargoEmp: aux2 }).countDocuments()
        if (existe == 0) {
            await CARGO.findByIdAndDelete({ _id: params })
            res.status(200).json({ message: 'cargo eliminado' })
        } else {
            res.status(300).json({ message: 'error aun existe personal registrado con ese cargo' })
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/empleadoCargo',async(req,res)=>{
    try {
        const empleadoCargo=await EMPLEADO.find({})
        res.status(200).json(empleadoCargo)
    } catch (error) {
        console.log(error)
    }
})
module.exports = router
