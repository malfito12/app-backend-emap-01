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

module.exports = router