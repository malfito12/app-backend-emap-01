const express = require('express')
const router = express.Router()
const CARGO = require('../models/Cargo')
const EMPLEADO = require('../models/Empleado')
const EMPLE = require('../models/Empleado')

// router.post('/cargo',async(req,res)=>{
//     var cont=0;
//     const params=req.body
//     const empleado= await EMPLE.find()
//     const sum= await CARGO.find({id_bio: params.id_bio}).countDocuments()
//     if(sum==0){
//         for(var i=0;i<empleado.length;i++){
//             if(params.id_bio==empleado[i].id_bio){
//                 cont++;
//                 const cargo= new CARGO({
//                     id_bio:empleado[i].id_bio,
//                     email: empleado[i].emailEmp,
//                     firstNameEmp:empleado[i].firstNameEmp,
//                     lastNameEmpP:empleado[i].lastNameEmpP,
//                     lastNameEmpM:empleado[i].lastNameEmpM,
//                     nameCargo:params.nameCargo,
//                     cod_cargo:params.cod_cargo,
//                     des_cargo:params.des_cargo,
//                     t_perma:params.t_perma,
//                     haber_b:params.haber_b,
//                     nivel:params.nivel,
//                     estado:params.estado,
//                     gestion:params.gestion
//                 })
//                 cargo.save().then(()=>{
//                     res.status(200).json({message:"cargo resgitrado"})
//                 })
//             }  
//         }
//         if(cont==0){
//             res.json({message:"id no encontrado"})
//         }
//     }else if(sum !=0){
//         res.status(300).json({message:'ya existe un cargo asignado'})
//     }

// })

// router.put('/cargo/:id', async(req,res)=>{
//     const params=req.body
//     var cont= await CARGO.find({id_bio:params.id_bio}).countDocuments()
//     if(cont!=0){
//         await CARGO.updateOne({id_bio:params.id_bio},{
//             $set:{
//                 nameCargo: params.nameCargo,
//                 cod_cargo: params.cod_cargo,
//                 des_cargo: params.des_cargo,
//                 t_perma: params.t_perma,
//                 haber_b: params.haber_b,
//                 nivel: params.nivel,
//                 estado: params.estado,
//                 gestion: params.gestion
//             }
//         })
//         res.status(200).json({message: 'cargo actualizado'})
//     }else if(cont ==0){
//         res.status(300).json({message:'no se encontro el resgistro de cargo'})
//     }
// })

// router.delete('/cargo/:id',async(req,res)=>{
//     const params=req.params.id
//     const cont= await CARGO.find({id_bio:params}).countDocuments()
//     if(cont !=0){
//         await CARGO.deleteOne({id_bio:params})
//         res.status(200).json({message:'cargo eliminado'})
//     }else if(cont ==0){
//         res.status(300).json({message:'no se puede eliminar un registro que no existe'})
//     }
// })

// router.get('/cargo', async(req,res)=>{
//     const cargo=await CARGO.find()
//     const empleado=await EMPLE.find()
//     const array=[]
//     for(var i=0;i<empleado.length;i++){
//         var cont=0;
//         for(var j=0;j<cargo.length;j++){
//             if(empleado[i].id_bio==cargo[j].id_bio){
//                 array.push({
//                     id:empleado[i]._id,
//                     id_bio:empleado[i].id_bio,
//                     firstNameEmp:empleado[i].firstNameEmp,
//                     lastNameEmpP:empleado[i].lastNameEmpP,
//                     lastNameEmpM:empleado[i].lastNameEmpM,
//                     nameCargo:cargo[j].nameCargo,
//                     cod_cargo: cargo[j].cod_cargo,
//                     des_cargo: cargo[j].des_cargo,
//                     t_perma: cargo[j].t_perma,
//                     haber_b: cargo[j].haber_b,
//                     nivel: cargo[j].nivel,
//                     estado: cargo[j].estado,
//                     gestion: cargo[j].gestion
//                 })
//                 cont++;
//                 break
//             }
//         }
//         if(cont==0){
//             array.push({
//                 id:empleado[i]._id,
//                 id_bio:empleado[i].id_bio,
//                 firstNameEmp:empleado[i].firstNameEmp,
//                 lastNameEmpP:empleado[i].lastNameEmpP,
//                 lastNameEmpM:empleado[i].lastNameEmpM,
//                 nameCargo:'No tiene'
//             })
//         }
//     }
//     res.json(array)
// })

// router.get('/cargo/:id',async(req,res)=>{
//     const cargo=await CARGO.findById({_id: req.params.id})
//     res.status(200).json(cargo)
// })

router.post('/cargo', async (req, res) => {
    const params = req.body
    try {
        const cargo = new CARGO(params)
        cargo.save().then(() => {
            res.status(200).json({ message: 'cargo registrado' })
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
        await EMPLEADO.updateMany({departamentEmp:cargo.nameDepartament,cargoEmp:cargo.nameCargo},{$set:{departamentEmp:params.nameDepartament,cargoEmp:params.nameCargo}})
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
