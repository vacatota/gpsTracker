const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const socketIO = require('socket.io')
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const http = require('http');
const cors = require('cors');
const moment = require('moment');
const session = require('express-session')
// 350424065851535 teltonika
// 868166051226850>>GRA0364
// 863844054222424>>PCX8694
// 868166051206670  Moto



const app = express();
// Permite capturar datos post/formulario
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
// Para manejar sessiones
app.use(session({
  secret: 'ArmandoCatota',
  resave: false,
  saveUninitialized: false
}))
const server = http.createServer(app);
const io = socketIO(server);


const Funciones = require('./funciones');// importamos la clase Server
const funciones = new Funciones();

const conexionMysql = require('./database/db');
deviceActivos();
var latitud = 0;
var longitud = 0;
var socketGLOBALAPP;
var devicesArreglo;
var fechaAnterior = '2022-10-07 00:00:00';
var fechaActual;
var imeiAnterior = '0';
var imeiActual = '0';
var tipoReporteAnterior = '0';
var tipoReporteActual = '0';



const net = require('net');
const serverGps = net.createServer();

console.log("HTTP_PORT: ", process.env.HTTP_PORT)

var dataString;
var imei;
var debug = true;
var hoy = new Date();
//var fecha = hoy.getDate()+'-'+ getMes((hoy.getMonth()))+'-'+hoy.getFullYear();
serverGps.on('connection', (socketGps) => {
  socketGps.on('data', (data) => {

    dataString = data.toString('ascii');
    if (debug) {
      console.log("-------------- STRING DEVICE ---------------");
      console.log(dataString + " Fecha sistema: ", funciones.getFechaHoraSistema());
      console.log(" -------------- FIN STRING -----------------");
      console.log(" ");
      //console.log("Dispositvos en memoria:");
      //console.log(devicesArreglo);
    }
    var arrayData = [];
    var direccion;
    var id = 0;
    var imeiData;
    var deviceName;
    var topicTx;
    var telefono;
    var encendidoApagado;
    var velocidadmaxima = 0;
    var notificaciones;
    arrayData = dataString.split(",");
    if (arrayData.length <= 1) {
      if (debug) {
        console.log("RECIBIDO DEL DISPOSITIVO: " + arrayData + "Fecha sistema: ", funciones.getFechaHoraSistema());
      }
    } else {
      if (arrayData[0] == '*HQ') {
        console.log("Es SinoTracker");
        // procesarSinoTracker(arrayData);
      } else {
        if (arrayData[0] == '##') {
          imei = arrayData[1].slice(5, 20);
          //console.log("Vida: " + imei);
          /*    webSocketEmit("9171766111X", {
               lat: 1222,
               lng: 56565,
               fecha: "2022-10-06 12:00:00",
               velocidad: 60,
               id: "werwerwerwe",
               name: "Prueba",
               estado: "ewwew",
               //tipoReporte: tipoReporte,
               //direccion: direccion
             }); */
          pruebaVida(imei);
          fechaActual = funciones.getFechaHoraSistemaDate();
          //console.log("Ant: ", fechaAnterior);
          //console.log("Act: ", fechaActual);
          //console.log("Time: ", getTiempoTrascurrido());
          fechaAnterior = fechaActual;


          //funciones.escribirLog(funciones.getFechaHoraSistema() + ": " + imei);
          // if (false) {
          //   console.log("==============  PRIMERA PETICION ============")
          //   console.log("Ok! 1ra petción, imei: " + imei + ", se responde LOAD");
          //   // Dntic -0.19669946280312348, -78.51097934463078
          //   //funciones.sendSms('abc 1', '593992063578', 'pdf8035', { lat: "-0.19669946280312348", lng: "-78.51097934463078" });
          //   console.log("Fecha sistema: ", funciones.getFechaHoraSistema());
          //   console.log("=============================================");
          //   //funciones.sendWatsapp('+593992063578', 'Hola mensje de prueba');
          // }
          console.log("")
          console.log("¡¡¡¡ Enviar Comandos **,868166051226850,K; !!!!!!!!!!!!")
          socketGps.write("LOAD");

          //socketGps.write("**,imei:868166051226850,152,080", 'ascii'); // Apagado
          //socketGps.write("**,imei:868166051226850,J", 'ascii'); // Apagado
          //socketGps.write("**,imei:868166051226850,K", 'ascii');// Encnedido

          //socketGps.write("**,imei:863844054222424,J", 'ascii');// Apagado
          //socketGps.write("**,imei:863844054222424,K", 'ascii');// Encendido
          //socketGps.write("**,imei:863844054222424,70", 'ascii');// maximo de velocidad
          //socketGps.write("**,imei:868166051206670,J", 'ascii');// Apagado Moto
          //socketGps.write("**,imei:868166051206670,K", 'ascii');// Encendido Moto



        } else {
          if (debug) {
            console.log("=========  Arreglo para procesar ============");
            console.log(arrayData)
            console.log("Arreglo campos es: ", arrayData.length);
            console.log("=============================================");
          }
          imeiData = arrayData[0].slice(5, 20);
          //console.log("Imei 2da petición data: "+imeiData);
          // Imei/id Sinotrak: 9171766111
          console.log("IMEI a consultar es: ", imeiData)
          if ((imeiData) && (arrayData.length > 3)) {
            conexionMysql.query("SELECT d.id, d.placa, id_device AS topic, u.telefono, d.velocidadMaxima, d.notificaciones FROM devices d INNER JOIN usuarios u ON u.id=d.usuario_id  LEFT JOIN data dt ON d.id=dt.device_id where d.state= ? AND d.id_device= ? limit 1", [1, imeiData], (error, row) => {
              console.log("Consulta")
              console.log(row);
              if (error) {
                throw error;
              } else {
                if (row) {
                  id = row[0].id;
                  deviceName = row[0].placa;
                  topicTx = row[0].topic;
                  telefono = row[0].telefono;
                  let notifica = row[0].notificaciones;
                  let velocidadmaximaDB = row[0].velocidadMaxima;
                  // if (debug) {
                  //   console.log("SI existe en la BD");
                  //   console.log("Topic: ", topicTx, " Fono: ", telefono);
                  //   console.log(arrayData);
                  // }
                  let imeiFinal = imeiData;
                  let tipoReporteCoban = arrayData[1];
                  let fechaHora = arrayData[2];
                  let validoGps = arrayData[4];
                  latitud = arrayData[7];
                  longitud = arrayData[9];
                  let norteSur = arrayData[8];
                  let esteOeste = arrayData[10];
                  let velocidadCoban = ((arrayData[11]) ? arrayData[11] : 0);
                  velocidadCoban = parseInt(velocidadCoban * 1.85);
                  encendidoApagado = ((arrayData[14] == "0") ? "Apagado" : "Encendido");
                  let fechaHoraFinal = funciones.getFechaHora(fechaHora);
                  console.log("Fecha device: ", fechaHoraFinal);


                  if (validoGps == 'F') {
                    latitud = (((latitud.slice(2, 10)) / 60) + (parseInt(latitud.slice(0, 2))));
                    longitud = (((longitud.slice(3, 11)) / 60) + (parseInt(longitud.slice(0, 3))));
                    if (norteSur == 'S') { latitud = "-" + latitud; }
                    if (esteOeste == 'W') { longitud = "-" + longitud; }

                    // Maxima velocidadCoban
                    //console.log("Velocidad gps: ", velocidadCoban);
                    //console.log("Notifica: ", notifica);
                    //console.log("Maxima velocidad: ", velocidadmaximaDB);
                    if ((notifica == 'S') && (velocidadCoban >= velocidadmaximaDB)) {
                      tipoReporteCoban = 'speed';
                      console.log("Cambia tipo repote a: speed")
                    }

                    // ################################ LOGS #####################
                    if ((tipoReporteCoban == 'acc on') || (tipoReporteCoban == 'acc off') || (tipoReporteCoban == 'speed')) {
                      funciones.writeLog2(dataString + "Fecha device: " + fechaHoraFinal);
                    }
                    // ################################ FIn LOGS ##################
                    let dato = {
                      device_id: id,
                      value1: (((encendidoApagado == 'Apagado') && (tipoReporteCoban == 'tracker')) ? 'Vida' : tipoReporteCoban),
                      value2: encendidoApagado,
                      value3: "-",
                      value4: latitud,
                      value5: longitud,
                      value6: velocidadCoban,
                      value7: "-",
                      value8: "-",
                      value9: "-",
                      value10: "-",
                      value11: dataString,
                      fechaEvento: fechaHoraFinal
                    };


                    // Condiciones para enviar mensajes de Watsapp
                    fechaActual = fechaHoraFinal;
                    let segundoTranscurridos = getTiempoTrascurrido();
                    let segundos = segundoTranscurridos.totalSeg;
                    let tipoReporteActual = tipoReporteCoban;
                    imeiActual = imeiData;
                     console.log("imeiAnterior: " + imeiAnterior + ";  imeiActual: " + imeiActual + ";  tipoReporteAnterior: " + tipoReporteAnterior + "; tipoReporteActual: " + tipoReporteActual + ";  Segundos: " + segundos);

                    if ((imeiActual == imeiAnterior) && (tipoReporteAnterior == tipoReporteActual) && (segundos < 30)) {
                      console.log("No enviar, Imei y reportes iguales");
                    } else {
                      console.log("Enviar mensaje: tipo reporte es: ", tipoReporteCoban)
                      funciones.sendSms(
                        tipoReporteCoban,
                        telefono,
                        deviceName,
                        { lat: dato.value4, lng: dato.value5, fecha: dato.fechaEvento, velocidad: dato.value6, velocidadMax: velocidadmaximaDB }

                      );
                    }
                    tipoReporteAnterior = tipoReporteActual;
                    imeiAnterior = imeiActual;
                    fechaAnterior = fechaActual;
                    // Fin condiciones para enviar mensajes

                    //getDireccion({lat:dato.lat,lng:dato.longitud});
                    let datosEnviarClienteWebSocket = {
                      lat: dato.value4,
                      lng: dato.value5,
                      fecha: dato.fechaEvento,
                      velocidad: dato.value6,
                      tipoReporte: tipoReporteCoban,
                      name: deviceName,
                    }
                    insertDataMysql(dato);
                    //console.log("Topic: ", topicTx)
                    //console.log("Datos enviar: ", datosEnviarClienteWebSocket)
                    webSocketEmit(topicTx, datosEnviarClienteWebSocket);
                  } else {
                    // Obtener coordenadas de BD si no viene del gps para encendido, apagado
                    conexionMysql.query("SELECT id, value4 lat, value5 lng  FROM data WHERE device_id = ? ORDER BY 1 DESC limit 1", [id], (error, row) => {
                      if (error) {
                        throw error;
                      } else {
                        funciones.sendSms(tipoReporteCoban, telefono, deviceName, { lat: row[0].lat, lng: row[0].lng, fecha: dato.fechaEvento, velocidad: dato.value6 });
                      }
                    })
                    console.log("Sin datos Gps validos");
                  }
                }//Fin if(row)
              }// Fin si no hay error data BD
            });// FIn conexion consulta DB.
          } else {// FIn si arreglo es mayor a 2
            console.log("No tiene imei, o arreglo es muy pequeño");
            //console.log(funciones.getFechaHoraSistema());
          }
        }

      }// Fin caso contrario es SInotrack
    }// Fin del else inicial si arreglo es mayor a 1


  });//FIn socket data

  serverGps.on('error', (err) => {
    console.log('Error: ' + err.message);
  });
});
serverGps.listen(3334, () => {
  console.log("Server SocketGPS running in port: " + serverGps.address().port);
});

