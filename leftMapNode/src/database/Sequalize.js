
const Sequelize = require('sequelize')
const sequelize = new Sequelize('gps', 'mysqlvaco', 'mysqlVac0', {

  host: '192.168.88.240',
  dialect: 'mysql'

});

sequelize.authenticate()
  .then(() => {
    console.log('BD con Sequalize Conectado')
  })
  .catch(err => {
    console.log('No se conecto')
  })


  const User = sequelize.define('usuarios', {
    id: {type: Sequelize.SMALLINT, primaryKey: true},
    nombres: Sequelize.STRING,
    apellidos: Sequelize.STRING,
    correo: Sequelize.STRING,
    telefono: Sequelize.STRING,
    documento: Sequelize.STRING,
    clave: Sequelize.STRING,
    password: Sequelize.STRING,
  })


module.exports = sequelize;
