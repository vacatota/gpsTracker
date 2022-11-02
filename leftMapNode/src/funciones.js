const { default: axios } = require('axios');
const fs = require('fs');
const moment = require("moment")
const ruta = "./logs.txt";
class Funciones {

  constructor() {

    this.mensajeRetorno = '';

  }// Fin constructor

  getMes(mes) {
    let mesSalida = '';

    switch (mes) {
      case 1:
        mesSalida = 'Ene';
        break;
      case 2:
        mesSalida = 'Feb';
        break;
      case 3:
        mesSalida = 'Mar';
        break;
      case 4:
        mesSalida = 'Abr';
        break;
      case 5:
        mesSalida = 'May';
        break;
      case 6:
        mesSalida = 'Jun';
        break;
      case 7:
        mesSalida = 'Jul';
        break;
      case 8:
        mesSalida = 'Ago';
        break;
      case 9:
        mesSalida = 'Sep';
        break;
      case 10:
        mesSalida = 'Oct';
        break;
      case 11:
        mesSalida = 'Nov';
        break;
      case 12:
        mesSalida = 'Dic';
        break;
    }
    return mesSalida;

  }

  getFechaHoraSistema() {
    /* let fechaAnt = moment("2022-09-01 09:09:19").format('YYYY-MM-DD HH:mm:ss');;
    console.log("FEcha moment: ", fechaAnt) */
    var hoy = new Date();
    return hoy.getDate() + '-' + this.getMes(hoy.getMonth() + 1) + '-' + hoy.getFullYear() + ' ' + this.agregarCero(hoy.getHours()) + ':' + this.agregarCero(hoy.getMinutes()) + ':' + this.agregarCero(hoy.getSeconds());
  }

  getHoraSistema() {
    /* let fechaAnt = moment("2022-09-01 09:09:19").format('YYYY-MM-DD HH:mm:ss');;
    console.log("FEcha moment: ", fechaAnt) */
    var hoy = new Date();
    return this.agregarCero(hoy.getHours()) + ':' + this.agregarCero(hoy.getMinutes()) + ':' + this.agregarCero(hoy.getSeconds());
  }

  getFechaHoraSistemaDate() {
    var hoy = new Date();
    return hoy.getFullYear() + '-' + this.agregarCero(hoy.getMonth() + 1) + '-' + this.agregarCero(hoy.getDate()) + ' ' + this.agregarCero(hoy.getHours()) + ':' + this.agregarCero(hoy.getMinutes()) + ':' + this.agregarCero(hoy.getSeconds());
  }

  agregarCero(nro) {
    //console.log(nro.length)
    if (nro < 10) {
      return "0" + nro;
    } else {
      return nro;
    }
  }

  getFechaHora(fechaHora) {
    return '20' + fechaHora.slice(0, 2) + '-' + fechaHora.slice(2, 4) + '-' + fechaHora.slice(4, 6) + ' ' + fechaHora.slice(6, 8) + ':' + fechaHora.slice(8, 10) + ':' + fechaHora.slice(10, 12);
  }
  getFechaHoraSinoTrack(fecha, hora) {
    return '20' + fecha.slice(4, 6) + '-' + fecha.slice(2, 4) + '-' + fecha.slice(0, 2) + " " + hora.slice(0, 2) + ':' + hora.slice(2, 4) + ':' + hora.slice(4, 6);
  }

  writeLog(destino, texto) {
    //fs.writeFileSync(destino, texto, {//Sobreescribe el texto
    fs.appendFile(destino, "\n" + texto, { encoding: 'utf8', flag: 'a' }, (error) => {
      if (error) throw error;
      console.log('Nuevo log añadido correctamente');
    });
  }

