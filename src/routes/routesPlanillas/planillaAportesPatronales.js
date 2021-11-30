const express=require('express')
const SUELDO = require('../../models/modelsPlanillas/PlanillaSueldo')
const router=express.Router()

router.get('/planillaAportesPatronales',async(req,res)=>{
    const diaini = req.query.fechaini
    const diafin = req.query.fechafin
    const planilla = req.query.typePlanilla
    const array=[]
    try {
        // if(planilla==='permanente'){
            const planillaSueldo=await SUELDO.find({buscarFechaInicio:diaini,buscarFechaFinal:diafin,typePlanilla:planilla})
            if(planillaSueldo.length>0){
                const contPlanilla=planillaSueldo.length
                for(var i=0;i<contPlanilla;i++){
                    //-------------S.S.U 10%----------
                    const totalssu=parseFloat(planillaSueldo[i].auxLiquidoPagable)*0.1

                    //-------------RIESGO PROFESION AL 1.71%-----------
                    //falta para cotizantes de categiria 8 se le cobra 0.71
                    var riesgoProfesion=0;
                    if(planillaSueldo[i].cotizante==='8'){
                        riesgoProfesion=parseFloat(planillaSueldo[i].auxLiquidoPagable)*0.0071

                    }else{
                        riesgoProfesion=parseFloat(planillaSueldo[i].auxLiquidoPagable)*0.0171
                    }
                    
                    //------------APORTE SOLIDARIO 3%-----------
                    const aporteSolidario=parseFloat(planillaSueldo[i].auxLiquidoPagable)*0.03
                    //---------------PRO VIVIENDA 3%------------
                    const proVivienda=parseFloat(planillaSueldo[i].auxLiquidoPagable)*0.02
                    //------------------PROVISION AGUINALDO 8.33%---------
                    const provisionAguinaldo=parseFloat(planillaSueldo[i].auxLiquidoPagable)*0.0833
                    //-------------------PREVISION INDEMINIZ 8.33%--------
                    const previsionIndeminiz=parseFloat(planillaSueldo[i].auxLiquidoPagable)*0.0833
                    //--------------TOTAL-----------
                    var totalSuma= riesgoProfesion+aporteSolidario+proVivienda+provisionAguinaldo+previsionIndeminiz+parseFloat(planillaSueldo[i].bajaMedica)
                    //---------------------------
                    array.push({
                        itemEmp:planillaSueldo[i].numItem,
                        ciEmp:planillaSueldo[i].CIEmp,
                        fullName:planillaSueldo[i].nameEmp,
                        cargo:planillaSueldo[i].cargoEmp,
                        departament:planillaSueldo[i].departamentEmp,
                        totalGanado:planillaSueldo[i].auxLiquidoPagable,
                        ssu:totalssu.toFixed(2),
                        bajasMedicas:planillaSueldo[i].bajaMedica,
                        riesgoProfesion:riesgoProfesion.toFixed(2),
                        aporteSolidario:aporteSolidario.toFixed(2),
                        proVivienda:proVivienda.toFixed(2),
                        provisionAguinaldo:provisionAguinaldo.toFixed(2),
                        previsionIndeminiz:previsionIndeminiz.toFixed(2),
                        total:totalSuma.toFixed(2)


                    })
                }
            }
            // console.log(array)
            res.status(200).json(array)
            // console.log(planillaSueldo)
        // }else{
        //     // const planillaSueldo=await SUELDO.find({buscarFechaInicio:diaini,buscarFechaFinal:diafin,typePlanilla:planilla})
        //     // console.log(planillaSueldo)
        // }
    } catch (error) {
        console.log(error)
    }
    // console.log(diaini)
    // console.log(diafin)
    // console.log(planilla)
})


module.exports=router