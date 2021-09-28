const express = require('express')
const router = express.Router()
const ANTIGUEDAD = require('../models/Antiguedad')

router.post("/antiguedad", async (req, res) => {
    const params = req.body
    try {
        const antiguedad = new ANTIGUEDAD(params)
        antiguedad.save(err=>{
            if(err){
                return res.status(400).send({
                    message:(err.name==="MongoError" && err.code===11000)?'el codigo ya existe': 'es otro error'
                })
            }else{
                return res.status(200).json({ message: 'registro guardado' })
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get("/antiguedad", async (req, res) => {
    try {
        const antiguedad = await ANTIGUEDAD.find({}).sort({cod:1})
        res.status(200).json(antiguedad)
    } catch (error) {
        console.log(error)
    }
})

router.get("/antiguedad/:id", async (req, res) => {
    const params = req.params.id
    try {
        const antiguedad = await ANTIGUEDAD.findById({ _id: params })
        res.status(200).json(antiguedad)
    } catch (error) {
        console.log(error)
    }
})

router.put("/antiguedad/:id",async(req,res)=>{
    const params=req.body
    try {
        await ANTIGUEDAD.findByIdAndUpdate({_id:req.params.id},params)
        res.status(200).json({message:'informacion actualizada'})
    } catch (error) {
        console.log(error)
    }
})

router.delete("/antiguedad/:id",async(req,res)=>{
    const params=req.params.id
    try {
        await ANTIGUEDAD.findByIdAndDelete({_id:params})
        res.status(200).json({message:'informacion elimida'})
    } catch (error) {
        console.log(error)
    }
})

module.exports = router