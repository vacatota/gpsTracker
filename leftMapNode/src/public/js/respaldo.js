//window.addEventListener('DOMContentLoaded', function(){
// Respaldado al 02092022_0751
// CAPTURA EVENTOS
// registrofrescar pagina
var topicDeviceRx;
var segirDevice = false;
var latLngAnterior = { lat: 0, lng: 0 };
var latLngSiguiente = { lat: 0, lng: 0 };
var fechasHoras = { ant: '2022-01-01 00:00:00', sig: '' };
var distancia = 0;
var tiempoAnterior;
var tiempoActual;
var color;
//Evento cuando la pagina ha termiando de cargar
window.addEventListener('load', function () {
let fechaActual = moment().format('YYYY-MM-DD')
document.getElementById('fechaInicio').value = fechaActual;
document.getElementById('fechaFin').value = fechaActual;







	topicDeviceRx = localStorage.getItem('topic');
	getUltimaUbicacion(topicDeviceRx);
	escucharEventos(topicDeviceRx)

	// Escuchador de eventos
	let btnUno = document.getElementById("refresh");
	btnUno.onclick = refrescaPagina;

	let btnDos = document.getElementById("getMarkerActual");
	btnDos.onclick = obtenerUltimaUbicacion;

	let btnTres = document.getElementById("tres");
	btnTres.onclick = setSegirDevice;

	let buscarDataRuta = document.getElementById("buscar-data-gps");
	buscarDataRuta.onclick = getDataGps;

	console.log("Topic escuchador cargado: ", topicDeviceRx)
	//console.log(getTiempoPasado());
});


// Calculamos tiempos
// Devuelve un objeto {h:horas,m:minutos,s.segundos, milis:milisegundos}
function getTiempoTrascurrido(fechaAnterior, fechaActual){
	let h,m,s,rh,rm,rs,sf;
	//let fechaAnt = moment("2022-09-01 09:09:19");
	let fechaAnt = moment(fechaAnterior);
	let fechaAct = moment(fechaActual);
	let milisegundos = fechaAct.diff(fechaAnt);

rs = milisegundos % 60000;
sf = rs/1000;
m = milisegundos / 60000;
if(m > 60){
	m = m  % 60;
}
rm = milisegundos / 60;
rm = s % 60;
h = milisegundos / 3600000;
let tiempo = {tiempo:(parseInt(h,0)+":"+ parseInt(m,0)+":" + parseInt(sf,0)), h:parseInt(h,0), m:parseInt(m,0), s:parseInt(sf,0), milis:milisegundos}
return tiempo;
}




// Extrae data de un dispositivo para dibujar el historial de recorrido
function getDataGps() {
	let deviceId = document.getElementById("deviceId").value;
	let fechaInicio = document.getElementById("fechaInicio").value;
	let fechaFin = document.getElementById("fechaFin").value;
	fechaInicio = fechaInicio + " 00:00:00";
	fechaFin = fechaFin + " 23:59:59";
	getDataHistorialDevice({ deviceId, fechaInicio, fechaFin })
}

function setColoresAleatorios(){
	let colores = ['#b82612','#124bd9','#3c21ea','#6c19dc','#b0135d','black','#166818','#157362','#70750c','#8e4a1b','#2a229e'];
	let nroColor = Math.round(Math.random() * 10);
	console.log(nroColor)
	return colores[nroColor];
}
function getDataHistorialDevice(dataSend) {
	segirDevice = true;
	let largoData = 0;
	fetch('http://201.183.243.135:5551/getdatadevicehistorial/',
		//fetch('http://192.168.88.250:5551/getdatadevicehistorial/',
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
				tiempoActual = json[i].fechaEvento;
				//map.panTo(new L.LatLng(json.lat, json.lng));// Centrar mapa en marker recibido de evento
				latLngSiguiente = { lat: json[i].lat, lng: json[i].lng };
				//setTimeout(function () {
				drawHistorial(latLngAnterior, latLngSiguiente, json[i], i, largoData, color)
				latLngAnterior = latLngSiguiente;
				//}, 1000);
			}
		})
		distancia =0;
}

