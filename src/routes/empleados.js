const express = require('express')
const router = express.Router()
const EMPLE = require('../models/Empleado')
const CARGO= require('../models/Cargo')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises


const diskStorage = multer.diskStorage({
    destination: path.join(__dirname, '../empleadoimages'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const fileUpload = multer({
    storage: diskStorage
}).single('image')

router.post('/empleado', fileUpload, async (req, res) => {
    const params = req.body
    if (req.file) {
        const empleado = new EMPLE({
            itemEmp: params.itemEmp,
            id_bio: params.id_bio,
            firstNameEmp: params.firstNameEmp,
            lastNameEmpP: params.lastNameEmpP,
            lastNameEmpM: params.lastNameEmpM,
            CIEmp: params.CIEmp,
            emailEmp: params.emailEmp,
            sexoEmp: params.sexoEmp,
            numCelEmp: params.numCelEmp,
            dirEmp: params.dirEmp,
            // photoImgEmp:params.photoImgEmp,
            nacionalityEmp: params.nacionalityEmp,
            civilStatusEmp: params.civilStatusEmp,
            professionEmp: params.professionEmp,
            institutionDegreeEmp: params.institutionDegreeEmp,
            ObserEmp: params.ObserEmp,
            fechaNacEmp: params.fechaNacEmp,
            estadoEmp:params.estadoEmp,
            // fechaIng: params.fechaIng,
            // fechaReg: params.fechaReg,
            fechaBaja: params.fechaBaja,
            filename: req.file.filename,
            path: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
        })
        params['fechaReg'] = new Date()
        params['fechaIng'] = new Date()
        await empleado.save().then(() => {
            res.status(200).json({ message: 'empleado registrado' })
        })
    } else {
        const empleado = new EMPLE({
            itemEmp: params.itemEmp,
            id_bio: params.id_bio,
            firstNameEmp: params.firstNameEmp,
            lastNameEmpP: params.lastNameEmpP,
            lastNameEmpM: params.lastNameEmpM,
            CIEmp: params.CIEmp,
            emailEmp: params.emailEmp,
            sexoEmp: params.sexoEmp,
            numCelEmp: params.numCelEmp,
            dirEmp: params.dirEmp,
            // photoImgEmp:params.photoImgEmp,
            nacionalityEmp: params.nacionalityEmp,
            civilStatusEmp: params.civilStatusEmp,
            professionEmp: params.professionEmp,
            institutionDegreeEmp: params.institutionDegreeEmp,
            ObserEmp: params.ObserEmp,
            fechaNacEmp: params.fechaNacEmp,
            // fechaIng: params.fechaIng,
            // fechaReg: params.fechaReg,
            fechaBaja: params.fechaBaja,
            estadoEmp:params.estadoEmp,
        })
        params['fechaReg'] = new Date()
        params['fechaIng'] = new Date()
        await empleado.save().then(() => {
            res.status(200).json({ message: 'empleado registrado' })
        })
    }
    // console.log(params)

    // console.log(req.file)
})


router.get('/empleado', async (req, res) => {
    let empleado = await EMPLE.find()
    res.json(empleado)
})

router.get('/empleado/:id', async (req, res) => {
    const empleado = await EMPLE.findById(req.params.id)
    // const empleado = await EMPLE.find({id_bio:req.params.id})
    res.json(empleado)
})

router.put('/empleado/:id', fileUpload, async (req, res) => {
    const params = req.body
    const empleado = await EMPLE.findById({ _id: req.params.id })
    try {
        if (req.file) {
            if(empleado.filename){
                await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                    itemEmp: params.itemEmp,
                    id_bio: params.id_bio,
                    firstNameEmp: params.firstNameEmp,
                    lastNameEmpP: params.lastNameEmpP,
                    lastNameEmpM: params.lastNameEmpM,
                    CIEmp: params.CIEmp,
                    emailEmp: params.emailEmp,
                    sexoEmp: params.sexoEmp,
                    numCelEmp: params.numCelEmp,
                    dirEmp: params.dirEmp,
                    nacionalityEmp: params.nacionalityEmp,
                    civilStatusEmp: params.civilStatusEmp,
                    professionEmp: params.professionEmp,
                    institutionDegreeEmp: params.institutionDegreeEmp,
                    ObserEmp: params.ObserEmp,
                    fechaNacEmp: params.fechaNacEmp,
                    fechaIng: params.fechaIng,
                    fechaBaja: params.fechaBaja,
                    estadoEmp: params.estadoEmp,
        
                    filename: req.file.filename,
                    path: req.file.filename,
                    originalname: req.file.originalname,
                    size: req.file.size,
                })
                await fs.unlink(path.resolve('./src/empleadoimages/'+empleado.path))
                res.status(200).json({ message: 'empleado actualizado' })
            }else{
                await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                    itemEmp: params.itemEmp,
                    id_bio: params.id_bio,
                    firstNameEmp: params.firstNameEmp,
                    lastNameEmpP: params.lastNameEmpP,
                    lastNameEmpM: params.lastNameEmpM,
                    CIEmp: params.CIEmp,
                    emailEmp: params.emailEmp,
                    sexoEmp: params.sexoEmp,
                    numCelEmp: params.numCelEmp,
                    dirEmp: params.dirEmp,
                    nacionalityEmp: params.nacionalityEmp,
                    civilStatusEmp: params.civilStatusEmp,
                    professionEmp: params.professionEmp,
                    institutionDegreeEmp: params.institutionDegreeEmp,
                    ObserEmp: params.ObserEmp,
                    fechaNacEmp: params.fechaNacEmp,
                    fechaIng: params.fechaIng,
                    fechaBaja: params.fechaBaja,
                    estadoEmp: params.estadoEmp,
        
                    filename: req.file.filename,
                    path: req.file.filename,
                    originalname: req.file.originalname,
                    size: req.file.size,
                })
                res.status(200).json({ message: 'empleado actualizado' })
            }
            
        }else{
            await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                itemEmp: params.itemEmp,
                id_bio: params.id_bio,
                firstNameEmp: params.firstNameEmp,
                lastNameEmpP: params.lastNameEmpP,
                lastNameEmpM: params.lastNameEmpM,
                CIEmp: params.CIEmp,
                emailEmp: params.emailEmp,
                sexoEmp: params.sexoEmp,
                numCelEmp: params.numCelEmp,
                dirEmp: params.dirEmp,
                // photoImgEmp:params.photoImgEmp,
                nacionalityEmp: params.nacionalityEmp,
                civilStatusEmp: params.civilStatusEmp,
                professionEmp: params.professionEmp,
                institutionDegreeEmp: params.institutionDegreeEmp,
                ObserEmp: params.ObserEmp,
                fechaNacEmp: params.fechaNacEmp,
                fechaIng: params.fechaIng,
                // fechaReg: params.fechaReg,
                fechaBaja: params.fechaBaja,
                estadoEmp:params.estadoEmp,
    
                // filename: req.file.filename,
                // path: req.file.filename,
                // originalname: req.file.originalname,
                // size: req.file.size,

                // filename: params.filename,
                // path: params.filename,
                // originalname: params.originalname,
                // size: params.size,
            })
            res.status(200).json({ message: 'empelado actualizado' })
        }
    } catch (error) {
        console.log(error)
    }
})

router.delete('/empleado/:id', async (req, res) => {
    const params = req.params.id
    const empleado = await EMPLE.findById({ _id: params })
    try {
        if (empleado.filename) {
            await CARGO.deleteOne({id_bio: empleado.id_bio})
            await EMPLE.findByIdAndDelete({ _id: params })
            await fs.unlink(path.resolve('./src/empleadoimages/' + empleado.path))
            res.status(200).json({ message: 'empleado eliminado' })
        }else{
            await CARGO.deleteOne({id_bio: empleado.id_bio})
            await EMPLE.findByIdAndDelete({ _id: params })
            res.status(200).json({ message: 'empleado eliminado' })
        }
    } catch (error) {
        console.log(error)
    }

})

module.exports = router