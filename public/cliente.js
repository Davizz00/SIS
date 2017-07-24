const CANVAS_WIDTH= 750;
const CANVAS_HEIGHT= 500; 
var SOCKET_SENSOR_APAGADO = 0;
var SOCKET_SENSOR_FINAL_DE_CARRERA = 1;
var SOCKET_SENSOR_DHT = 2;
var SOCKET_SENSOR_PIR = 3;
var socket = io();
var estado_dht = 0;

function dibujarcanvas_texto(texto,color){
	var canvas = document.getElementById("myCanvas")
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "black";
    ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.fillStyle = color;
    ctx.fillText(texto, CANVAS_WIDTH/2, CANVAS_HEIGHT/2); 
    console.log("canvas dibijado");
}
// Recibe la informacion del final de carrera
socket.on('final_de_carrera', function(value){
	if (value== 0){
	  	dibujarcanvas_texto("OFF", "red")
	}
	else{
	 	dibujarcanvas_texto("ON", "green");
 	}
 });	
 //Recibe la informacion del sensor dht 
socket.on("sensor_dht", function(readout){
	if (estado_dht==0){
		dibujarcanvas_texto(readout.temperature, "red")
		console.log("Temperatura: ", readout.temperature, " ºC")//dibuja en el canvas la temperatura
	}
	else{
		dibujarcanvas_texto(readout.humidity, "blue");
		console.log("humedity: ", readout.humidity, " %");	// dibuja en el canvas la humedad
	}
});
//Recibe informacion del sensor pir
socket.on("sensor_pir", function(value){ 
	if(value == 1){
		dibujarcanvas_texto("Intruso", "red")
	} 
	else{
		dibujarcanvas_texto("Sin rastro alguno", "green")
	}
});

// funcion al hacer click en el boton sensor final de carrera
function boton_final_de_carrera(){
	dibujarcanvas_texto("");			 	
	socket.emit("init_sensor", SOCKET_SENSOR_FINAL_DE_CARRERA)	//Manda peticion al servidor
 }
//funcion al hacer click en el boton temperatura
function sensor_temperatura(){
	estado_dht = 0;
	dibujarcanvas_texto(""); 
	// manda peticion al servidor
	socket.emit("init_sensor", SOCKET_SENSOR_DHT)
}
//Funcion al hacer click boton humedad
function sensor_humedad(){
	estado_dht = 1;
	dibujarcanvas_texto("")
	socket.emit("init_sensor", SOCKET_SENSOR_DHT)	// Manda peticion al servidor
}
//Funcion al hacer click boton camara
function sensor_pir(){
	dibujarcanvas_texto("");c
	socket.emit("init_sensor", SOCKET_SENSOR_PIR) //Manda peticion al servidor
}