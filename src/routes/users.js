const express = require('express')
const router = express.Router()
var crypto = require('crypto')
const CryptoJS = require('crypto-js')
const nodemailer = require('nodemailer')
const USEROBJET = require('../models/User')
const KEYS = USEROBJET.keys
const USER = USEROBJET.USER

const jwt = require("jsonwebtoken")
const keycypher = "password123456"
const llave = '123456'

router.post('/user', async (req, res, next) => {
    var params = req.body
    // console.log(params)
    var name = await USER.find({ username: params.username })
    var email = await USER.find({ email: params.email })
    if (name.length >= 1 || email.length >= 1) {
        res.status(300).json({
            "msn": "ya existe el monbre de usuario o email"
        });
        return;
    }
    params["registerDate"] = new Date()
    // params["rols"]=['usuario']
    if (params.password == null) {
        res.status(300).json({
            "msn": "no tiene el password"
        })
        return;
    }
    //hash de password
    params["password"] = crypto.createHash('md5').update(params.password).digest('hex')
    // params["password"] = CryptoJS.AES.encrypt(params.password, llave).toString()
    var user = new USER(params)
    user.save().then(() => {
        res.status(200).json(params)
    })
})


router.get("/consultaUser", async (req, res) => {
    const cantUser = await USER.find({}).countDocuments()
    // console.log(cantUser)
    res.status(200).json(cantUser)
})


router.get('/user', verifyTokenAdmin, verifyTokenUser, (req, res, next) => {
// router.get('/user', (req, res, next) => {
    var params = req.query
    // console.log(params.email)
    var SKIP = 0;
    var LIMIT = 100;
    var order = 1;
    var filter = {}
    if (params.skip) {
        SKIP = parseInt(params.skip)
    }
    if (params.limit) {
        LIMIT = parseInt(params.limit)
    }
    if (params.order) {
        order = parseInt(params.order)
    }
    if (params.id) {
        filter["_id"] = params.id
    }
    if (params.email) {
        filter["email"] = params.email
    }
    if (params.username) {
        filter["username"] = params.username
    }
    if (params.search) {
        var regularexpresion = new RegExp(params.search, "g")
        filter["username"] = regularexpresion
    }
    USER.find(filter).skip(SKIP).limit(LIMIT).sort({ username: order }).exec((err, docs) => {
        if (err) {
            res.status(300).json({
                "msn": "error en la base de datos"
            })
            return;
        }
        res.status(200).json(docs)
    })
})

// router.delete('/user',(req,res,nest)=>{
//     var params=req.query
//     if(params.id==null){
//         res.status(300).json({
//             "msn":"faltan parametos"
//         })
//         return;
//     }
//     USER.deleteOne({_id: params.id},(err, docs)=>{
//         if(err){
//             res.status(300).json({
//                 "msn":"no se logro borrar el daño"
//             })
//             return;
//         }
//         res.status(200).json(docs)
//         return;
//     })
// })

router.delete('/user/:id', async (req, res) => {
    const usuarios = await USER.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'usuario eliminado' })
})

router.put('/user/:id', async (req, res) => {
    const params = req.body
    var passwordcypher = crypto.createHash('md5')
        .update(params.password)
        .digest('hex')
    await USER.findByIdAndUpdate({ _id: req.params.id }, {
        username: params.username,
        ciUser:params.ciUser,
        // password: params.password,
        firstName: params.firstName,
        lastNameP: params.lastNameP,
        lastNameM: params.lastNameM,
        repeatPass: params.password,
        password: passwordcypher,
        email: params.email,
        sexo: params.sexo,
        rols: params.rols
    })
    res.status(200).json({ message: 'usuario actualizado' })
})
// router.patch('/user', (req, res, next) => {
//     var params = req.query
//     var data = req.body
//     if (params.id == null) {
//         res.status(300).json({
//             "msn": "faltan parametos"
//         })
//         return;
//     }
//     var objkeys = Object.keys(data)
//     for (var i = 0; i < objkeys.length; i++) {
//         if (!checkkeys(objkeys[i])) {
//             res.status(300).json({
//                 "msn": "tus parametos son iconrrectos" + objkeys[i]
//             })
//             return;
//         }
//     }
//     USER.updateOne({ _id: params.id }, data).exec((err, docs) => {
//         if (err) {
//             res.status(300).json({
//                 "msn": "error en la base de datos"
//             })
//             return;
//         }
//         res.status(200).json(docs)
//     })
// })
const checkkeys = key => {
    for (var j = 0; j < KEYS.length; j++) {
        if (key == KEYS[j]) {
            return true
        }
    }
    return false
}