// Dibuja la ruta donde ha circulado el vehiculo
function drawHistorial(firstLatLng, secondLatLng, data, indice, largoData, color) {
	latLngSiguiente = { lat: secondLatLng.lat, lng: secondLatLng.lng };
	let popUp;
	let objParqueado;

	//Limpia solo en el primer punto
	if (indice == 1) { map.removeLayer(markerOriginal) }

		if(indice == (largoData-1)){
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
	if(objParqueado.m > 3){
		color = setColoresAleatorios();
	//let iconCarActual = ((data.velocidad > 0) ? iconCarVerde : iconCarGris)
	map.panTo(new L.LatLng(secondLatLng.lat, secondLatLng.lng));// Centrar mapa en marker recibido de evento
	markerOriginal = new L.Marker(data, { draggable: false, icon: iconP });
	map.addLayer(markerOriginal);
	let direccion =
	popUp = "<span><b>" + data.name + "<br>Tiempo parqueado: </b>"+objParqueado.tiempo+"<br><b>Desde: </b>" + tiempoAnterior + "<br><b>Hasta:</b>" + tiempoActual + "<br> Nro: " + indice + "</span>";
	markerOriginal.bindPopup(popUp).openPopup();

}

	if(indice == (largoData-1)){
		popUp = "<span><b>" + data.name + "<br>Fecha:</b>" + data.fechaEvento + "<br><b>Distancia total: </b>" + ((distancia) / 1000).toFixed(2) + " Km.<br>" + ((data.velocidad > 0) ? "<b>Velocidad</b>: " + (parseInt(((data.velocidad) * 1.609), 0)) + " Km/h</span><br> nro: " + indice : "<b>Estado</b>: Estático<br> Nro: " + indice + "</span>");
		markerOriginal.bindPopup(popUp).openPopup();
	}
	tiempoAnterior = tiempoActual;
}


// Funcion para activar/visualziar  linea de movimiento de dispositivo
function setSegirDevice() {
	segirDevice = true;
	document.getElementById("tres").style.borderColor = "green";
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
			getUltimaUbicacion(topicDeviceRx);
		 }
}



function getUltimaUbicacion(imei) {
	const data = new FormData();
	fetch('http://201.183.243.135:5551/getdatadevice/' + imei,
		//fetch('http://192.168.88.250:5551/getdatadevice/' + imei,
		{
			//method: 'GET',
			//body: data,
			//body: JSON.stringify(data), // data can be `string` or {object}!
			//headers: { 'Content-Type': 'application/json' }
			//headers: {"X-Requested-With": "XMLHttpRequest"}
			//headers: myHeaders,
			//mode: 'cors'
		})
		.then(response => response.json())
		.then(json => {
			console.log(json)
			let data = {
				lat: json[0].lat,
				lng: json[0].lng,
				fecha: json[0].fechaEvento,
				velocidad: json[0].velocidad,
				name: json[0].name,
			}

			setUltimaUbicacion(data);
		})
}




var topicEscucahdor = '863844054222424';
var markerOriginal;
var markerCar;
const socketClient = io();
// variables para mapa
let coordenaInicio = [-0.196837, -78.510973];
var zoom = 15;
var map = L.map('map').setView(coordenaInicio, zoom);
// Creamos iconos
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
const iconP = L.icon({
	iconUrl: '/img/iconP.png',
	iconSize: [60, 60],
	iconAnchor: [30, 60]
});
var iconCarMarker = L.icon({
	iconUrl: '<?php echo base_url("public/assets/img/img-mapas/icono.png")?>',
	iconSize: [60, 60],
	iconAnchor: [30, 60]
});

setMapa();

// Obtener coordeenadas del navegador
/* map.locate({ enableHighAccuracy: true });// Solicita activar ubicacion
// Evento escuchador
map.on('locationfound', (e) => {
	console.log(e)
}); */

// ESCUCAHDOR DE EVENTO CLICK EN EL MAPA
// map.on('click', function (e) {
// 	console.log(e.latlng);
// 	let LatLng = { lat: e.latlng.lat, lng: e.latlng.lng }
// 	//L.marker(arregloLatLng).addTo(map).bindPopup("Marcado").openPopup();
// 	//socketClient.emit('marker', e.latLng);
// 	socketClient.emit(topicDeviceRx, LatLng);
// });




