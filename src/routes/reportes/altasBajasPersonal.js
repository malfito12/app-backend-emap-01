const express = require('express')
const ALTASYBAJAS = require('../../models/reportes/AltasBajasPersonal')
const router = express.Router()

router.get('/empleadoAltasBajas', async (req, res) => {
    try {
        const alltasybajas = await ALTASYBAJAS.find({})
        res.status(200).json(alltasybajas)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router