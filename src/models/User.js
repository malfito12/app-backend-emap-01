var mongoose= require('../database')
var USERSCHEMA={
    username:String,
    password:String,
    // ci:{
    //     type:String,
    //     require:true,
    //     trim:true,
    //     unique:true
    // },
    email:String,
    sexo:String,
    fono:Number,
    rols:{
        type: Array,
        default: "usuario"
    },
    registerDate:Date

}
const USER=mongoose.model('user', USERSCHEMA)
module.exports={
    USER, 
    keys:[
        "username",
        "password",
        "email",
        "sexo",
        "rols",
        "fono",
    ]};