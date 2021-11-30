const express = require('express')
const router = express.Router()
const EMPLE = require('../models/Empleado')
const CARGO = require('../models/Cargo')
const HORARIO = require('../models/Horario')
const moment=require('moment')
const cloudinary = require('../utils/cloudinary')
const upload = require('../utils/multer')
const MOVIMIENTO = require('../models/reportes/MovimientoPersonal')
const ALTASYBAJAS = require('../models/reportes/AltasBajasPersonal')
const SERVICE = require('../models/reportes/YearsSevice')


router.post('/empleado', upload.single('image'), async (req, res) => {
    const params = req.body
    const horario = await HORARIO.find()
    const aux = horario.length
    try {
        var numero = 1;
        if (params.typeContrato === 'eventual') {
            // console.log('entra')
            numero = 0
            numero = numero.toString()
        } else {
            while (true) {
                numero = numero.toString()
                const numItem = await EMPLE.find({ "$and": [{ estadoEmp: 'activo' }, { typeContrato: 'permanente' }, { itemEmp: numero }] })
                if (numItem.length > 0) {
                    numero = parseInt(numero)
                    numero++;
                }
                else break;
            }
        }

        for (var i = 0; i < aux; i++) {
            if (params.typeHorario === horario[i].descripcion) {
                if (req.file) {
                    //---SI EXISTE IMAGEN---
                    const result = await cloudinary.uploader.upload(req.file.path)
                    const empleado = new EMPLE({
                        id_bio: params.id_bio,
                        // itemEmp: params.itemEmp,
                        itemEmp: numero,
                        lastNameEmpP: params.lastNameEmpP,
                        lastNameEmpM: params.lastNameEmpM,
                        firstNameEmp: params.firstNameEmp,
                        nacionalityEmp: params.nacionalityEmp,
                        CIEmp: params.CIEmp,
                        fechaNacEmp: params.fechaNacEmp,
                        sexoEmp: params.sexoEmp,
                        //-------------
                        cargoEmp: params.cargoEmp,
                        haber_basico: params.haber_basico,
                        //-------------------------
                        departamentEmp: params.departamentEmp,
                        typeContrato: params.typeContrato,
                        clasificacionLab: params.clasificacionLab,
                        typeHorario: params.typeHorario,
                        typeAntiguedad: params.typeAntiguedad,
                        AFP: params.AFP,
                        cotizante: params.cotizante,
                        //-------------
                        dirEmp: params.dirEmp,
                        numCelEmp: params.numCelEmp,
                        civilStatusEmp: params.civilStatusEmp,
                        //-------------
                        afilSindicato: params.afilSindicato,
                        lugarNacimiento: params.lugarNacimiento,
                        //-------------
                        emailEmp: params.emailEmp,
                        professionEmp: params.professionEmp,
                        institutionDegreeEmp: params.institutionDegreeEmp,
                        estadoEmp: params.estadoEmp,
                        ObserEmp: params.ObserEmp,
                        // fechaIni: params.fechaini,
                        // fechafin: params.fechafin,

                        tolerancia: horario[i].tolerancia,
                        cod_estH: horario[i].tipoHorario,
                        ingreso1: horario[i].ingreso1,
                        salida1: horario[i].salida1,
                        ingreso2: horario[i].ingreso2,
                        salida2: horario[i].salida2,
                        cod_horario: horario[i].cod,
                        fechaini: params.fechaini,
                        fechafin: params.fechafin,

                        // photoImgEmp:params.photoImgEmp,
                        // fechaini: params.fechaini,
                        // fechaReg: params.fechaReg,
                        // fechaBaja: params.fechaBaja,
                        avatar: result.secure_url,
                        cloudinary_id: result.public_id,
                    })
                    params['fechaReg'] = new Date()
                    // params['fechaini'] = new Date()
                    await empleado.save().then(() => {
                        res.status(200).json({ message: 'empleado registrado' })
                    })
                    //REGISTRO DE ALTAS Y BAJAS
                    var fecha = new Date()
                    const altaybaja = new ALTASYBAJAS({
                        id_bio: params.id_bio,
                        fullName: params.firstNameEmp +" "+ params.lastNameEmpP+""+params.lastNameEmpM,
                        // firstNameEmp: params.firstNameEmp,
                        // lastNameEmpP: params.lastNameEmpP,
                        // lastNameEmpM: params.lastNameEmpM,
                        estadoEmp: params.estadoEmp,
                        fechaAltasBajas: fecha.toLocaleDateString(),
                    })
                    altaybaja.save()
                    //REGISTRO AÑOS DE SERVICIO
                    const servicio = new SERVICE(params)
                    servicio.save()

                } else {
                    //----NO EXISTE IMAGEN----
                    const empleado = new EMPLE({
                        id_bio: params.id_bio,
                        // itemEmp: params.itemEmp,
                        itemEmp: numero,
                        lastNameEmpP: params.lastNameEmpP,
                        lastNameEmpM: params.lastNameEmpM,
                        firstNameEmp: params.firstNameEmp,
                        nacionalityEmp: params.nacionalityEmp,
                        CIEmp: params.CIEmp,
                        fechaNacEmp: params.fechaNacEmp,
                        sexoEmp: params.sexoEmp,
                        //-------------
                        haber_basico: params.haber_basico,
                        //-------------
                        cargoEmp: params.cargoEmp,
                        departamentEmp: params.departamentEmp,
                        typeContrato: params.typeContrato,
                        clasificacionLab: params.clasificacionLab,
                        typeHorario: params.typeHorario,
                        typeAntiguedad: params.TypeAntiguedad,
                        AFP: params.AFP,
                        cotizante: params.cotizante,
                        //-------------
                        dirEmp: params.dirEmp,
                        numCelEmp: params.numCelEmp,
                        civilStatusEmp: params.civilStatusEmp,
                        //-------------
                        afilSindicato: params.afilSindicato,
                        lugarNacimiento: params.lugarNacimiento,
                        //-------------
                        emailEmp: params.emailEmp,
                        professionEmp: params.professionEmp,
                        institutionDegreeEmp: params.institutionDegreeEmp,
                        estadoEmp: params.estadoEmp,
                        ObserEmp: params.ObserEmp,
                        // fechaIni: params.fechaini,
                        // fechafin: params.fechafin,
                        tolerancia: horario[i].tolerancia,
                        cod_estH: horario[i].tipoHorario,
                        ingreso1: horario[i].ingreso1,
                        salida1: horario[i].salida1,
                        ingreso2: horario[i].ingreso2,
                        salida2: horario[i].salida2,
                        cod_horario: horario[i].cod,
                        fechaini: params.fechaini,
                        fechafin: params.fechafin,
                    })
                    params['fechaReg'] = new Date()
                    // params['fechaini'] = new Date()
                    await empleado.save().then(() => {
                        res.status(200).json({ message: 'empleado registrado' })
                    })
                    var fecha = new Date()
                    const altaybaja = new ALTASYBAJAS({
                        id_bio: params.id_bio,
                        fullName: params.firstNameEmp +" "+ params.lastNameEmpP+""+params.lastNameEmpM,
                        // firstNameEmp: params.firstNameEmp,
                        // lastNameEmpP: params.lastNameEmpP,
                        // lastNameEmpM: params.lastNameEmpM,
                        estadoEmp: params.estadoEmp,
                        fechaAltasBajas: fecha.toLocaleDateString(),
                    })
                    altaybaja.save()
                    //REGISTRO AÑOS DE SERVICIO
                    const servicio = new SERVICE(params)
                    servicio.save()
                }
                break;
            }
        }

    } catch (error) {
        console.log(error)
    }
    // console.log(params)

    // console.log(req.file)
})


