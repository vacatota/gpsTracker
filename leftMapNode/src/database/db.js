
const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
//console.log("PORT:", process.env.PORT)
const conexion = mysql.createConnection({
  /*
  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_DATABASE,
    // timezone: process.env.DB_TIMEZONE
   */
  host: "192.168.88.240",
  user: "mysqlvaco",
  password: "mysqlVac0",
  database: "gps",
  timezone: 'utc'
  //port: 3306,
});

conexion.connect((error) => {
  if (error) {
    console.log(error)
  }

  //console.log(".Env: ", process.env.DB_DATABASE);
  console.log("Conexion correcta a Mysql");

});
module.exports = conexion;

/*
Formatea el valor de fecha de acuerdo con la cadena de formato. Se pueden usar los siguientes especificadores para la cadena de formato:
Especificador 	Descripción
%M 	Nombre del mes (January..December)
%W 	Nombre de día (Sunday..Saturday)
%D 	Día del mes con sufijo en inglés (0th, 1st, 2nd, 3rd, etc.)
%Y 	Año, numérico con 4 dígitos
%y 	Año, numérico con 2 dígitos
%X 	Año para la semana donde el domingo es el primer día de la semana, numérico de 4 dígitos; usado junto con %V
%x 	Año para la semana donde el lunes es el primer día de la semana, numérico de 4 dígitos; usado junto con %v
%a 	Nombre de día de semana abreviado (Sun..Sat)
%d 	Día del mes, numérico (00..31)
%e 	Día del mes, numérico (0..31)
%m 	Mes, numérico (00..12)
%c 	Mes, numérico (0..12)
%b 	Nombre del mes abreviado (Jan..Dec)
%j 	Día del año (001..366)
%H 	Hora (00..23)
%k 	Hora (0..23)
%h 	Hora (01..12)
%I 	Hora (01..12)
%l 	Hora (1..12)
%i 	Minutos, numérico (00..59)
%r 	Tiempo, 12-horas (hh:mm:ss seguido por AM o PM)
%T 	Tiempo, 24-horas (hh:mm:ss)
%S 	Segundos (00..59)
%s 	Segundos (00..59)
%f 	Microsegundos (000000..999999)
%p 	AM o PM
%w 	Día de la semana (0=Sunday..6=Saturday)
%U 	Semana (00..53), donde el domingo es el primer día de la semana
%u 	Semana (00..53), donde el lunes es el primer día de la semana
%V 	Semana (01..53), donde el domingo es el primer día de la semana; usado con %X
%v 	Semana (01..53), donde el lunes es el primer día de la semana; usado con %X
%% 	Un '%' literal.

El resto de los caracteres se copian tal cual al resultado sin interpretación. El especificador de formato %f está disponible desde MySQL 4.1.1. Desde MySQL 3.23, se requiere el carácter '%' antes de los caracteres de especificación de formato. En versiones de MySQL más antiguas, '%' era opcional. El motivo por el que los rangos de meses y días empiecen en cero es porque MySQL permite almacenar fechas incompletas como '2004-00-00', desde MySQL 3.23.

*/
