const express = require('express')
const CONTHRS = require('../../models/horarioContinuo/ContHrs')
const router = express.Router()

router.get("/horarioContinuo", async (req, res) => {
    try {
        const params = await CONTHRS.find()
        res.status(200).json(params)
    } catch (error) {
        console.log(error)
    }
})

router.put("/horarioContinuo/:id",async(req,res)=>{
    const params=req.body
    try {
        await CONTHRS.findByIdAndUpdate({_id:req.params.id}, params)
        res.status(200).json({message:'dato actualizado'})
    } catch (error) {
        console.log(error)
    }
})


module.exports = router