router.get('/empleado', async (req, res) => {
    try {
        let empleado = await EMPLE.find()
        res.json(empleado)
    } catch (error) {
        console.log(error)
    }
})

router.get('/empleado/:id', async (req, res) => {
    try {
        const empleado = await EMPLE.findById(req.params.id)
        // const empleado = await EMPLE.find({id_bio:req.params.id})
        res.status(200).json(empleado)
    } catch (error) {
        console.log(error)
    }
})
//------------------BUSQUEDA DE PERSONAL PARA LAS ASISTENCIAS Y OBSERVACIONES------------------------------
router.get('/personalAsisSearch/:id', async (req, res) => {
    const params = req.params.id
    try {
        const empleado = await EMPLE.find({ id_bio: params })
        res.status(200).json(empleado)
    } catch (error) {
        console.log(error)
    }
})
//-----------------------------------------------------------------------------------------------------
router.put('/empleado/:id', upload.single('image'), async (req, res) => {
    const params = req.body
    // console.log(params.typeHorario)
    const empleado_bio = await EMPLE.find({ id_bio: params.id_bio })
    // console.log(empleado_bio[0].typeHorario)

    try {
        //--NUMERO ITEM AUTOMATICO--
        var numero = 1;
        if (params.typeContrato != empleado_bio[0].typeContrato) {
            if (params.typeContrato === 'permanente' && params.estadoEmp === 'activo') {
                while (true) {
                    numero = numero.toString()
                    const numItem = await EMPLE.find({ "$and": [{ estadoEmp: 'activo' }, { typeContrato: 'permanente' }, { itemEmp: numero }] })
                    if (numItem.length > 0) {
                        numero = parseInt(numero)
                        numero++;
                    }
                    else break;
                }
            } else {
                numero = 0
                numero = numero.toString()
            }
        } else if (params.estadoEmp != empleado_bio[0].estadoEmp) {
            if (params.estadoEmp === 'activo') {
                while (true) {
                    numero = numero.toString()
                    const numItem = await EMPLE.find({ "$and": [{ estadoEmp: 'activo' }, { typeContrato: 'permanente' }, { itemEmp: numero }] })
                    if (numItem.length > 0) {
                        numero = parseInt(numero)
                        numero++;
                    }
                    else break;
                }
            } else {
                numero = 0
                numero = numero.toString()
            }
        } else {
            numero = empleado_bio[0].itemEmp
        }
        //ANTIGUDAD---------
        if (params.typeAntiguedad != empleado_bio[0].typeAntiguedad) {
            var fechaCambio=new Date()
            fechaCambio=moment(fechaCambio).format("YYYY-MM-DD")
            const service = new SERVICE({
                id_bio: params.id_bio,
                firstNameEmp: params.firstNameEmp,
                lastNameEmpP: params.lastNameEmpP,
                lastNameEmpM: params.lastNameEmpM,
                typeAntiguedad: params.typeAntiguedad,
                fechaini: fechaCambio,
            })
            service.save()
        }
        //----------------------------------------------------
        if (params.typeHorario === empleado_bio[0].typeHorario && params.cargoEmp === empleado_bio[0].cargoEmp) {
            //si no se cambian el horario y el cargo
            console.log('entra al primero')
            const empleado = await EMPLE.findById({ _id: req.params.id })
            if (req.file) {
                //--SI EXISTE IMAGEM-----
                if (empleado.cloudinary_id) {
                    await cloudinary.uploader.destroy(empleado.cloudinary_id)
                    const result = await cloudinary.uploader.upload(req.file.path)
                    await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                        id_bio: params.id_bio,
                        // itemEmp: params.itemEmp,
                        itemEmp: numero,
                        lastNameEmpP: params.lastNameEmpP,
                        lastNameEmpM: params.lastNameEmpM,
                        firstNameEmp: params.firstNameEmp,
                        nacionalityEmp: params.nacionalityEmp,
                        CIEmp: params.CIEmp,
                        fechaNacEmp: params.fechaNacEmp,
                        sexoEmp: params.sexoEmp,
                        //-------------
                        cargoEmp: params.cargoEmp,
                        departamentEmp: params.departamentEmp,
                        typeContrato: params.typeContrato,
                        clasificacionLab: params.clasificacionLab,
                        typeHorario: params.typeHorario,
                        typeAntiguedad: params.typeAntiguedad,
                        AFP: params.AFP,
                        cotizante: params.cotizante,
                        //-------------
                        dirEmp: params.dirEmp,
                        numCelEmp: params.numCelEmp,
                        civilStatusEmp: params.civilStatusEmp,
                        //-------------
                        afilSindicato: params.afilSindicato,
                        lugarNacimiento: params.lugarNacimiento,
                        //-------------
                        emailEmp: params.emailEmp,
                        professionEmp: params.professionEmp,
                        institutionDegreeEmp: params.institutionDegreeEmp,
                        estadoEmp: params.estadoEmp,
                        ObserEmp: params.ObserEmp,
                        // fechaIni: params.fechaini,
                        // fechafin: params.fechafin,

                        fechaini: params.fechaini,
                        fechafin: params.fechafin,

                        avatar: result.secure_url || empleado.avatar,
                        cloudinary_id: result.public_id || empleado.cloudinary_id
                    })
                    res.status(200).json({ message: 'empleado actualizado' })
                } else {
                    const result = await cloudinary.uploader.upload(req.file.path)
                    await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                        id_bio: params.id_bio,
                        // itemEmp: params.itemEmp,
                        itemEmp: numero,
                        lastNameEmpP: params.lastNameEmpP,
                        lastNameEmpM: params.lastNameEmpM,
                        firstNameEmp: params.firstNameEmp,
                        nacionalityEmp: params.nacionalityEmp,
                        CIEmp: params.CIEmp,
                        fechaNacEmp: params.fechaNacEmp,
                        sexoEmp: params.sexoEmp,
                        //-------------
                        cargoEmp: params.cargoEmp,
                        departamentEmp: params.departamentEmp,
                        typeContrato: params.typeContrato,
                        clasificacionLab: params.clasificacionLab,
                        typeHorario: params.typeHorario,
                        typeAntiguedad: params.typeAntiguedad,
                        AFP: params.AFP,
                        cotizante: params.cotizante,
                        //-------------
                        dirEmp: params.dirEmp,
                        numCelEmp: params.numCelEmp,
                        civilStatusEmp: params.civilStatusEmp,
                        //-------------
                        afilSindicato: params.afilSindicato,
                        lugarNacimiento: params.lugarNacimiento,
                        //-------------
                        emailEmp: params.emailEmp,
                        professionEmp: params.professionEmp,
                        institutionDegreeEmp: params.institutionDegreeEmp,
                        estadoEmp: params.estadoEmp,
                        ObserEmp: params.ObserEmp,
                        fechaini: params.fechaini,
                        fechafin: params.fechafin,

                        avatar: result.secure_url,
                        cloudinary_id: result.public_id
                    })
                    res.status(200).json({ message: 'empleado actualizado' })
                }

            } else {
                //---NO EXISTE IMAGEN----
                await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                    id_bio: params.id_bio,
                    // itemEmp: params.itemEmp,
                    itemEmp: numero,
                    lastNameEmpP: params.lastNameEmpP,
                    lastNameEmpM: params.lastNameEmpM,
                    firstNameEmp: params.firstNameEmp,
                    nacionalityEmp: params.nacionalityEmp,
                    CIEmp: params.CIEmp,
                    fechaNacEmp: params.fechaNacEmp,
                    sexoEmp: params.sexoEmp,
                    //-------------
                    cargoEmp: params.cargoEmp,
                    departamentEmp: params.departamentEmp,
                    typeContrato: params.typeContrato,
                    clasificacionLab: params.clasificacionLab,
                    typeHorario: params.typeHorario,
                    typeAntiguedad: params.typeAntiguedad,
                    AFP: params.AFP,
                    cotizante: params.cotizante,
                    //-------------
                    dirEmp: params.dirEmp,
                    numCelEmp: params.numCelEmp,
                    civilStatusEmp: params.civilStatusEmp,
                    //-------------
                    afilSindicato: params.afilSindicato,
                    lugarNacimiento: params.lugarNacimiento,
                    //-------------
                    emailEmp: params.emailEmp,
                    professionEmp: params.professionEmp,
                    institutionDegreeEmp: params.institutionDegreeEmp,
                    estadoEmp: params.estadoEmp,
                    ObserEmp: params.ObserEmp,
                    fechaini: params.fechaini,
                    fechafin: params.fechafin,

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

        } else if (params.typeHorario != empleado_bio[0].typeHorario) {
            //si se cambia el horario
            console.log('entra al segundo')
            const horario = await HORARIO.find()
            const aux = horario.length
            for (var i = 0; i < aux; i++) {
                if (params.typeHorario === horario[i].descripcion) {
                    const empleado = await EMPLE.findById({ _id: req.params.id })
                    if (req.file) {
                        if (empleado.cloudinary_id) {
                            await cloudinary.uploader.destroy(empleado.cloudinary_id)
                            const result = await cloudinary.uploader.upload(req.file.path)
                            await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                                id_bio: params.id_bio,
                                // itemEmp: params.itemEmp,
                                itemEmp: numero,
                                lastNameEmpP: params.lastNameEmpP,
                                lastNameEmpM: params.lastNameEmpM,
                                firstNameEmp: params.firstNameEmp,
                                nacionalityEmp: params.nacionalityEmp,
                                CIEmp: params.CIEmp,
                                fechaNacEmp: params.fechaNacEmp,
                                sexoEmp: params.sexoEmp,
                                //-------------
                                cargoEmp: params.cargoEmp,
                                departamentEmp: params.departamentEmp,
                                typeContrato: params.typeContrato,
                                clasificacionLab: params.clasificacionLab,
                                typeHorario: params.typeHorario,
                                typeAntiguedad: params.typeAntiguedad,
                                AFP: params.AFP,
                                cotizante: params.cotizante,
                                //-------------
                                dirEmp: params.dirEmp,
                                numCelEmp: params.numCelEmp,
                                civilStatusEmp: params.civilStatusEmp,
                                //-------------
                                afilSindicato: params.afilSindicato,
                                lugarNacimiento: params.lugarNacimiento,
                                //-------------
                                emailEmp: params.emailEmp,
                                professionEmp: params.professionEmp,
                                institutionDegreeEmp: params.institutionDegreeEmp,
                                estadoEmp: params.estadoEmp,
                                ObserEmp: params.ObserEmp,
                                // fechaIni: params.fechaini,
                                // fechafin: params.fechafin,

                                tolerancia: horario[i].tolerancia,
                                cod_estH: horario[i].tipoHorario,
                                ingreso1: horario[i].ingreso1,
                                salida1: horario[i].salida1,
                                ingreso2: horario[i].ingreso2,
                                salida2: horario[i].salida2,
                                cod_horario: horario[i].cod,
                                fechaini: params.fechaini,
                                fechafin: params.fechafin,

                                avatar: result.secure_url || empleado.avatar,
                                cloudinary_id: result.public_id || empleado.cloudinary_id
                            })
                            res.status(200).json({ message: 'empleado actualizado' })
                        } else {
                            const result = await cloudinary.uploader.upload(req.file.path)
                            await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                                id_bio: params.id_bio,
                                // itemEmp: params.itemEmp,
                                itemEmp: numero,
                                lastNameEmpP: params.lastNameEmpP,
                                lastNameEmpM: params.lastNameEmpM,
                                firstNameEmp: params.firstNameEmp,
                                nacionalityEmp: params.nacionalityEmp,
                                CIEmp: params.CIEmp,
                                fechaNacEmp: params.fechaNacEmp,
                                sexoEmp: params.sexoEmp,
                                //-------------
                                cargoEmp: params.cargoEmp,
                                departamentEmp: params.departamentEmp,
                                typeContrato: params.typeContrato,
                                clasificacionLab: params.clasificacionLab,
                                typeHorario: params.typeHorario,
                                typeAntiguedad: params.typeAntiguedad,
                                AFP: params.AFP,
                                cotizante: params.cotizante,
                                //-------------
                                dirEmp: params.dirEmp,
                                numCelEmp: params.numCelEmp,
                                civilStatusEmp: params.civilStatusEmp,
                                //-------------
                                afilSindicato: params.afilSindicato,
                                lugarNacimiento: params.lugarNacimiento,
                                //-------------
                                emailEmp: params.emailEmp,
                                professionEmp: params.professionEmp,
                                institutionDegreeEmp: params.institutionDegreeEmp,
                                estadoEmp: params.estadoEmp,
                                ObserEmp: params.ObserEmp,
                                // fechaini: params.fechaini,
                                // fechafin: params.fechafin,
                                tolerancia: horario[i].tolerancia,
                                cod_estH: horario[i].tipoHorario,
                                ingreso1: horario[i].ingreso1,
                                salida1: horario[i].salida1,
                                ingreso2: horario[i].ingreso2,
                                salida2: horario[i].salida2,
                                cod_horario: horario[i].cod,
                                fechaini: params.fechaini,
                                fechafin: params.fechafin,

                                avatar: result.secure_url,
                                cloudinary_id: result.public_id
                            })
                            res.status(200).json({ message: 'empleado actualizado' })
                        }

                    } else {
                        await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                            id_bio: params.id_bio,
                            // itemEmp: params.itemEmp,
                            itemEmp: numero,
                            lastNameEmpP: params.lastNameEmpP,
                            lastNameEmpM: params.lastNameEmpM,
                            firstNameEmp: params.firstNameEmp,
                            nacionalityEmp: params.nacionalityEmp,
                            CIEmp: params.CIEmp,
                            fechaNacEmp: params.fechaNacEmp,
                            sexoEmp: params.sexoEmp,
                            //-------------
                            cargoEmp: params.cargoEmp,
                            departamentEmp: params.departamentEmp,
                            typeContrato: params.typeContrato,
                            clasificacionLab: params.clasificacionLab,
                            typeHorario: params.typeHorario,
                            typeAntiguedad: params.typeAntiguedad,
                            AFP: params.AFP,
                            cotizante: params.cotizante,
                            //-------------
                            dirEmp: params.dirEmp,
                            numCelEmp: params.numCelEmp,
                            civilStatusEmp: params.civilStatusEmp,
                            //-------------
                            afilSindicato: params.afilSindicato,
                            lugarNacimiento: params.lugarNacimiento,
                            //-------------
                            emailEmp: params.emailEmp,
                            professionEmp: params.professionEmp,
                            institutionDegreeEmp: params.institutionDegreeEmp,
                            estadoEmp: params.estadoEmp,
                            ObserEmp: params.ObserEmp,
                            // fechaini: params.fechaini,
                            // fechafin: params.fechafin,
                            tolerancia: horario[i].tolerancia,
                            cod_estH: horario[i].tipoHorario,
                            ingreso1: horario[i].ingreso1,
                            salida1: horario[i].salida1,
                            ingreso2: horario[i].ingreso2,
                            salida2: horario[i].salida2,
                            cod_horario: horario[i].cod,
                            fechaini: params.fechaini,
                            fechafin: params.fechafin,

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
                    break;
                }
                // else{
                //     // res.status(300).json({message:'error horario no encontrado'})
                //     console.log('no existe el horario')
                // }
            }
        } else if (params.cargoEmp != empleado_bio[0].cargoEmp) {
            //si se cambia el cargo
            console.log('entra al tercero')
            const cargo = await CARGO.find()
            const aux = cargo.length
            for (var i = 0; i < aux; i++) {
                if (params.cargoEmp === cargo[i].nameCargo) {
                    const empleado = await EMPLE.findById({ _id: req.params.id })
                    if (req.file) {
                        if (empleado.cloudinary_id) {
                            await cloudinary.uploader.destroy(empleado.cloudinary_id)
                            const result = await cloudinary.uploader.upload(req.file.path)
                            await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                                id_bio: params.id_bio,
                                // itemEmp: params.itemEmp,
                                itemEmp: numero,
                                lastNameEmpP: params.lastNameEmpP,
                                lastNameEmpM: params.lastNameEmpM,
                                firstNameEmp: params.firstNameEmp,
                                nacionalityEmp: params.nacionalityEmp,
                                CIEmp: params.CIEmp,
                                fechaNacEmp: params.fechaNacEmp,
                                sexoEmp: params.sexoEmp,
                                //-------------
                                cargoEmp: cargo[i].nameCargo,
                                haber_basico: cargo[i].haber_basico,
                                //-------------
                                departamentEmp: params.departamentEmp,
                                typeContrato: params.typeContrato,
                                clasificacionLab: params.clasificacionLab,
                                typeHorario: params.typeHorario,
                                typeAntiguedad: params.typeAntiguedad,
                                AFP: params.AFP,
                                cotizante: params.cotizante,
                                //-------------
                                dirEmp: params.dirEmp,
                                numCelEmp: params.numCelEmp,
                                civilStatusEmp: params.civilStatusEmp,
                                //-------------
                                afilSindicato: params.afilSindicato,
                                lugarNacimiento: params.lugarNacimiento,
                                //-------------
                                emailEmp: params.emailEmp,
                                professionEmp: params.professionEmp,
                                institutionDegreeEmp: params.institutionDegreeEmp,
                                estadoEmp: params.estadoEmp,
                                ObserEmp: params.ObserEmp,
                                // fechaIni: params.fechaini,
                                // fechafin: params.fechafin,
                                fechaini: params.fechaini,
                                fechafin: params.fechafin,

                                avatar: result.secure_url || empleado.avatar,
                                cloudinary_id: result.public_id || empleado.cloudinary_id
                            })
                            res.status(200).json({ message: 'empleado actualizado' })
                            var fecha = new Date()
                            const movimientoPersonal = new MOVIMIENTO({
                                id_bio: params.id_bio,
                                // itemEmp: params.itemEmp,
                                itemEmp: numero,
                                firstNameEmp: params.firstNameEmp,
                                lastNameEmpP: params.lastNameEmpP,
                                lastNameEmpM: params.lastNameEmpM,
                                cargoEmp: cargo[i].nameCargo,
                                departamentEmp: params.departamentEmp,
                                estadoEmp: params.estadoEmp,
                                fechaMovimiento: fecha.toLocaleDateString(),
                            })
                            movimientoPersonal.save()
                        } else {
                            const result = await cloudinary.uploader.upload(req.file.path)
                            await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                                id_bio: params.id_bio,
                                // itemEmp: params.itemEmp,
                                itemEmp: numero,
                                lastNameEmpP: params.lastNameEmpP,
                                lastNameEmpM: params.lastNameEmpM,
                                firstNameEmp: params.firstNameEmp,
                                nacionalityEmp: params.nacionalityEmp,
                                CIEmp: params.CIEmp,
                                fechaNacEmp: params.fechaNacEmp,
                                sexoEmp: params.sexoEmp,
                                //-------------
                                cargoEmp: cargo[i].nameCargo,
                                haber_basico: cargo[i].haber_basico,
                                //-------------
                                departamentEmp: params.departamentEmp,
                                typeContrato: params.typeContrato,
                                clasificacionLab: params.clasificacionLab,
                                typeHorario: params.typeHorario,
                                typeAntiguedad: params.typeAntiguedad,
                                AFP: params.AFP,
                                cotizante: params.cotizante,
                                //-------------
                                dirEmp: params.dirEmp,
                                numCelEmp: params.numCelEmp,
                                civilStatusEmp: params.civilStatusEmp,
                                //-------------
                                afilSindicato: params.afilSindicato,
                                lugarNacimiento: params.lugarNacimiento,
                                //-------------
                                emailEmp: params.emailEmp,
                                professionEmp: params.professionEmp,
                                institutionDegreeEmp: params.institutionDegreeEmp,
                                estadoEmp: params.estadoEmp,
                                ObserEmp: params.ObserEmp,
                                // fechaini: params.fechaini,
                                // fechafin: params.fechafin,
                                fechaini: params.fechaini,
                                fechafin: params.fechafin,

                                avatar: result.secure_url,
                                cloudinary_id: result.public_id
                            })
                            res.status(200).json({ message: 'empleado actualizado' })
                            var fecha = new Date()
                            const movimientoPersonal = new MOVIMIENTO({
                                id_bio: params.id_bio,
                                // itemEmp: params.itemEmp,
                                itemEmp: numero,
                                firstNameEmp: params.firstNameEmp,
                                lastNameEmpP: params.lastNameEmpP,
                                lastNameEmpM: params.lastNameEmpM,
                                cargoEmp: cargo[i].nameCargo,
                                departamentEmp: params.departamentEmp,
                                estadoEmp: params.estadoEmp,
                                fechaMovimiento: fecha.toLocaleDateString(),
                            })
                            movimientoPersonal.save()
                        }

                    } else {
                        await EMPLE.findByIdAndUpdate({ _id: req.params.id }, {
                            id_bio: params.id_bio,
                            // itemEmp: params.itemEmp,
                            itemEmp: numero,
                            lastNameEmpP: params.lastNameEmpP,
                            lastNameEmpM: params.lastNameEmpM,
                            firstNameEmp: params.firstNameEmp,
                            nacionalityEmp: params.nacionalityEmp,
                            CIEmp: params.CIEmp,
                            fechaNacEmp: params.fechaNacEmp,
                            sexoEmp: params.sexoEmp,
                            //-------------
                            cargoEmp: cargo[i].nameCargo,
                            haber_basico: cargo[i].haber_basico,
                            //-------------
                            departamentEmp: params.departamentEmp,
                            typeContrato: params.typeContrato,
                            clasificacionLab: params.clasificacionLab,
                            typeHorario: params.typeHorario,
                            typeAntiguedad: params.typeAntiguedad,
                            AFP: params.AFP,
                            cotizante: params.cotizante,
                            //-------------
                            dirEmp: params.dirEmp,
                            numCelEmp: params.numCelEmp,
                            civilStatusEmp: params.civilStatusEmp,
                            //-------------
                            afilSindicato: params.afilSindicato,
                            lugarNacimiento: params.lugarNacimiento,
                            //-------------
                            emailEmp: params.emailEmp,
                            professionEmp: params.professionEmp,
                            institutionDegreeEmp: params.institutionDegreeEmp,
                            estadoEmp: params.estadoEmp,
                            ObserEmp: params.ObserEmp,
                            // fechaini: params.fechaini,
                            // fechafin: params.fechafin,
                            fechaini: params.fechaini,
                            fechafin: params.fechafin,

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
                        var fecha = new Date()
                        const movimientoPersonal = new MOVIMIENTO({
                            id_bio: params.id_bio,
                            // itemEmp: params.itemEmp,
                            itemEmp: numero,
                            firstNameEmp: params.firstNameEmp,
                            lastNameEmpP: params.lastNameEmpP,
                            lastNameEmpM: params.lastNameEmpM,
                            cargoEmp: cargo[i].nameCargo,
                            departamentEmp: params.departamentEmp,
                            estadoEmp: params.estadoEmp,
                            fechaMovimiento: fecha.toLocaleDateString(),
                        })
                        movimientoPersonal.save()
                    }
                    break;
                }
                // else{
                //     console.log('no existe el cargo')
                // }
            }
        }
        //----------------ALTAS Y BAJAS DEL PERSONAL-------------------
        if (empleado_bio[0].estadoEmp != params.estadoEmp) {
            var fecha = new Date()
            const altaybaja = new ALTASYBAJAS({
                id_bio: params.id_bio,
                fullName: params.firstNameEmp +" "+ params.lastNameEmpP+""+params.lastNameEmpM,
                // firstNameEmp: params.firstNameEmp,
                // lastNameEmpP: params.lastNameEmpP,
                // lastNameEmpM: params.lastNameEmpM,
                estadoEmp: params.estadoEmp,
                motivoCambio:params.motivoCambio,
                fechaAltasBajas: fecha.toLocaleDateString(),
            })
            altaybaja.save()
        }
    } catch (error) {
        console.log(error)
    }
})

router.delete('/empleado/:id', async (req, res) => {
    const params = req.params.id
    const empleado = await EMPLE.findById({ _id: params })
    try {
        if (empleado.cloudinary_id) {
            // await CARGO.deleteOne({id_bio: empleado.id_bio})
            await EMPLE.findByIdAndDelete({ _id: params })
            await cloudinary.uploader.destroy(empleado.cloudinary_id)
            res.status(200).json({ message: 'empleado eliminado' })
        } else {
            await CARGO.deleteOne({ id_bio: empleado.id_bio })
            await EMPLE.findByIdAndDelete({ _id: params })
            res.status(200).json({ message: 'empleado eliminado' })
        }
    } catch (error) {
        console.log(error)
    }

})

module.exports = router