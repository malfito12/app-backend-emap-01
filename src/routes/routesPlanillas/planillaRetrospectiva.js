const express = require('express')
const router = express.Router()
const moment = require('moment')
const CARGO = require('../../models/Cargo')
const EMPLEADO = require('../../models/Empleado')
const KARDEXASISTENCIA = require('../../models/modelsPlanillas/KardexAsistencia')
const SERVICE = require('../../models/reportes/YearsSevice')
const CONFIG = require('../../models/GeneralConfig')
const ANTIGUEDAD = require('../../models/Antiguedad')
const RETRO = require('../../models/modelsPlanillas/PlanillaRetrospectiva')

router.post('/restrospectivaSalarial', async (req, res) => {
    const params = req.body
    console.log(params)
    try {
        const control = await RETRO.find({ year: params.year })
        // console.log(control)
        if (control.length > 0) {
            console.log('entra')
            res.status(300).json({ message: 'ya existen los registro' })
        } else {
            const arrayCargos = []
            const arrayEmpleado = []
            const cargos = await CARGO.find({})
            const config = await CONFIG.find({ estado: 'A' }).sort({ gestion: -1 }).limit(1)
            const antiguedad = await ANTIGUEDAD.find({})
            const constCargos = cargos.length
            for (var i = 0; i < constCargos; i++) {
                var haberBasico = parseFloat(cargos[i].haber_basico)
                var porcentajeAumento = haberBasico * parseFloat(params.porcentaje)
                var sumaSalario = haberBasico + porcentajeAumento
                var salario = haberBasico
                arrayCargos.push({
                    nameDepartament: cargos[i].nameDepartament,
                    nameCargo: cargos[i].nameCargo,
                    porcentajeAumento: porcentajeAumento,
                    haberAnterior: salario,
                    haberActual: sumaSalario,
                })
                // console.log(porcentajeAumento)
                // console.log(sumaSalario)
            }
            const empleado = await EMPLEADO.find({ "$and": [{ typeContrato: 'permanente' }, { estadoEmp: 'activo' }] }).sort({ itemEmp: 1 })
            const contEmpleado = empleado.length
            for (var a = 0; a < 11; a++) {
                var fechaMes1;
                var fechaMes2;
                if(a==8){
                    fechaMes1 = moment(`${params.year}-0${a + 1}-01`).format("YYYY-MM-DD")
                    fechaMes2 = moment(`${params.year}-${a + 2}-01`).subtract(1, 'day').format("YYYY-MM-DD")
                }else if(a>=9){
                    fechaMes1 = moment(`${params.year}-${a + 1}-01`).format("YYYY-MM-DD")
                    fechaMes2 = moment(`${params.year}-${a + 2}-01`).subtract(1, 'day').format("YYYY-MM-DD")
                }
                else{
                    fechaMes1 = moment(`${params.year}-0${a + 1}-01`).format("YYYY-MM-DD")
                    fechaMes2 = moment(`${params.year}-0${a + 2}-01`).subtract(1, 'day').format("YYYY-MM-DD")
                }
                var nameMes;
                switch (a) {
                    case 0: nameMes = 'ENERO'; break;
                    case 1: nameMes = 'FEBRERO'; break;
                    case 2: nameMes = 'MARZO'; break;
                    case 3: nameMes = 'ABRIL'; break;
                    case 4: nameMes = 'MAYO'; break;
                    case 5: nameMes = 'JUNIO'; break;
                    case 6: nameMes = 'JULIO'; break;
                    case 7: nameMes = 'AGOSTO'; break;
                    case 8: nameMes = 'SEPTIEMBRE'; break;
                    case 9: nameMes = 'OCTUBRE'; break;
                    case 10: nameMes = 'NOVIEMBRE'; break;
                    default: console.log('no existe mes')
                }
                for (var i = 0; i < contEmpleado; i++) {
                    const buscar = arrayCargos.find(e => e.nameCargo == empleado[i].cargoEmp)
                    if (empleado[i].fechaini > fechaMes1) {
                        arrayEmpleado.push({
                            id_bio: empleado[i].id_bio,
                            numItem: empleado[i].itemEmp,
                            ci: empleado[i].CIEmp,
                            fullName: empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM,
                            nameCargo: buscar.nameCargo,
                            diasTrab: (0).toFixed(2),
                            haberAnterior: buscar.haberAnterior,
                            haberActual: buscar.haberActual,
                            incremento: (0).toFixed(2),
                            totalGanadoPorDia: (0).toFixed(2),
                            bonoAntiguedad: (0).toFixed(2),
                            recargaNocturna: (0).toFixed(2),
                            interinato: (0).toFixed(2),
                            totalGanado: (0).toFixed(2),
                            afps: (0).toFixed(2),
                            totalDescuento: (0).toFixed(2),
                            liquidoPagable: (0).toFixed(2),
                            mes: nameMes,
                            year: params.year
                        })
                    }else {
                        const marcaciones = await KARDEXASISTENCIA.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fecha: { $gte: fechaMes1 } }, { fecha: { $lte: fechaMes2 } }] }).sort({ fecha: 1 })
                        //OBSERVACIONES--- SI EL EMPLEADO TIENE UNA FECHA DE INICIO ES MAYOR A LA DE BUSQUEDA
                        //SUMA DIAS TRABAJADOS
                        var sumTrab = 0;
                        if (marcaciones.length > 0) {
                            const contMarca = marcaciones.length
                            for (var j = 0; j < contMarca; j++) {
                                sumTrab = sumTrab + parseInt(marcaciones[j].diaTrabajado)
                            }
                            if (sumTrab >= 30) {
                                sumTrab = 30
                            }
                            // console.log(sumTrab)
                        }

                        //BONO ANTIGUEDAD   
                        var bonoAnti = 0
                        const servicioAntiguedad = await SERVICE.find({ "$and": [{ id_bio: empleado[i].id_bio }, { fechaini: { $gte: fechaMes1 } }, { fechaini: { $lte: fechaMes2 } }] }).sort({ fechaini: -1 }).limit(1)
                        if (servicioAntiguedad.length > 0) {
                            for (var k = 0; k < antiguedad.length; k++) {
                                var cambioAntiguedad = parseInt(servicioAntiguedad[0].typeAntiguedad)
                                if (cambioAntiguedad === antiguedad[k].cod) {
                                    var ss = antiguedad[k].porcentaje / 100
                                    var salarioMinimo = parseInt(config[0].salarioMinimo)
                                    var salarioAnterior = (salarioMinimo * 3) * ss
                                    var salarioAumentado = (salarioMinimo * parseFloat(params.porcentaje)) + salarioMinimo
                                    salarioAumentado = (salarioAumentado * 3) * ss
                                    bonoAnti = salarioAumentado - salarioAnterior
                                    break;
                                }
                            }
                        } else {
                            var empleAntiguedad = parseInt(empleado[i].typeAntiguedad)
                            for (var k = 0; k < antiguedad.length; k++) {
                                if (empleAntiguedad === antiguedad[k].cod) {
                                    var ss = antiguedad[k].porcentaje / 100
                                    var salarioMinimo = parseInt(config[0].salarioMinimo)
                                    var salarioAnterior = (salarioMinimo * 3) * ss
                                    var salarioAumentado = (salarioMinimo * parseFloat(params.porcentaje)) + salarioMinimo
                                    salarioAumentado = (salarioAumentado * 3) * ss
                                    bonoAnti = salarioAumentado - salarioAnterior
                                    break;
                                }
                            }
                        }

                        //RECARGA NOCTURNA

                        var totalNoc = 0;
                        if (empleado[i].cod_estH === '2') {
                            var porcentajeNoc = parseFloat(config[0].recargaNocturna)
                            var salarioNoc = ((buscar.haberAnterior * porcentajeNoc) / 30) * sumTrab
                            var salarioAumNoc = ((buscar.haberActual * porcentajeNoc) / 30) * sumTrab
                            totalNoc = salarioAumNoc - salarioNoc
                        }
                        //TOTAL GANADO POR DIA TRABAJADO
                        var totalganadopordia = 0
                        if (empleado[i].cod_estH === '2') {
                            var porcentajeNoc = parseFloat(config[0].recargaNocturna)
                            totalganadopordia = (buscar.haberActual * porcentajeNoc) / 30
                        } else {
                            totalganadopordia = buscar.haberActual / 30
                        }
                        //INTERINATO
                        var totalinterinato = 0;
                        //TOTAL GANADO-----
                        const totalganado = buscar.porcentajeAumento + bonoAnti + totalNoc + totalinterinato
                        //AFPS 12.71%----
                        var calculoAfp = parseFloat(config[0].AFP)
                        calculoAfp = calculoAfp / 100
                        const totalAfp = totalganado * calculoAfp
                        //TOTALDESCUENTO
                        const totaldescuento = totalAfp
                        //LIQUIDO PAGABLE
                        const liquidopagable = totalganado - totaldescuento

                        //------------------------------
                        arrayEmpleado.push({
                            id_bio: empleado[i].id_bio,
                            numItem: empleado[i].itemEmp,
                            ci: empleado[i].CIEmp,
                            fullName: empleado[i].firstNameEmp + " " + empleado[i].lastNameEmpP + " " + empleado[i].lastNameEmpM,
                            nameCargo: buscar.nameCargo,
                            diasTrab: sumTrab.toFixed(2),
                            haberAnterior: buscar.haberAnterior.toFixed(2),
                            haberActual: buscar.haberActual.toFixed(2),
                            incremento: buscar.porcentajeAumento.toFixed(2),
                            totalGanadoPorDia: totalganadopordia.toFixed(2),
                            bonoAntiguedad: bonoAnti.toFixed(2),
                            recargaNocturna: totalNoc.toFixed(2),
                            interinato: totalinterinato.toFixed(2),
                            totalGanado: totalganado.toFixed(2),
                            afps: totalAfp.toFixed(2),
                            totalDescuento: totaldescuento.toFixed(2),
                            liquidoPagable: liquidopagable.toFixed(2),
                            mes: nameMes,
                            year: params.year
                        })
                    }

                }

                // console.log(arrayEmpleado)
                //--------------REGISTRO DE RETROSPECTIVA-------------
                const contArrayEmple = arrayEmpleado.length
                for (var b = 0; b < contArrayEmple; b++) {
                    const existe = await RETRO.find({ "$and": [{ id_bio: arrayEmpleado[b].id_bio }, { mes: arrayEmpleado[b].mes }, { year: arrayEmpleado[b].year }] })
                    if (existe.length == 0) {
                        const retrospectiva = new RETRO(arrayEmpleado[b])
                        retrospectiva.save()
                    } else {
                        await RETRO.deleteMany({ "$and": [{ id_bio: arrayEmpleado[b].id_bio }, { mes: arrayEmpleado[b].mes }, { year: arrayEmpleado[b].year }] })
                        const retrospectiva = new RETRO(arrayEmpleado[b])
                        retrospectiva.save()
                    }
                }
            }
            res.status(200).json({ message: 'informacion registrada' })
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/restrospectivaSalarial',async(req,res)=>{
    const year=req.query.year
    const mes=req.query.mes
    // console.log(params)
    try {
        const retrospectiva=await RETRO.find({"$and":[{year:year},{mes:mes}]}).sort({numItem:1})
        // console.log(retrospectiva)
        res.status(200).json(retrospectiva)

    } catch (error) {
        
    }
})

module.exports = router