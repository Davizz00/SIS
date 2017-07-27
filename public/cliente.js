const CANVAS_WIDTH= 750;
const CANVAS_HEIGHT= 500; 
var SOCKET_SENSOR_APAGADO = 0;
var SOCKET_SENSOR_FINAL_DE_CARRERA = 1;
var SOCKET_SENSOR_DHT = 2;
var SOCKET_SENSOR_PIR = 3;
var socket = io();
var estado_dht = 0; // 0: Estado para temperatura; 1: estado para humedad
const ARRAY_LENGHT = 60;
var chart = null;
var chart_config = {
    type: 'line',
    data:{
    	labels: [...Array(ARRAY_LENGHT).keys()],
    	datasets:[{
    		data: Array(ARRAY_LENGHT).fill(0)//my_array
    	}]
    }
    // ,
    // options: {
    // 	scales:{
    // 		Yaxes:[{
    // 			display: true,
    // 			ticks: {
    // 				beginAtZero:true,
    // 				max: 50
    // 			}
    // 		}]		
    // 	}
    // }
};

function add_value_array(value){
	chart_config.data.datasets[0].data.shift();
	//my_array.shift();
	chart_config.data.datasets[0].data.push(value); 

	if (chart == null)
		return;

	chart.update();
	//my_array.push(value);
	for(var i = 0; i < ARRAY_LENGHT; i++){
		console.log(i, ", ", chart_config.data.datasets[0].data[i]);

	}
}

function dibujarcanvas_texto(texto,color){
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "black";
    ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.fillStyle = color;
    ctx.fillText(texto, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);     
}
function dibujarcanvas_imagen(img){
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
// Recibe la informacion del final de carrera
socket.on('final_de_carrera', function(value){
	if (value== 0){
	  	dibujarcanvas_texto("OFF", "red");
	}
	else{
	 	dibujarcanvas_texto("ON", "green");
 	}
 });

 //Recibe la informacion del sensor dht 
socket.on("sensor_dht", function(readout){
	if (estado_dht==0){
		add_value_array(readout.temperature);
	}
		
	else{
		dibujarcanvas_texto(readout.humidity, "blue");// dibuja en el canvas la humedad	
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
socket.on("camera", function(data){
	dibujarcanvas_imagen(data);
});
// funcion al hacer click en el boton sensor final de carrera
function boton_final_de_carrera(){
	dibujarcanvas_texto("");			 	
	socket.emit("init_sensor", SOCKET_SENSOR_FINAL_DE_CARRERA)	//Manda peticion al servidor
 }
//funcion al hacer click en el boton temperatura
function sensor_temperatura(){
	estado_dht = 0;
	//dibujarcanvas_texto(""); 
	var ctx = document.getElementById('myCanvas').getContext('2d');
	chart = new Chart(ctx, chart_config);
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
