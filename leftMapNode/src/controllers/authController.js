//const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const { promisify } = require('util')


// Metodo para login de usuario
exports.login = async (req, res) => {
  //var dataUser;
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
          //console.log(result)
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
            console.log("Id: ", result[0].id);
            conexion.query('SELECT u.nombres, u.apellidos,d.* FROM usuarios u LEFT JOIN devices d ON u.id=d.usuario_id WHERE u.id= ? ', [result[0].id], async (error, dataUser) => {
              //console.log("Data devolver login: ", dataUser)

              req.session.login = true;
              req.session.iduser = result[0].id;
              // const id = result[0].id
              // const token = jwt.sign({id:id}, process.env. JWT_SECRETO,{
              //   expiresIn: process.env.JWT_TIEMPO_EXPIRA
              // });
              // // Sin tiempo de expiracion
              // //const token = jwt.sign({id:id}, process.env. JWT_SECRETO);
              // console.log("TOKEN: ", token);
              // const cookiesOptions ={
              //   expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 1000),
              //   httpOnly:true
              // }
              // res.cookie('jwt', token, cookiesOptions);
              let objAlertOk = {
                alert: true,
                alertTitle: dataUser[0].nombres + " " + dataUser[0].apellidos,
                topicRx: dataUser[0].id_device,
                userId: dataUser[0].usuario_id,
                alertMessage: "Bienvenido!!",
                alertIcon: 'success',
                showConfirmButton: true,
                timer: false,
                login: true,
                ruta: 'gps'
                //dataUser: { data: dataUser }
              }

              //res.send(objAlertOk);
              res.render('dashboard', objAlertOk);
            })
          }
        })

      }
    }
  } catch (error) {
    console.log(error)
  }
}


exports.registrar = async (req, res) => {
  try {
    console.log(req.body)
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

exports.loginApi = async (req, res) => {
  try {
    //console.log(req.body)
    const correo = req.body.correo;
    const password = req.body.password;
    if (!correo || !password) {
      res.send({ login: false, msg: "No existe datso de login" });

    } else {
      let passwordHaash = bcryptjs.hash(password, 0);
      if (correo && password) {
        conexion.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (error, result) => {
          console.log(result)
          if (result.length == 0 || !(await bcryptjs.compare(password, result[0].password))) {
            //res.render('login', objAlertDatosErroneos);
            res.send({ login: false, msg: "Clave/usuario incorrecto" });
          } else {
            //console.log(result)
            const id = result[0].id
            // const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
            //   expiresIn: process.env.JWT_TIEMPO_EXPIRA
            // });
            // Sin tiempo de expiracion
            //const token = jwt.sign({id:id}, process.env. JWT_SECRETO);
            //console.log("TOKEN: ", token);
            // const cookiesOptions = {
            //   expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 1000),
            //   httpOnly: true
            // }
            // res.cookie('jwt', token, cookiesOptions);
            res.send({ login: true, msg: "Acceso correcto", id:id,timeSend:60});
          }
        })
      }
    }
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
  //res.clearCookie('jwt')
  req.session.login = false;
  return res.redirect('/salir')
}








function sendWatsapp() {
  var axios = require('axios');
  var data = JSON.stringify({
    "username": "AC_Test",
    "message": "Hola axios",
    "to": "+593992063578"
  });

  var config = {
    method: 'post',
    url: 'https://api.macrosoft.com.uy/AC_Test_whatsapp',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFDX1Rlc3QiLCJpYXQiOjE2NTYzNjgwMzB9.VhXOfCGF47E9a3tQ1di3em7J7NONnahh4XhL_vahFCc',
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
}
