const express = require('express')
const EMPLEADO = require('../models/Empleado')
const HORARIO = require('../models/Horario')
const ASIGHRS = require('../models/horarioAsig')
const router = express.Router()

router.post('/horarioasig', async (req, res) => {
    const params = req.body
    const empleado = await EMPLEADO.find()
    const horario = await HORARIO.find()
    cont1 = 0;
    cont2 = 0;
    for (var i = 0; i < empleado.length; i++) {
        if (params.id_bio == empleado[i].id_bio) {
            const exite= await ASIGHRS.find({"$and":[{id_bio: params.id_bio}]}).countDocuments()
            if(exite==0){
                for (var j = 0; j < horario.length; j++) {
                    // if (params.tipoHorario == horario[j].tipoHorario) {
                    if (params.descripcion == horario[j].descripcion) {
    
                        const asignarH = new ASIGHRS({
                            id_bio: empleado[i].id_bio,
                            firstNameEmp: empleado[i].firstNameEmp,
                            lastNameEmpP: empleado[i].lastNameEmpP,
                            lastNameEmpM: empleado[i].lastNameEmpM,
                            descripcion: horario[j].descripcion,
                            tipoHorario: horario[j].tipoHorario,
                            tolerancia: horario[j].tolerancia,
                            ingreso1: horario[j].ingreso1,
                            salida1: horario[j].salida1,
                            ingreso2: horario[j].ingreso2,
                            salida2: horario[j].salida2,
                            fechaini:params.fechaini,
                            fechafin:params.fechafin
                        })
                        asignarH.save().then(() => {
                            res.status(200).json({ message: 'asignacion de horario exitosa' })
                        })
                        cont2++;
                        break;
                    }
                }
                if (cont2 == 0) {
                    res.status(300).json({ "msn": 'tipo de horario no encontrado' })
                }
            }
            else if(exite!=0){
                res.status(300).json({"msn":'ya existe un horario asignado'})
            }
            cont1++;
            break;
        }
    }
    if (cont1 == 0) {
        res.status(300).json({ message: 'id no encontrado' })
    }
})

router.get('/horarioasig', async (req, res) => {
    const asignarH = await ASIGHRS.find()
    res.status(200).json(asignarH)
})

router.put('/horarioasig/:id', async (req, res) => {
    const params = req.body
    const horario= await HORARIO.find()
    cont1=0;
    try {
        for(var i=0;i<horario.length;i++){
            if(params.descripcion==horario[i].descripcion){
                await ASIGHRS.findByIdAndUpdate({ _id: req.params.id }, {
                    descripcion: horario[i].descripcion,
                    tipoHorario: horario[i].tipoHorario,
                    tolerancia: horario[i].tolerancia,
                    ingreso1: horario[i].ingreso1,
                    salida1: horario[i].salida1,
                    ingreso2: horario[i].ingreso2,
                    salida2: horario[i].salida2,
                    fechaini:params.fechaini,
                    fechafin:params.fechafin
                })
                res.status(200).json({ message: 'asignacion de horario actualizado' })
                cont1++
                break
            }
        }
        if(cont1==0){
            res.status(300).json({message:'horario no encontrado'})
        }
    } catch (error) {
        console.log(error)
    }
})

router.delete('/horarioasig/:id', async (req, res) => {
    const params = req.params.id
    try {
        await ASIGHRS.findByIdAndDelete({ _id: params })
        res.status(200).json({ message: 'asignacion eliminada' })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router