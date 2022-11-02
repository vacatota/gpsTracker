////////////////////////////////////////////////////
// VARIABLES GLOBALES
///////////////////////////////////////////////////
var topicDeviceRx;
var segirDevice = false;
var latLngAnterior = { lat: 0, lng: 0 };
var latLngSiguiente = { lat: 0, lng: 0 };
var fechasHoras = { ant: '2022-01-01 00:00:00', sig: '' };
var distancia = 0;
var tiempoAnterior;
var tiempoActual;
var color; // Color para las lineas de seguimineto
var topicEscucahdor = 'XXXXXXXXX';
var markerOriginal;
var markerCar;
var fechaActual;
var url = 'http://201.183.243.135:5551';
//var url = 'http://192.168.88.250:5551';
/////////////////////////////////////////////
// DEFINICION DE ICONOS MARKERS
////////////////////////////////////////////
const iconCar = L.icon({
	iconUrl: '/img/iconCar.png',
	iconSize: [60, 60],
	iconAnchor: [30, 60]
});
const iconCarVerde = L.icon({
	iconUrl: '/img/iconCarVerde.png',
	iconSize: [60, 60],
	iconAnchor: [30, 60]
});
const iconCarGris = L.icon({
	iconUrl: '/img/iconCarGris.png',
	iconSize: [60, 60],
	iconAnchor: [30, 60]
});
const iconParqueado = L.icon({
	iconUrl: '/img/iconP.png',
	iconSize: [60, 60],
	iconAnchor: [30, 60]
});
// Constante de IO
const socketClient = io();
// VARIABLES PARA EL MAPA
let coordenaInicio = [-0.196837, -78.510973];
var zoom = 15;
var map = L.map('map').setView(coordenaInicio, zoom);
//Evento cuando la pagina ha termiando de cargar

//Load
var loader = document.getElementById("idLoader");
function cargaLoad(opcion) { if (opcion) { loader.classList.add("loader") } else { loader.classList.remove("loader") } }
// Fin Load
setMapa();

//const getTime = () => {
//const date = moment('2022-09-29 02:00:00');//.format('YYYY-MM-DD HH:mm');//.format("HH:mm:ss")//.format('HH:mm:ss');//.subtract(2, 'hours')
//const minute = date.minutes()
//.format('YYYY-MM-DD HH:mm')
//let fechaFinal = date.subtract(5, 'hours').format('YYYY-MM-DD HH:mm:ss')
//alert(fechaFinal)
//}

window.addEventListener('load', function () {
	// Fecha actual para campos de buscqueda de historial
	fechaActual = moment().format('YYYY-MM-DD')
	document.getElementById('fechaInicio').value = fechaActual;
	document.getElementById('fechaFin').value = fechaActual;
	document.getElementById('fechaInicioAlarmas').value = fechaActual;
	document.getElementById('fechaFinAlarmas').value = fechaActual;


	// Extraccion de valor del repositorio local del nvegador
	userId = localStorage.getItem('userId');
	topicDeviceRx = localStorage.getItem('topic');
	console.log("user id: ", userId)
	getUltimaUbicacion(userId);
	iniciarEscucharEventos(topicDeviceRx)

	// Escuchador de eventos de lsobotones derechos del mapa
	let btnUno = document.getElementById("refresh");
	btnUno.onclick = refrescaPagina;
	let traeAlarmas = document.getElementById("traeAlarmas");
	traeAlarmas.onclick = getAlarmas;
	let alarmas = document.getElementById("btnAlarmas");
	alarmas.onclick = getAlarmas;
	let btnTres = document.getElementById("seguirUnidad");
	btnTres.onclick = setSegirDevice;
	let buscarDataRuta = document.getElementById("buscar-data-gps");
	buscarDataRuta.onclick = getDataGps;
	let salirSistema = document.getElementById("logout");
	salirSistema.onclick = logout;
	console.log("Topic escuchador cargado: ", topicDeviceRx)
	//console.log(getTiempoPasado());
});

