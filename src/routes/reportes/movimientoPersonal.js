const express = require('express')
const router = express.Router()
const MOVIMIENTO = require('../../models/reportes/MovimientoPersonal')

router.get("/movimiento", async (req, res) => {
    try {
        const movimientoPersonal = await MOVIMIENTO.find({})
        res.status(200).json(movimientoPersonal)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router