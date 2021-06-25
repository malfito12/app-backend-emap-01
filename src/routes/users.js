const express = require('express')
const router = express.Router()
var crypto = require('crypto')
const USEROBJET = require('../models/User')
const KEYS = USEROBJET.keys
const USER = USEROBJET.USER

const jwt = require("jsonwebtoken")
const keycypher = "password123456"

router.post('/user', async (req, res, next) => {
    var params = req.body
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
    var user = new USER(params)
    user.save().then(() => {
        res.status(200).json(params)
    })
})

router.get('/user', verifyTokenAdmin, verifyTokenUser, (req, res, next) => {
    var params = req.query
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
    await USER.findByIdAndUpdate({ _id: req.params.id }, {
        username: params.username,
        password: params.password,
        email: params.email,
        sexo: params.sexo,
        rols: params.rols
    })
    res.status(200).json({message:'usuario actualizado'})
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

router.post('/login', (req, res, next) => {
    var params = req.body;
    var passwordcypher = crypto.createHash('md5')
        .update(params.password)
        .digest('hex')
    USER.find({ email: params.email, password: passwordcypher, rols: params.rols })
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
                    { email: params.email, password: passwordcypher, rols: params.rols },
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
                            "token": token
                        })
                        return;
                    }
                )
            }
        })
})

function verifyTokenAdmin(req, res, next) {
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
        var email = authData.email
        USER.find({ email: email }).exec((err, docs) => {
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
function verifyTokenUser(req, res, next) {
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
        var email = authData.email
        USER.find({ email: email }).exec((err, docs) => {
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

module.exports = router;