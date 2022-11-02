
//const jwt = require('jsonwebtoken')
//const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const { promisify } = require('util')

exports.registrar = async (req, res) => {
  try {
    //console.log(req.body)
    const correo = req.body.correo;
    const nombres = req.body.nombres;
    const apellidos = req.body.apellidos;
    const telefono = req.body.telefono;
    const password = req.body.password;
    const fechaCrea = '2022-08-10 12:12:00';
    let passwordHaash = await bcryptjs.hash(password, 8);
    //if (correo && clave) {
    conexion.query('INSERT INTO usuarios SET ?', { nombres: nombres, apellidos: apellidos, telefono: telefono, correo: correo, clave: 1, password: passwordHaash, usuario: correo, fechaCrea: fechaCrea }, (error, result) => {
      if (error) {
        console.log(error)
      } else {
        res.send("BIENVENIDO, USUARIO: " + nombres + " " + apellidos)
      }
    })


  } catch (error) {
    console.log(error)
  }
}

// Insertar data LatLng
exports.creardata = async (req, res) => {
  let deviceId = 0;
  let dato;
  try {
    const userId = req.body.userId;
    const lat = req.body.lat;
    const lng = req.body.lng;
    const imei = req.body.imei;
    const fecha = req.body.fecha;
    console.log(req.body)
    conexion.query("SELECT * FROM devices WHERE state= ? AND id_device= ?", [1, imei], async (error, row) => {
      if (error) {
        console.log(error)
      } else {
        if (row) {
          //console.log("Devuelve DB: ",row);
          deviceId = row[0].id;
          dato = {
            device_id: deviceId,
            value1: "tracker",
            value2: "encendido",
            value4: lat,
            value5: lng,
            fechaEvento: fecha
          };
          console.log("Data insert:", dato);
          conexion.query('INSERT INTO data SET ?', dato, (error, result) => {
            if (error) {
              throw error;
              return error;
            } else {
              res.send({ state: true, message: "Ok insertado correctamente" });
            }
          });

        }
      }
    });


  } catch (error) {
    console.log(error)
  }
}


exports.login = async (req, res) => {
  try {
    //console.log(req.body)
    const correo = req.body.correo;
    const password = req.body.password;
    if (!correo || !password) {
      let objAlertVacios = {
        alert: true,
        alertTitle: "Error",
        alertMessage: "Usuario/Clave no pueden estar vacios",
        alertIcon: 'error',
        showConfirmButton: true,
        timer: false,
        ruta: 'login'
      }
      res.render('login', objAlertVacios)
    } else {
      let passwordHaash = bcryptjs.hash(password, 0);
      if (correo && password) {
        conexion.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (error, result) => {
          console.log(result)
          if (result.length == 0 || !(await bcryptjs.compare(password, result[0].password))) {
            let objAlertDatosErroneos = {
              alert: true,
              alertTitle: "Error",
              alertMessage: "Usuario y/o Password incorrectas",
              alertIcon: 'error',
              showConfirmButton: true,
              timer: false,
              ruta: 'login'
            }
            res.render('login', objAlertDatosErroneos);
          } else {
            //console.log(result)
            const id = result[0].id
            const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
              expiresIn: process.env.JWT_TIEMPO_EXPIRA
            });
            // Sin tiempo de expiracion
            //const token = jwt.sign({id:id}, process.env. JWT_SECRETO);
            console.log("TOKEN: ", token);
            const cookiesOptions = {
              expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 1000),
              httpOnly: true
            }
            res.cookie('jwt', token, cookiesOptions);
            let objAlertOk = {
              alert: true,
              alertTitle: result[0].nombres + " " + result[0].apellidos,
              alertMessage: "Bienvenido!!",
              alertIcon: 'success',
              showConfirmButton: true,
              timer: false,
              ruta: ''
            }
            res.render('index', objAlertOk);
          }
        })
      }
    }
  } catch (error) {
    console.log(error)
  }
}



exports.createDataLatLng = async (req, res) => {
  try {
    //console.log(req.body)
    const correo = req.body.correo;
    const va = req.body.nombres;
    const apellidos = req.body.apellidos;
    const telefono = req.body.telefono;
    const password = req.body.password;
    const fechaCrea = '2022-08-10 12:12:00';
    let dato = {}
    let sql = 'INSERT INTO data SET ?';
    conexion.query(sql, dato, function (error, result) {
      if (error) {
        throw error;
        return error;
      } else {
        res.send({ mensaje: "Registro correcto!", status: true })
      }
    });
  } catch (error) {
    console.log(error)
  }
}