//#################################################

//Setings
app.engine('ejs', engine);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use(require('./routes/index'))
//app.use(require('./routes/index'))// pordefecto busca index



// Socket
//require('./socketServer')(io);// Incluimos del archivo socketServer.js

server.listen(5551, () => {
  console.log("Server app in port 5551")
});

// Websocket
io.on('connection', (socketServer) => {
  socketGLOBALAPP = socketServer;
  //console.log("New user webSockewt conected", socketServer.id);
  //socketGLOBALAPP.emit('marker', ['-0.19695583333333333', '-78.51125133333333']);
  //863844054222424
  // Para App movil
  socketServer.on('9171766111X', objLatLng => {
    //console.log("Recibiendo desde App movil: ", objLatLng)
    //socketServer.broadcast.emit("863844054222424", objLatLng);
    //getDireccion(objLatLng)
  });

});




function webSocketEmit(topicTx, datos) {
  console.log("Para enviar al cliente: ", datos);

  try {
    socketGLOBALAPP.emit(topicTx, datos);

  } catch (error) {
    console.log("Ocurrio un error al emitir al cliente: ", error);
  }

}


function insertDataMysql(dato) {
  let sql = "INSERT INTO data SET ?";
  conexionMysql.query(sql, dato, function (error, result) {
    if (error) {
      throw error;
      return error;
    } else {
      console.log("================= DATOS INSERTADOS =============");
      console.log("Ok, datos insertados correctamente ;)) ", funciones.getFechaHoraSistema());
      console.log("=================================================");
      return true;
    }
  });
}


