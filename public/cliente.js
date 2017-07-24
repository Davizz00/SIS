const CANVAS_WIDTH= 750;
const CANVAS_HEIGHT= 500; 
var SOCKET_SENSOR_APAGADO = 0;
var SOCKET_SENSOR_FINAL_DE_CARRERA = 1;
var  SOCKET_SENSOR_DHT = 2;
var SOCKET_SENSOR_PIR = 3;

function dibujarcanvas_texto(texto,color){
	var canvas = document.getElementById("myCanvas")
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "black";
    ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.fillStyle = color;
    ctx.fillText(texto, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);    
}
// funcion al hacer click en el boton sensor final de carrera
function boton_final_de_carrera(){
	//emite al servidor 
	dibujarcanvas_texto("");
	$(function() {
		var socket = io();				 	
		socket.emit("init_sensor", SOCKET_SENSOR_FINAL_DE_CARRERA)
  		// (sensor) variable
 		socket.on('final_de_carrera', function(value){
			if (value== 0){
	  			dibujarcanvas_texto("OFF", "red")
			}
			else{
	 			dibujarcanvas_texto("ON", "green");
 			}
  		});	
	});	
}
//funcion al hacer click en el boton temperatura
function sensor_temperatura(){
	$(function(){
		dibujarcanvas_texto("");
		var socket = io(); 
		// manda peticion al servidor
		socket.emit("init_sensor", SOCKET_SENSOR_DHT)
		// recibe informacion sensor temperatura 
		socket.on("temperatureSensor", function(readout){
		dibujarcanvas_texto(readout.temperature.toFixed(), "red")
		});
	});
}