router.post('/login', async (req, res, next) => {
    var params = req.body;
    // console.log(params)
    // const usuario = await USER.find({ email: params.email })
    const usuario = await USER.find({ username: params.username })
    // console.log(usuxario)
    var passwordcypher = crypto.createHash('md5')
        .update(params.password)
        .digest('hex')

    // var passwordcypher = CryptoJS.AES.encrypt(params.password, llave).toString()
    // var passwordcypher1 = CryptoJS.AES.encrypt(params.password, llave).toString()
    // var passwordcypher2 = CryptoJS.AES.encrypt(params.password, llave).toString()
    // console.log(passwordcypher1)
    // console.log(passwordcypher2)

    // // var data=CryptoJS.AES.encrypt(params.password,llave).toString()
    // // var data2=CryptoJS.AES.decrypt(data,llave)
    // // var data3=JSON.stringify(data2.toString(CryptoJS.enc.Utf8))
    // // console.log(data)
    // // console.log(data3)
    // const ss=await USER.find({"$and":[{email:params.email},{rols:params.rols}] })
    // console.log(ss)

    // USER.find({ email: params.email, password: passwordcypher, rols: params.rols })
    USER.find({ username: params.username, password: passwordcypher, rols: params.rols })
        .exec((err, docs) => {
            if (err) {
                res.status(300).json({
                    "msm": "problemas con la Base de datos"
                })
                return;
            }
            if (docs.length == 0) {
                res.status(300).json({
                    "msn": "Usuario , password o rol incorrecto"
                })
                return;
            } else {
                jwt.sign(
                    { username: params.username, password: passwordcypher, rols: params.rols },
                    keycypher,
                    { expiresIn: 60 * 60 * 24 },
                    (err, token) => {
                        if (err) {
                            res.status(300).json({
                                "msn": "err con jwt"
                            })
                            return
                        }
                        res.status(200).json({
                            "token": token,
                            "rols": usuario[0].rols[0],
                            "username": usuario[0].username,
                        })
                        return;
                    }
                )
            }
        })

})

async function verifyTokenAdmin(req, res, next) {
    const token = req.headers['authorization']
    if (!token) {
        return res.status(401).json({
            auth: false,
            message: 'no tiene token'
        })
    }
    req.userId = token
    jwt.verify(token, keycypher, (err, authData) => {
        if (err) {
            return res.status(401).json({
                auth: false,
                message: 'token incorrecto'
            })
        }
        // var email = authData.email
        var username = authData.username
        // USER.find({ email: email }).exec((err, docs) => {
        USER.find({ username: username }).exec((err, docs) => {
            if (err) {
                return res.status(401).json({
                    auth: false,
                    message: 'error en la base de datos'
                })
            }
            if (docs[0].toJSON().rols[0] == "admin") {
                next()
            }
            else {
                return res.status(401).json({
                    auth: false,
                    message: 'usted no cuenta con los permisos'
                })
            }
        })
    })
}
async function verifyTokenUser(req, res, next) {
    const token = req.headers['authorization']
    if (!token) {
        return res.status(401).json({
            auth: false,
            message: 'no tiene token'
        })
    }
    req.userId = token
    jwt.verify(token, keycypher, (err, authData) => {
        if (err) {
            return res.status(401).json({
                auth: false,
                message: 'token incorrecto'
            })
        }
        // var email = authData.email
        var username = authData.username
        USER.find({ username: username }).exec((err, docs) => {
            if (err) {
                return res.status(401).json({
                    auth: false,
                    message: 'error en la base de datos'
                })
            }
            if (docs[0].toJSON().rols[0] == "usuario" || docs[0].toJSON().rols[0] == "admin") {
                next()
            }
            else {
                return res.status(401).json({
                    auth: false,
                    message: 'usted no cuenta con los permisos'
                })
            }
        })
    })
}

//---------------ENVIO AL CORREO ELECTRONICO---------------
router.post('/password', async (req, res) => {
    const params = req.body
    // console.log(params)
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            // user:"alextufielamigo1@gmail.com",
            user: params.emailPass,
            pass: params.contraPass
        }

    })
    var mailOptions = {
        from: 'EMAP',
        to: params.emailPass,
        subject: "enviado desde emap",
        text: `hola como estas ${params.namePass}`
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send(error.message)
        } else {
            console.log("email enviado")
            res.status(200).jsonp(req.body)
        }
    })
})
//-----------------------------------------------------
router.post("/recuperar-password",async(req,res)=>{
    const params=req.body
    try {
        const password=await USER.find({ciUser:params.ciPass,email:params.emailPass})
        if(password.length>0){
            const onlypass=password[0].repeatPass
            const onlyuser=password[0].username
            const data={password:onlypass,user:onlyuser}
            res.status(200).json(data)
        }else{
            res.status(300).json({message:'no existe el usuario'})
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;