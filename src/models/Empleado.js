var mongoose=require('../database')
var EMPLEADOSCHEMA={
    itemEmp:Number,
    id_bio:{
        type:String,
        require:true,
        trim:true,
        unique:true
    },
    filename:String,
    path:String,
    originalname:String,
    mimetype:String,
    size:Number,

    firstNameEmp:String,
    lastNameEmpP:String,
    lastNameEmpM:String,
    CIEmp:{
        type:String,
        require:true,
        trim:true,
        unique:true
    },
    emailEmp:String,
    sexoEmp:String,
    numCelEmp:String,
    dirEmp:String,
    // photoImgEmp:String,
    nacionalityEmp:String,
    civilStatusEmp:String,
    professionEmp:String,
    institutionDegreeEmp:String,
    ObserEmp:String,
    fechaNacEmp:String,

    fechaIng:Date,
    fechaReg:Date,
    fechaBaja:Date,
    estadoEmp:String,

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