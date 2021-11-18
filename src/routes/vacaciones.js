const express = require('express')
const EMPLEADO = require('../models/Empleado')
const VACACION = require('../models/Vacaciones')
const router = express.Router()

router.post('/vacacion', async (req, res) => {
    const params = req.body
    // console.log(params)
    const empleado = await EMPLEADO.find({ id_bio: params.id_bio })
    // console.log(empleado)
    try {
        if (empleado.length > 0) {
            if(params.fechaVacacionIni<=params.fechaVacacionFin){
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
})

router.get('/vacacion',async(req,res)=>{
    const vacaciones=await VACACION.find({})
    res.status(200).json(vacaciones)
})

router.put('/vacacion/:id',async(req,res)=>{
    const params=req.body
    // console.log(req.params.id)
    try {
        if(params.fechaVacacionIni<=params.fechaVacacionFin){
            await VACACION.findByIdAndUpdate({_id:req.params.id}, params)
            res.status(200).json({message:'vacacion editada'})
        }
    } catch (error) {
        console.log(error)
    }
})

router.delete('/vacacion/:id',async(req,res)=>{
    const params=req.params.id
    try {
        await VACACION.findByIdAndDelete({_id:params})
        res.status(200).json({message:'vacacion eliminada'})
    } catch (error) {
        console.log(error)
    }
})

module.exports = router