function escucharEventos(topic) {
	// Escuchador de eventos desde el server
	socketClient.on(topic, data => {
		//latLngAnterior = {lat:"", lng:""};
		latLngSiguiente = { lat: data.lat, lng: data.lng };
		fechasHoras.sig = data.fechaEvento;
		let popUp;
		console.log(data)
		if (markerOriginal) { map.removeLayer(markerOriginal) }
		let iconCarActual = ((data.velocidad > 0) ? iconCarVerde : iconCarGris)
		map.panTo(new L.LatLng(data.lat, data.lng));// Centrar mapa en marker recibido de evento

		markerOriginal = new L.Marker(data, { draggable: false, icon: iconCarActual });
		map.addLayer(markerOriginal);
		drawLine(latLngAnterior, latLngSiguiente)
		latLngAnterior = latLngSiguiente;
		if (fechasHoras.sig > fechasHoras.ant) {

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
					popUp = "<span><b>" + data.name + "</b><br>Fecha</b>: " + data.fecha + "<br>" + ((data.velocidad > 0) ? "<b>Velocidad</b>: " + (parseInt(((data.velocidad) * 1.609), 0)) + " Km/h</span>" : "<b>Estado</b>: Estático</span>");
					markerOriginal.bindPopup(popUp);//.openPopup();
					//fechaAnterior = data.fecha
					fechasHoras.ant = fechasHoras.sig;
				}
		} else {
			fechasHoras.sig = fechasHoras.ant;
		}
		// ############  FIN MAPAS #############################

		// ########### FIN MARKER OK ############################

		// ########### INICIO MARKERCAR PERSONALIZADO OK ############################
		// if (markerCar) {
		// 	map.removeLayer(markerCar)
		// 	}
		//console.log("Abc:",data.lat,data.lng);
		//map.panTo(new L.LatLng(data.lat,data.lng));// Centrar mapa en marker recibido de evento
		//markerCar = new L.marker(data,{draggable:false, icon:iconCar})
		//map.addLayer(markerCar).openPopup();

		// if(data.tipoReporte == "acc on"){
		// 	popUp = "<span><b>"+data.name+"</b><br>Fecha: "+data.fecha + "<br><b style='color:green'>VEHICULO ENCENDIDO</b></span>";
		// 	markerCar.bindPopup(popUp).openPopup();
		// }else
		// if(data.tipoReporte == "acc off"){
		// 	popUp = "<span><b>"+data.name+"</b><br>Fecha: "+data.fecha + "<br><b style='color:red'>VEHICULO APAGADO</b></span>";
		// 	markerCar.bindPopup(popUp).openPopup();
		// }else{
		// 	popUp = "<span><b>"+data.name+"</b><br>Fecha: "+data.fecha + "<br>"+((data.velocidad > 0 ) ? "Velocidad: "  +(parseInt(((data.velocidad)*1.609),0)) +" Km/h</span>" : "Estado: Estático</span>");
		// 	 markerCar.bindPopup(popUp).openPopup();
		// }
		// ########### INICIO MARKER OK ############################
	})// Fin escuchador eventos
}// FIn funcion escucharEventos
function setMapa() {
	let map1 = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	let map2 = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png';
	let map3 = 'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png';
	let map4 = 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg';
	let map5 = 'https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png';
	let objetoPublicidad = { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Armando catota</a> contributors' };
	let marker = [-0.196837, -78.510973];
	L.tileLayer(map1, objetoPublicidad).addTo(map);
	setEstiloBotones();
}

function setUltimaUbicacion(data) {
	let iconCarActual;
	if (markerOriginal) { map.removeLayer(markerOriginal) }
	iconCarActual = ((data.velocidad > 0) ? iconCarVerde : iconCarGris)
	let popUp = "<span><b>" + data.name + "<br>Fecha</b>: " + data.fecha + "<br>" + ((data.velocidad > 0) ? "<b>Velocidad</b>: " + (parseInt(((data.velocidad) * 1.609), 0)) + " Km/h</span>" : "<b>Estado</b>: Estático</span>");
	map.panTo(new L.LatLng(data.lat, data.lng));// Centrar mapa en marker recibido de evento

	markerOriginal = new L.Marker(data, { draggable: false, icon: iconCarActual, title: "Ultima ubicación", opacity: 0.75, zoom: 20 });
	map.addLayer(markerOriginal);
	markerOriginal.bindPopup(popUp);//.openPopup();
	// LatLng inicial para dibujar lineass
	latLngAnterior = { lat: data.lat, lng: data.lng };
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

// socketClient.on('sendData', data => {
//   console.log("Data recibidas: ", data);
// let popUp = "<span><b>"+data.name+"</b><br>Fecha: "+data.fecha + "<br>Batt: 100%<br>Velocidad: "+((data.velocidad > 0 ) ? data.velocidad +" Km/h</span>" : "Estático</span>");
//   L.marker([data.lat, data.lng]).addTo(map).bindPopup(popUp);//.openPopup(false);
// })



// AGREGADO EJEMPLOS
/*
//https://jeffreymorgan-io.translate.goog/articles/how-to-center-a-leaflet-map-on-a-marker/?_x_tr_sl=auto&_x_tr_tl=es&_x_tr_hl=es-419
function centerLeafletMapOnMarker(map, marker) {
  var latLngs = [ marker.getLatLng() ];
  var markerBounds = L.latLngBounds(latLngs);
  map.fitBounds(markerBounds);
}
*/
//##############################################################################


//	var map = L.map('map').setView([51.505, -0.09], 13);

	//var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	//	maxZoom: 19,
	//	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//	}).addTo(map);
	//var marker = L.marker([51.5, -0.09]).addTo(map)
	//	.bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();


// Agrega circulo al mapa
//-0.196643, -78.510634

// OK FUNCIONAL: 04-08-2022
/*
	var circle = L.circle([-0.193505, -78.502722], {
	//var circle = L.circle(-0.193505, -78.502722], {
		color: 'green',
		fillColor: '#f01',
		fillOpacity: 0.5,
		radius: 500
	}).addTo(map).bindPopup('I am a circle.');


// Agrega un triangulo al mapa
	var polygon = L.polygon([
		[-0.201616, -78.500447],
		[-0.204234, -78.503022],
		[-0.206465, -78.498259]
	]).addTo(map).bindPopup('I am a polygon.');


// Un pupUp solito
	var popup = L.popup()
		.setLatLng([-0.196643, -78.510634])
		.setContent('I am a standalone popup.')
		.openOn(map);

// Clickea en el mapa y me entrega las coordenadas
	function onMapClick(e) {
		popup
			.setLatLng(e.latlng)
			.setContent(e.latlng.toString())
			.openOn(map);
	}
	map.on('click', onMapClick);
*/
