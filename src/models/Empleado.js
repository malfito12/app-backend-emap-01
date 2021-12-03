const mongoose=require('../database')
const EMPLEADOSCHEMA={
    // id_bio:{
    //     type:String,
    //     require:true,
    //     trim:true,
    //     unique:true
    // },
    id_bio:String,
    itemEmp:String,
    lastNameEmpP:String,
    lastNameEmpM:String,
    firstNameEmp:String,
    nacionalityEmp:String,
    CIEmp:{
        type:String,
        require:true,
        trim:true,
        unique:true
    },
    fechaNacEmp:String,
    sexoEmp:String,
    cargoEmp:String,
    haber_basico:String,
    departamentEmp:String,
    typeContrato:String,
    clasificacionLab:String,
    typeHorario:String,
    cod_horario:String,
    typeAntiguedad:String,
    AFP:String,
    cod_estH:String,
    cotizante:String,

    dirEmp:String,
    numCelEmp:String,
    civilStatusEmp:String,
    afilSindicato:String,
    lugarNacimiento:String,
    emailEmp:String,
    professionEmp:String,
    institutionDegreeEmp:String,
    estadoEmp:String,
    ObserEmp:String,

    // fechaIni:String,
    // fechaFin:String,
    fechaReg:Date,
    fechaBaja:String,

    //asignacion de horario
    tolerancia:Number,
    ingreso1:String,
    salida1:String,
    ingreso2:String,
    salida2:String,
    fechaini:String,
    fechafin:String,
    
    //cloudinary-------------------------------------
    avatar:String,
    cloudinary_id:String,




    //multer ----------------------------------------
    // filename:String,
    // path:String,
    // originalname:String,
    // mimetype:String,
    // size:Number,


    //-------------------------------------------------


    // photoImgEmp:String,


    // emp_id_doc:Number,

    // emp_Email:String,
    // emp_Fecha_nac:Date,
    // emp_Sexo:String,
    // emp_Fono:String,
    // emp_Direcc:String,
    // emp_Imagen:String,
    // emp_Nacionalidad:String,
    // emp_Fecha_ing:Date,
    // emp_Fecha_reg:Date,
    // emp_Fecha_baja:Date,
    // emp_Estado_civil:String,
    // emp_Profesion:String,
    // emp_Grado_instr:String,
    // emp_Obser:String,
//----------------------------------
    // paterno:String,
    // materno:String,
    // casada:String,
    // nombre1:String,
    // nombre2:String,
    // lugar_nacimiento:String,

    // cod_tcar:Number,
    // cod_dpto:Number,
    // cod_tcon:Number,
    // cod_thor:Number,
    // tip_reg:String,

    // interinato:String,
    // escalafon:String,
    // af_sind:String,
    // tmp_dj:Number,
    // id_usu:Number,
    // brand:String,
    
    // nrossu:String,
    
    
    // tipo_doc:String,
    // extci:String,
    // clas_lab:String,
    // afp:String,
    // cotiz:Number,
    // nuacua:Number,
    // ultimac_act:Date
}
const EMPLEADO=mongoose.model('empleados',EMPLEADOSCHEMA);
module.exports=EMPLEADO