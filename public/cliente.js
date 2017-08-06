const CANVAS_WIDTH= 750;
const CANVAS_HEIGHT= 500; 
var SOCKET_SENSOR_APAGADO = 0;
var SOCKET_SENSOR_FINAL_DE_CARRERA = 1;
var SOCKET_SENSOR_DHT = 2;
var SOCKET_SENSOR_PIR = 3;
var socket = io();
const ARRAY_LENGHT = 60;
var chart = null;
var estado = SOCKET_SENSOR_APAGADO;
console.log(window.innerWidth);
var chart_config = {
    type: 'line',
    data:{
    	labels: [...Array(ARRAY_LENGHT).keys()],
    	//labels: Array(ARRAY_LENGHT).fill(null),
    	datasets:[{
    		label: "Temperatura",
			data: Array(ARRAY_LENGHT).fill(null),
			backgroundColor: 'rgb(255,0,0)',
			borderColor: 'rgb(255,0,0)',
			borderWidht: 2,
			fill : false
    	},
    	{
    		label: "Humedad",
    		data: Array(ARRAY_LENGHT).fill(null),
    		backgroundColor: 'rgb(0,0,255)',
    		borderColor: 'rgb(0,0,255)',
    		borderWidht: 2,
    		fill: false

    	}]
    },
    options: {
    	// responsive: false,
    	// maintainAspectRatio: true,
    	title: {
    		display: true,
    		text: 'Informacion temperatura y humedad por segundo '
    	},
    	//tooltips: {
    	//	mode: 'index',
    	 //	intersect: false
    	//},
    	//hover: {
    	 //	mode: 'index',
    	 	//intersect: true
    	//},
    	scales:{
    		YAxes:[{
    			display: true,
    			ticks: {
    				beginAtZero:true,
    				max: 100
    			}
    		}]		
    	}
    }
};

function add_value_array_temperature(value){
	chart_config.data.datasets[0].data.shift();
	chart_config.data.datasets[0].data.push(value);
}

function add_value_array_humidity(value){
	chart_config.data.datasets[1].data.shift();
	chart_config.data.datasets[1].data.push(value);
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
	ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
// Recibe la informacion del final de carrera
socket.on('final_de_carrera', function(value){
	estado = SOCKET_SENSOR_FINAL_DE_CARRERA; 
	console.log(estado);
	if (value== 0){
	  	dibujarcanvas_texto("OFF", "red");
	}
	else{
	 	dibujarcanvas_texto("ON", "green");
 	}
 });

 //Recibe la informacion del sensor dht 
socket.on("sensor_dht", function(readout){
	estado = SOCKET_SENSOR_DHT;
	if(SOCKET_SENSOR_DHT == estado){
		add_value_array_temperature(readout.temperature);
		add_value_array_humidity(readout.humidity);
		if (chart == null)
			return;
		chart.update();
	}
});
//Recibe informacion del sensor pir
//socket.on("sensor_pir", function(value){ 
	//estado = SOCKET_SENSOR_PIR;
	//if(value == 1){
	//	dibujarcanvas_texto("Intruso", "red")
	//} 
	//else{
	//	dibujarcanvas_texto("Sin rastro alguno", "green")	
	//}	
 //});
socket.on("image", function(data){
	if(data.image){
		console.log(data);
		var img = new Image();
		img.src = 'data:image/jpeg;base64,' + data.buffer;
		dibujarcanvas_imagen(img);
	}	
});

// funcion al hacer click en el boton sensor final de carrera
function boton_final_de_carrera(){
	dibujarcanvas_texto("a", "black");			 	
	socket.emit("init_sensor", SOCKET_SENSOR_FINAL_DE_CARRERA)	//Manda peticion al servidor
 }
//funcion al hacer click en el boton temperatura
function sensor_dht(){ 
	socket.emit("init_sensor", SOCKET_SENSOR_DHT) // manda peticion al servidor
	var ctx = document.getElementById('myCanvas').getContext('2d');
	chart = new Chart(ctx, chart_config);
}
//Funcion al hacer click boton camara
function sensor_pir(){
	dibujarcanvas_texto("");
	socket.emit("init_sensor", SOCKET_SENSOR_PIR) //Manda peticion al servidor
}