function getAlarmas(e) {
	let fechaI = document.getElementById("fechaInicioAlarmas").value;
	let fechaF = document.getElementById("fechaFinAlarmas").value;
	e.preventDefault();
	cargaLoad(true);
	let template = ``;
	let bodyTable = document.getElementById("dataAlarmas");
	let nro = 1;
	let dataSend = { imei: topicDeviceRx, fechaInicio: fechaI + " 00:00:00", fechaFin: fechaF + " 23:59:59" }
	fetch(url + '/getdataalarmas/',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json', "X-Requested-With": "XMLHttpRequest" },
			body: JSON.stringify(dataSend), // data can be `string` or {object}!
			mode: 'cors',
		})
		.then(response => response.json())
		.then(json => {
			console.log("data alarmas", json);
			if (json.length > 0) {
				json.forEach((dat) => {
					template += `
			 <tr>
			 <td>${nro}</td>
			 <td>${dat.placa}</td>
			 <td>${dat.fechaEvento}</td>
			 <td>${dat.alarma} en: <a target="_blank" href="https://maps.google.com/?q=${dat.lat},${dat.lng}">Mapa</a></td></tr>`;
					nro++;
				});
			} else {
				template = `<tr><td colspan="4"><p class="text-center">Aún no existe registro en esta tabla</p></td></tr>`;
			}
			bodyTable.innerHTML = template;
			cargaLoad(false);
		});
}
// obtiene historial de recorrido de un dispositivo
function getDataHistorialDevice(dataSend) {
	cargaLoad(true)
	segirDevice = true;
	let largoData = 0;
	fetch(url + '/getdatadevicehistorial/',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json', "X-Requested-With": "XMLHttpRequest" },
			body: JSON.stringify(dataSend), // data can be `string` or {object}!
			mode: 'cors',
		})
		.then(response => response.json())
		.then(json => {
			console.log(json);
			largoData = json.length;
			color = setColoresAleatorios();
			for (let i = 1; i < largoData; i++) {
				document.getElementById("placa").innerHTML = json[0].placa;
				tiempoActual = json[i].fechaEvento;
				//map.panTo(new L.LatLng(json.lat, json.lng));// Centrar mapa en marker recibido de evento
				latLngSiguiente = { lat: json[i].lat, lng: json[i].lng };
				//setTimeout(function () {
				drawHistorial(latLngAnterior, latLngSiguiente, json[i], i, largoData, color)
				latLngAnterior = latLngSiguiente;
				//}, 1000);
			}
			cargaLoad(false)
		})
	distancia = 0;
}

// Se obtiene la ultima ubicacion
function getUltimaUbicacion(userId) {
	cargaLoad(true);
	fetch(url + '/getdatadevice/' + userId,
		{
			method: 'GET',
			//headers: { 'Content-Type': 'application/json', "X-Requested-With": "XMLHttpRequest" },
			//body: JSON.stringify(dataSend), // data can be `string` or {object}!
			mode: 'cors',
		})
		.then(response => response.json())
		.then(json => {
			console.log("Data response ultima ubicacion:", json)
			setUltimaUbicacion(json.dataUbicacion);
			setSelectDevices(json.dataDevices);
			cargaLoad(false);
		})
}


function logout() {
	Swal.fire({
		title: 'Seguro deseas salir?',
		text: "Se cerrará la session!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, salir!'
	}).then((result) => {
		if (result.isConfirmed) {
			// Swal.fire(
			// 	'Adios!',
			// 	// 'Your file has been deleted.',
			// 	'success'
			// )
			window.open("/logout");
		}
	})
	// 	if (window.confirm("Realmente deseas salir del sistema?")) {
	//   window.open("/logout", "Thanks for Visiting!");
	// }
}


// Calculamos tiempos
// Devuelve un objeto {h:horas,m:minutos,s.segundos, milis:milisegundos}
function getTiempoTrascurrido(fechaAnterior, fechaActual) {
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
	let tiempo = { tiempo: (parseInt(h, 0) + ":" + parseInt(m, 0) + ":" + parseInt(sf, 0)), h: parseInt(h, 0), m: parseInt(m, 0), s: parseInt(sf, 0), milis: milisegundos }
	return tiempo;
}

// Extrae data de un dispositivo para dibujar el historial de recorrido
function getDataGps() {
	cargaLoad(true);

	let deviceId = document.getElementById("deviceId").value;
	topicDeviceRx = deviceId;
	localStorage.setItem('topic', topicDeviceRx);
	let fechaInicio = document.getElementById("fechaInicio").value;
	let fechaFin = document.getElementById("fechaFin").value;
	fechaInicio = fechaInicio + " 00:00:00";
	fechaFin = fechaFin + " 23:59:59";
	getDataHistorialDevice({ deviceId, fechaInicio, fechaFin })
}