function procesarSinoTracker(arrayData) {

  console.log("Data sinotracker: ", arrayData);
  imeiData = arrayData[1];
  // Imei/id Sinotrak: 9171766111
  console.log("IMEI a consultar es: ", imeiData)
  if ((imeiData) && (arrayData.length > 3)) {
    conexionMysql.query("SELECT d.id, d.placa, id_device AS topic, u.telefono, d.velocidadMaxima, d.notificaciones FROM devices d INNER JOIN usuarios u ON u.id=d.usuario_id  LEFT JOIN data dt ON d.id=dt.device_id where d.state= 1 AND d.id_device= ? limit 1", [imeiData], (error, row) => {

      if (row) {
        console.log("Data sino")
        console.log(row)
        id = row[0].id;
        deviceName = row[0].placa;
        topicTx = row[0].topic;
        telefono = row[0].telefono;
        notificaciones = row[0].notificaciones;
        velocidadmaxima = row[0].velocidadMaxima;
        console.log("Topic: ", topicTx, " Fono: ", telefono);

        latitud = arrayData[5];
        longitud = arrayData[7];
        let norteSur = arrayData[6];
        let esteOeste = arrayData[8];
        latitud = (((latitud.slice(2, 10)) / 60) + (parseInt(latitud.slice(0, 2))));
        longitud = (((longitud.slice(3, 11)) / 60) + (parseInt(longitud.slice(0, 3))));
        if (norteSur == 'S') { latitud = "-" + latitud; }
        if (esteOeste == 'W') { longitud = "-" + longitud; }
        let fechaHora = funciones.getFechaHoraSinoTrack(arrayData[11], arrayData[3]);
        let date = moment(fechaHora);
        // Se resta 5 horas
        let fechaFinal = date.subtract(5, 'hours').format('YYYY-MM-DD HH:mm:ss');

        //let fechaHora = funciones.getFechaHoraSistemaDate();
        let tipoReporte = 'tracker';
        //let desconocido = arrayData[3];
        let validoGps = arrayData[4];
        let velocidad = ((arrayData[9] > 0) ? arrayData[9] : 0);
        // FBFFFBFF : ?
        // FFFFBBFF apagado/ Ok;
        //FFFF9FFB  Exceso de velocidad
        encendidoApagado = ((arrayData[12] == "FFFFBBFF") ? "Apagado" : "Encendido");
        console.log("Fecha  sist: ", fechaHora);
        // ################################ LOGS #####################
        //if ((tipoReporte == 'acc on') || (tipoReporte == 'acc off')) {
        funciones.writeLog2(dataString + "Fecha  device: " + fechaFinal);
        //}
        // ################################ FIn LOGS ##################

        // Maxima velocidad
        console.log("Velocidad: ", velocidad);
        console.log("Maxima velocidad: ", velocidadmaxima);
        console.log("Notificaciones: ", notificaciones);
        if ((notificaciones == 'S') && (velocidad >= velocidadmaxima)) {
          tipoReporte = 'speed';
        }

        if (validoGps == 'A') {
          let dato = {
            device_id: id,
            value1: (((encendidoApagado == 'Apagado') && (tipoReporte == 'tracker')) ? 'Vida' : tipoReporte),
            value2: encendidoApagado,
            value3: "-",
            value4: latitud,
            value5: longitud,
            value6: parseInt((velocidad * 1.85)),
            value7: "-",
            value8: "-",
            value9: "-",
            value10: "-",
            value11: dataString,
            fechaEvento: fechaFinal
            //name:deviceName
          };
          console.log("Data insertar: ", dato);
          insertDataMysql(dato);
          console.log("Topic SinoTracker: ", topicTx)
          let datosEnviarClienteWebSocketSinotrack = {
            lat: dato.value4,
            lng: dato.value5,
            fecha: dato.fechaEvento,
            velocidad: dato.value6,
            name: deviceName,
          }
          console.log("Topic: ", topicTx)
          console.log("Datos enviar Websocket: ", datosEnviarClienteWebSocketSinotrack)

          try {
            webSocketEmit(topicTx, datosEnviarClienteWebSocketSinotrack);

          } catch (error) {
            console.log("Ocurrio un error al emit al cliente: ", error);
          }



        } else {
          console.log("Sin datos Gps validos");
        }
      } else {
        console.log("No existe DB")
      }

    });
  }
}
// Carga imeis para prueba de vida de los dispositvos
async function deviceActivos() {
  conexionMysql.query("SELECT d.id, d.placa, id_device AS imei, u.telefono, estado FROM devices d INNER JOIN usuarios u ON u.id=d.usuario_id  where d.state= 1", [], await function (error, resultDevices) {
    if (resultDevices) {
      console.log("Cargado dispositivos")
      devicesArreglo = resultDevices;
    }
  });

}
// Recibe el imei cada minuto(Coban)
function pruebaVida(imei) {

  //console.log("Hora sistema: " + funciones.getHoraSistema());

  if ((funciones.getHoraSistema() >= '19:00:00') && (funciones.getHoraSistema() <= '19:03:00')) {
    funciones.sendWatsapp('593992063578', "Tracker-sistem && Watsapp esta funcionando correctamente: " + funciones.getFechaHoraSistema());
  }

  if ((funciones.getHoraSistema() >= '05:00:00') && (funciones.getHoraSistema() <= '05:02:00')) {
    funciones.sendWatsapp('593992063578', "Tracker-sistem && Watsapp esta funcionando correctamente: " + funciones.getFechaHoraSistema());
  }

  for (let i = 0; i < devicesArreglo.length; i++) {
    if (devicesArreglo[i].imei === imei) {
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
      console.log(imei + ">>" + devicesArreglo[i].placa + ", esta vivo " + "Fecha sistema: " + funciones.getFechaHoraSistema());
      devicesArreglo[i].estado = 'apagado';
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    }
  }
}

function getTiempoTrascurrido() {
  let h, m, s, rh, rm, rs, sf;
  //let fechaAnt = moment("2022-09-01 09:09:19");
  let fechaAnt = moment(fechaAnterior);
  let fechaAct = moment(fechaActual);
  let milisegundos = fechaAct.diff(fechaAnt);

  rs = milisegundos % 60000;
  sf = rs / 1000;
  m = milisegundos / 60000;
  if (m > 60) {
    m = m % 60;
  }
  rm = milisegundos / 60;
  rm = s % 60;
  h = milisegundos / 3600000;
  let tiempo = { tiempo: (parseInt(h, 0) + ":" + parseInt(m, 0) + ":" + parseInt(sf, 0)), h: parseInt(h, 0), m: parseInt(m, 0), s: parseInt(sf, 0), totalSeg: (milisegundos / 1000) }
  return tiempo;
}


// Incluye archivos
require('./funciones.js');