  writeLog2(texto) {

    //fs.writeFileSync(destino, texto, {//Sobreescribe el texto
    fs.appendFile("./logs2.txt", "\n" + texto, { encoding: 'utf8', flag: 'a' }, (error) => {
      if (error) throw error;
      console.log('Nuevo log2 añadido correctamente');
    });
  }
  escribirLog(texto) {
    this.writeLog(ruta, texto);
  }
  sendSms(tipoReporte, destino, placa, latLng) {
    let msn;
    let texto = this.getFechaHoraSistema() + " => Tipo reporte: << " + tipoReporte + " >>; Placa: " + placa + "; lat: " + latLng.lat + ". lng: " + latLng.lng + "; fecha dispositivo: " + latLng.fecha;
    let mensaje;
    if (tipoReporte == 'acc on') {
      mensaje = "Vehiculo de placa: " + placa + "🚙🚙 ENCENDIDO 🚙🚙, "
      msn = this.getDireccion(destino, mensaje, latLng);
      //this.writeLog(ruta, msn);
      this.writeLog(ruta, texto);
    }
    else if (tipoReporte == 'acc off') {
      mensaje = "Vehiculo de placa: " + placa + "🚗🚗 APAGADO 🚗🚗, "
      msn = this.getDireccion(destino, mensaje, latLng);
      //this.writeLog(ruta, msn);
      //this.writeLog(ruta, texto);
    }
    else if (tipoReporte == 'jt') {
      mensaje = "Vehiculo de placa: " + placa + "🚗🚗 APAGADO REMOTAMENTE 🚗🚗, "
      msn = this.getDireccion(destino, mensaje, latLng);
    }
    else if (tipoReporte == 'kt') {
      mensaje = "Vehiculo de placa: " + placa + "🚙🚙 ENCENDIDO REMOTAMENTE 🚙🚙, "
      msn = this.getDireccion(destino, mensaje, latLng);
    }
    else if (tipoReporte == 'acc alarm') {
      mensaje = "Vehiculo de placa: " + placa + " conexión de batería manipulado, "
      msn = this.getDireccion(destino, mensaje, latLng);
      //this.writeLog(ruta, msn);
      //this.writeLog(ruta, texto);
    }
    else if (tipoReporte == 'low battery') {
      mensaje = "Vehiculo de placa: " + placa + " con baterá gps baja, "
      msn = this.getDireccion(destino, mensaje, latLng);
      //this.writeLog(ruta, msn);
      //this.writeLog(ruta, texto);
    }
    else if (tipoReporte == 'help me') {
      mensaje = "Vehiculo de placa: " + placa + " necesita 🚨🚨🚨 AUXILIO🚨🚨🚨URGENTE 🚨🚨🚨 "
      msn = this.getDireccion(destino, mensaje, latLng);
      //this.writeLog(ruta, msn);
      //this.writeLog(ruta, texto);
    }
    else if (tipoReporte == 'speed') {
      mensaje = "Vehiculo de placa: " + placa + " ha superado el limite de velocidad de: " + latLng.velocidadMax + "Km/h, velocidad actual es: " + parseInt((latLng.velocidad), 0) + " Km/h. ";
      // let mensaje2 = "Vehiculo de placa: " + placa + " ha superado el limite de velocidad de: " + parseInt((latLng.velocidad), 0) + " Km/h. en:  https://maps.google.com/?q=" + latLng.lat + "," + latLng.lng + "  Fecha device: " + latLng.fecha;
      msn = this.getDireccion(destino, mensaje, latLng);
      console.log("Retorno", msn)
      //this.writeLog(ruta, msn);
      texto = this.getFechaHoraSistema() + " => Tipo reporte: << " + tipoReporte + " >> " + mensaje
      //this.writeLog(ruta, texto);
    }
    else if (tipoReporte != 'tracker') {
      this.writeLog(ruta, texto + "Original: " + latLng.velocidad + ", Fecha device: " + latLng.fecha);
    }

    // else {
    //   //mensaje = ("Vehiculo de placa: " + placa + ", ")
    //   mensaje = "Evento: " + tipoReporte + " en vehículo de placa: " + placa + " EVENTO, "
    //   this.getDireccion(destino, mensaje, latLng);
    //
    // }
  }

  async getDireccion(destino, mensaje, latLng) {
    let json, resp;
    const config = {
      method: 'GET',
      //headers: { 'Authorization': token },
      mode: 'cors',
      cache: 'default'
    };
    let url = 'https://plataforma.quicklink.com.ec/geocoding?lat=' + latLng.lat + '&lon=' + latLng.lng;
    let respuesta = await axios.get(url, config);
    json = await respuesta.data;
    mensaje = mensaje + " en: " + json.texto + ". https://maps.google.com/?q=" + latLng.lat + "," + latLng.lng;
    this.sendWatsapp(destino, mensaje);
    //return resp;

  }

  async sendWatsapp(destino, mensaje) {
    let hoy = new Date();
    console.log("destino msn: ", destino);
    let fecha = hoy.getDate() + '-' + this.getMes(hoy.getMonth() + 1) + '-' + hoy.getFullYear() + ' ' + this.agregarCero(hoy.getHours()) + ':' + this.agregarCero(hoy.getMinutes()) + ':' + this.agregarCero(hoy.getSeconds());
    console.log("Eviando Msg Watsapp: ", fecha)

    let origenNumber = "593996130606";
    let axios = require('axios');
    let data = JSON.stringify({ "sender": origenNumber, "message": mensaje, "number": destino, "tocken": "0fs8AVBNACr64NfAAAB" });
    let config = { method: 'POST', url: 'http://51.161.34.72:2000/send-message', headers: { 'Content-Type': 'application/json' }, data: data };
    await axios(config)
      .then(await function (response) {
        fs.appendFile("./logs.txt", "\n***** " + fecha + " WATSAPP enviado correctamente: " + response.data.response.body + " al Nro. +" + response.data.response.to, { encoding: 'utf8', flag: 'a' }, (error) => {
          if (error) throw error;
        })
      })
      .catch(await function (error) {
        fs.appendFile("./logs.txt", "\n#### " + fecha + " ERROR Watsapp  no enviado, " + error.config.data, { encoding: 'utf8', flag: 'a' }, (error) => {
          if (error) throw error;
        })
      });
  }
}
module.exports = Funciones;
