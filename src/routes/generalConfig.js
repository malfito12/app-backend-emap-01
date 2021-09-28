const express = require('express')
const router = express.Router()
const CONFIG = require('../models/GeneralConfig')

router.post('/generalconfig', async (req, res) => {
    const params = req.body
    // console.log(params)
    const generalConfig = new CONFIG(params)
    generalConfig.save().then(() => {
        res.status(200).json({ message: 'Configuracion General Registrada' })
    })
})

router.get('/generalconfig', async (req, res) => {
    // const general=await CONFIG.find().sort({gestion:1})
    const general = await CONFIG.find().sort({ gestion: -1 })
    // const general=await CONFIG.find()
    res.status(200).json(general)
})

router.put("/generalconfig/:id", async (req, res) => {
    const params = req.params.id
    const cuerpo = req.body
    // console.log(params)
    // console.log(cuerpo)
    try {
        await CONFIG.findByIdAndUpdate({ _id: params }, cuerpo)
        res.status(200).json({ message: 'informacion actualizada' })
    } catch (error) {
        console.log(error)
    }
})

router.delete("/deleteConfig/:id", async (req, res) => {
    const params = req.params.id
    // console.log(params)
    try {
        await CONFIG.findOneAndDelete({ _id: params })
        res.status(200).json({ message: 'informacion eliminada' })
    } catch (error) {
        consolo.log(error)
    }
})


module.exports = router