// Extrae la ultima ubicacin de dispositivo
exports.getdatadevice = async (req, res) => {
  var dataUbicacion;
  var dataDevices;
  try {
    //console.log(req.params.imei)
    const userId = req.params.userId;

    conexion.query("SELECT DISTINCT d.id, dv.name, dv.id_device AS imei, d.value4 AS lat,d.value5 AS lng, value2 AS motor, d.value6 AS velocidad, d.setDate, d.device_id, dv.placa, DATE_FORMAT(d.fechaEvento, ' %W: %Y-%m-%d %T')fechaEvento FROM data d INNER JOIN devices dv ON dv.id = d.device_id WHERE (d.value1 = 'tracker' OR d.value1 = 'acc on' OR  d.value1 = 'acc off' OR  d.value1 = 'vida') AND  dv.usuario_id = ? and  d.fechaEvento IN(SELECT  MAX(d2.fechaEvento) FROM data d2 GROUP BY d2.device_id)", [userId], async (error, result) => {
      dataUbicacion = result;
      console.log(dataUbicacion);
    });
    conexion.query('SELECT d.id_device,d.placa FROM usuarios u LEFT JOIN devices d ON u.id=d.usuario_id WHERE d.state=1 AND u.id= ? ', [userId], async (error, dataDevic) => {
      dataDevices = dataDevic;
      /* console.log(dataUbicacion)
      console.log(dataDevices) */
      res.json({ dataUbicacion, dataDevices });
    });
  } catch (error) {
    console.log(error)
  }
}

exports.getdatadevicehistorial = async (req, res) => {
  try {
    const deviceId = req.body.deviceId;
    const fechaInicio = req.body.fechaInicio;
    const fechaFin = req.body.fechaFin;
    //console.log(req.body)
    conexion.query("SELECT d.id, d.value7 AS voltajeBatt, d.value8 AS porcentajeBatt, value2 AS motor, d.value4 AS lat, d.value5 AS lng, d.value6 AS velocidad,  d.setDate, d.device_id, dv.placa, DATE_FORMAT(d.fechaEvento, '%Y-%m-%d %T')fechaEvento FROM data d INNER JOIN devices dv ON dv.id=d.device_id  WHERE (value1 ='tracker' OR value1 ='acc on' OR value1 ='acc off' OR value1 ='ac alarm' OR value1 ='sinot') AND dv.id_device= ? AND d.status = '1' AND d.fechaEvento BETWEEN  ? AND ? ORDER BY d.fechaEvento ASC", [deviceId, fechaInicio, fechaFin], async (error, result) => {
      //console.log(result)
      res.json(result);
    })

  } catch (error) {
    console.log(error)
  }
}
// Extrae datos de alarmas de un dispositivo
exports.getDataAlarmas = async (req, res) => {
  try {
    const imei = req.body.imei;
    const fechaInicio = req.body.fechaInicio;
    const fechaFin = req.body.fechaFin;
    conexion.query("SELECT d.id, case  when ( value1 = 'acc on') then 'Vehículo encendido' when ( value1 = 'acc off') then 'Vehículo apagado'  when ( value1 = 'speed') then CONCAT('Exceso de velocidad a: ',' ',(d.value6 * 1.85),' Km/h.') when ( value1 = 'help me') then 'Solicitó auxilio' when ( value1 = 'ac alarm') then 'Energia dispositvo GPS manipulado '  end alarma,  value1 AS alarmas, value2 AS motor, d.value4 AS lat, d.value5 AS lng, d.value6 AS velocidad,  d.setDate, d.device_id, dv.placa, DATE_FORMAT(d.fechaEvento, '%Y-%m-%d %T')fechaEvento FROM data d INNER JOIN devices dv ON dv.id=d.device_id  where d.value1 != 'tracker' AND d.value1 != 'vida' AND dv.id_device= ? AND d.status = '1' AND d.fechaEvento BETWEEN  ? AND ? ORDER BY d.fechaEvento DESC", [imei, fechaInicio, fechaFin], async (error, result) => {
      res.json(result);
    });

  } catch (error) {
    console.log(error)
  }
}

exports.isAuthenticated = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // Verificacion y firma de Token
      const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
      conexion.query('SELECT * FROM usuarios WHERE id = ?', [decodificada.id], (error, results) => {
        if (!results) { return next() }
        req.user = results[0]
        return next()
      })
    } catch (error) {
      console.log(error)
      return next()
    }
  } else {
    res.redirect('/login'); // si no esta valido se va a login
  }
}

exports.logout = (req, res) => {
  res.clearCookie('jwt')
  return res.redirect('/')
}
