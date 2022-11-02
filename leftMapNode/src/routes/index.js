const router = require('express').Router();
const deviceController = require('../controllers/deviceController')
const authController = require('../controllers/authController')
const conexion = require('../database/db')



router.get('/', (req, res) => {
  if (req.session.login) {
    res.render('dashboard', { alert: false, data: "dos", });
  } else {
    res.render('login', { alert: false });
  }
});

router.get('/gps', (req, res) => {
  let dataDevice;
  if (req.session.login) {

    // conexion.query('SELECT u.nombres, u.apellidos,d.* FROM usuarios u LEFT JOIN devices d ON u.id=d.usuario_id WHERE u.id= ? ', [req.session.iduser], async (error, dataDev) => {
    //   console.log("DATA-DEVICE/S", dataDev)
    //   dataDevice= dataDev;
    // })

    res.render('dashboard', { dataDevice: "wwww", alert: false });
  } else {
    res.render('login', { alert: false });
  }

});
// rutas para ver las paginas

// Llama a la vista de login
router.get('/login', (req, res) => {
  if (!req.session.login) {
    res.render('login', { alert: false });
  } else {
    res.render('dashboard', { alert: false, data: "tres", });
  }
});

router.get('/salir', (req, res) => {
  if (req.session.login) {
    res.render('dashboard', { alert: false, data: "cuatro", });
  } else {
    res.render('login', { alert: false });
  }
});

router.get('/registrarse', (req, res) => {
  //if (req.session.login) {
  res.render('register', { alert: false, data: "cuatro", });
  //  } else {
  // res.render('login', { alert: false });
  //  }
});

// Router para los metodos del controller deviceController
router.get('/getdatadevice/:userId', deviceController.getdatadevice);
router.post('/getdataalarmas', deviceController.getDataAlarmas);
router.post('/getdatadevicehistorial', deviceController.getdatadevicehistorial);
router.post('/setlatlng', deviceController.creardata);


// usuarios
router.post('/auth', authController.login);
router.post('/auth-api', authController.loginApi);
router.get('/logout', authController.logout);
router.post('/creauser', authController.registrar);


module.exports = router;