function setColoresAleatorios() {
	let colores = ['#b82612', '#124bd9', '#3c21ea', '#6c19dc', '#b0135d', 'black', '#166818', '#157362', '#70750c', '#8e4a1b', '#2a229e'];
	let nroColor = Math.round(Math.random() * 10);
	//console.log(nroColor)
	return colores[nroColor];
}

// Dibuja la ruta donde ha circulado el vehiculo
function drawHistorial(firstLatLng, secondLatLng, data, indice, largoData, color2) {
	latLngSiguiente = { lat: secondLatLng.lat, lng: secondLatLng.lng };
	let popUp, objParqueado;
	console.log("Uno " + indice);
	//Limpia solo en el primer punto
	//if (indice == 1) { map.removeLayer(markerOriginal) }
	console.log("Dos");
	if (indice == (largoData - 1)) {
		let iconCarActual = ((data.velocidad > 0) ? iconCarVerde : iconCarGris)
		map.panTo(new L.LatLng(secondLatLng.lat, secondLatLng.lng));// Centrar mapa en marker recibido de evento
		markerOriginal = new L.Marker(data, { draggable: false, icon: iconCarActual });
		map.addLayer(markerOriginal);
	}
	if ((firstLatLng.lat != '') && (secondLatLng.lat != '') && (firstLatLng.lng != secondLatLng.lng)) {
		if (indice > 1) { //map.removeLayer(markerOriginal) }
			distancia = distancia + map.distance(firstLatLng, secondLatLng);
			L.polyline([firstLatLng, secondLatLng], {
				weight: 6, // grosor de línea
				color: color, // color de línea
				opacity: 2.0, // tansparencia de línea
				fillColor: 'black', // color de relleno
				fillOpacity: 5.0 // transparencia de relleno
			}).addTo(map);
		}
	}
	objParqueado = getTiempoTrascurrido(tiempoAnterior, tiempoActual);
	if (objParqueado.m > 3) {
		color = setColoresAleatorios();
		//let iconCarActual = ((data.velocidad > 0) ? iconCarVerde : iconCarGris)
		map.panTo(new L.LatLng(secondLatLng.lat, secondLatLng.lng));// Centrar mapa en marker recibido de evento
		markerOriginal = new L.Marker(data, { draggable: false, icon: iconParqueado });
		map.addLayer(markerOriginal);
		//let direccion =
		popUp = "<span><b>" + data.placa + "<br>Tiempo parqueado: </b>" + objParqueado.h + "h; " + objParqueado.m + "m; " + objParqueado.s + "s.<br><b>Desde: </b>" + tiempoAnterior + "<br><b>Hasta:</b>" + tiempoActual + "<br> Nro: " + indice + "</span>";
		markerOriginal.bindPopup(popUp).openPopup();
	}
	if (indice == (largoData - 1)) {
		popUp = "<span><b>" + data.placa + "<br>Fecha:</b>" + data.fechaEvento + "<br><b>Distancia total: </b>" + ((distancia) / 1000).toFixed(2) + " Km.<br>" + ((data.velocidad > 0) ? "<b>Velocidad</b>: " + (parseInt(((data.velocidad) * 1.85), 0)) + " Km/h</span><br> nro: " + indice : "<b>Estado</b>: Estático<br> Nro: " + indice + "</span>");
		markerOriginal.bindPopup(popUp).openPopup();
	}
	tiempoAnterior = tiempoActual;
}


// Funcion para activar/visualziar  linea de movimiento de dispositivo
function setSegirDevice() {
	segirDevice = true;
	document.getElementById("seguirUnidad").style.borderColor = "green";
}


function drawLine(firstLatLng, secondLatLng) {
	if (segirDevice) {
		if (firstLatLng.lat != '') {
			L.polyline([firstLatLng, secondLatLng], {
				weight: 6,
				color: '#0638df'
			}).addTo(map);
		}
	}
}
function refrescaPagina(evento) {
	location.reload();
}

function obtenerUltimaUbicacion() {
	if (!markerOriginal) {
		//map.removeLayer(markerOriginal)
		getUltimaUbicacion({ userId });
	}
}


function setSelectDevices(data) {
	let select = document.getElementById("deviceId");
	let template = '';
	data.forEach(data => {
		template += `<option value="${data.id_device}">${data.placa}</option>`;
	});
	select.innerHTML = template;
}

