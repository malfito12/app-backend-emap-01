const express=require('express')
const router=express.Router()
const PERMISO=require('../models/Permiso')
const EMPLEADO=require('../models/Empleado')

router.post('/permiso',async(req,res)=>{
    const params=req.body
    const empelado=await EMPLEADO.find()
    var cont=0;
    for(var i=0;i<empelado.length;i++){
        if(params.id_bio==empelado[i].id_bio){
            cont++;
            const permiso= new PERMISO({
                id_bio: empelado[i].id_bio,
                firstNameEmp: empelado[i].firstNameEmp,
                lastNameEmpP: empelado[i].lastNameEmpP,
                lastNameEmpM: empelado[i].lastNameEmpM,
                CIEmp: empelado[i].CIEmp,
                tipoPermiso:params.tipoPermiso,
                namePermiso: params.namePermiso,
                fechaPermisoIni:params.fechaPermisoIni,
                fechaPermisoFin:params.fechaPermisoFin
            })
            permiso.save().then(()=>{
                res.status(200).json({message:'permiso registrado'})
            })
            break;
        }
    }
    if(cont==0) res.status(300).json({message:'empleado no encontrado'})
})

router.get('/permiso',async(req,res)=>{
    const permiso= await PERMISO.find()
    res.json(permiso)
})

router.get('/permiso/:id',async(req,res)=>{
    const params=req.params.id
    const permiso= await PERMISO.findById({_id:params})
    res.status(200).json(permiso)
})

router.put('/permiso/:id',async(req,res)=>{
    const params=req.body
    await PERMISO.findByIdAndUpdate({_id: req.params.id},{
        tipoPermiso:params.tipoPermiso,
        namePermiso:params.namePermiso,
        fechaPermisoIni:params.fechaPermisoIni,
        fechaPermisoFin:params.fechaPermisoFin
    })
    res.status(200).json({message:'permiso editado'})
})

router.delete('/permiso/:id',async(req,res)=>{
    const params=req.params.id
    await PERMISO.findByIdAndDelete({_id: params})
    res.status(200).json({message:'permiso eliminado'})
})


module.exports=router