function iniciarEscucharEventos(topic) {
	// Escuchador de eventos desde el server
	socketClient.on(topic, data => {
		//latLngAnterior = {lat:"", lng:""};
		latLngSiguiente = { lat: data.lat, lng: data.lng };
		fechasHoras.sig = data.fecha;
		let popUp;
		console.log(data)
		if (markerOriginal) { map.removeLayer(markerOriginal) }

		if ((fechasHoras.sig > fechasHoras.ant) && (fechasHoras.sig != fechasHoras.ant)) {
			let iconCarActual = ((data.velocidad > 0) ? iconCarVerde : iconCarGris)
			map.panTo(new L.LatLng(data.lat, data.lng));// Centrar mapa en marker recibido de evento
			markerOriginal = new L.Marker(data, { draggable: false, icon: iconCarActual });
			map.addLayer(markerOriginal);
			drawLine(latLngAnterior, latLngSiguiente)
			latLngAnterior = latLngSiguiente;
			console.log(" Siguiente: " + fechasHoras.sig, "Ante: " + fechasHoras.ant)

			console.log("Imprime mark");
			if (data.tipoReporte == "acc on") {
				popUp = "<span><b>" + data.name + "</b><br>Fecha: " + data.fecha + "<br><b style='color:green'>VEHICULO ENCENDIDO</b></span>";
				markerOriginal.bindPopup(popUp).openPopup();
				//fechaAnterior = data.fecha
			} else
				if (data.tipoReporte == "acc off") {
					popUp = "<span><b>" + data.name + "</b><br>Fecha: " + data.fecha + "<br><b style='color:red'>VEHICULO APAGADO</b></span>";
					markerOriginal.bindPopup(popUp).openPopup();
					//fechaAnterior = data.fecha
				} else {
					popUp = "<span><b>" + data.name + "</b><br>Fecha</b>: " + data.fecha + "<br>" + ((data.velocidad > 0) ? "<b>Velocidad</b>: " + (parseInt(((data.velocidad)), 0)) + " Km/h</span>" : "<b>Estado</b>: Estático</span>");
					markerOriginal.bindPopup(popUp);//.openPopup();
					//fechaAnterior = data.fecha
					fechasHoras.ant = fechasHoras.sig;
				}
		} else {
			console.log("Else: ")
			fechasHoras.sig = fechasHoras.ant;
			console.log(" Siguiente: " + fechasHoras.sig, "Ante: " + fechasHoras.ant)
		}
	})// Fin escuchador eventos
}// FIn funcion iniciarEscucharEventos

function setMapa() {
	let map1 = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	let map2 = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png';
	let map3 = 'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png';
	let map4 = 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg';
	let map5 = 'https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png';
	let objetoPublicidad = { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Armando catota</a> contributors' };
	L.tileLayer(map1, objetoPublicidad).addTo(map);
	setEstiloBotones();
}

// Se agrega la ultima ubicacion en el mapa
function setUltimaUbicacion(data) {
	let topicDevice = localStorage.getItem('topic');
	data.forEach((dat) => {
		if (dat.imei == topicDevice) {
			//	console.log("Topic devie: ",topicDevice)
			document.getElementById("placa").innerHTML = dat.placa;
			localStorage.setItem('placa', dat.placa);
			let iconCarActual;
			if (markerOriginal) { map.removeLayer(markerOriginal) }
			iconCarActual = ((dat.velocidad > 0) ? iconCarVerde : iconCarGris)
			let popUp = "<span><b>" + dat.placa + "<br>Fecha</b>: " + dat.fechaEvento + "<br><b>Motor:</b> " + dat.motor + "<br>" + ((dat.velocidad > 0) ? "<b>Velocidad</b>: " + (parseInt(((dat.velocidad) * 1.85), 0)) + " Km/h</span>" : "<b>Estado</b>: Estático</span>");
			map.panTo(new L.LatLng(dat.lat, dat.lng));// Centrar mapa en marker recibido de evento
			markerOriginal = new L.Marker(dat, { draggable: false, icon: iconCarActual, title: "Ultima ubicación", opacity: 0.75, zoom: 20 });
			map.addLayer(markerOriginal);
			markerOriginal.bindPopup(popUp);//.openPopup();
			latLngAnterior = { lat: dat.lat, lng: dat.lng };
		}
	});
}


function setEstiloBotones() {
	document.getElementById("btnInit").style.borderColor = "red";
	document.getElementById("btnInit").style.position = "fixed";
	document.getElementById("btnInit").style.top = "10px";
	document.getElementById("btnInit").style.right = "10px";
	document.getElementById("btnInit").style.zIndex = "100007";
	document.getElementById("myModal").style.zIndex = "100008";
	document.getElementById("myConfig").style.zIndex = "100008";
}
