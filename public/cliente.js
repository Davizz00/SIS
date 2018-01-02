// Cliente

const CANVAS_WIDTH= 750; // ancho del canvas
const CANVAS_HEIGHT= 500;  // alto del canvas 
const SOCKET_SENSOR_APAGADO = 0; // el sensor o sensores no están activados
const SOCKET_SENSOR_FINAL_DE_CARRERA = 1;  // Valor para activar el final de carrera 
const SOCKET_SENSOR_DHT = 2; // Valor para activar el sensor de temperatura y humedad
const SOCKET_SENSOR_PIR = 3; // Valor para  actvar el sensor de presencia(PIR)
var estado = SOCKET_SENSOR_APAGADO; // El estado del sensor está apagado (0) 

var socket = io();


const ARRAY_LENGHT = 60; 
var chart = null; // Gráfico 
// Configuración del gráfico de temperatura y humedad 
var chart_config = {
    type: 'line',
    data:{
    	labels: [...Array(ARRAY_LENGHT).keys()],
   
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
    	tooltips: {
    		mode: 'index',
    		intersect: false
    	},
    	hover: {
    		mode: 'index',
    	 	intersect: true
    	},
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

// añadir valor de temperatura al gŕafico
function add_value_array_temperature(value){
	chart_config.data.datasets[0].data.shift();
	chart_config.data.datasets[0].data.push(value); 
}

//Añadir valor de humedad al gŕafico
function add_value_array_humidity(value){
	chart_config.data.datasets[1].data.shift(); 
	chart_config.data.datasets[1].data.push(value);
}

// Escribir texto en el canvas y su configuración
function dibujarcanvas_texto(texto,color){
	var canvas = document.getElementById("myCanvas"); // Usar canvas de la página web
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "black";
    ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.fillStyle = color;
    ctx.fillText(texto, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);     
}


// Recibe la informacion del final de carrera
socket.on('final_de_carrera', function(value){
	estado = SOCKET_SENSOR_FINAL_DE_CARRERA; 
	console.log(estado);
	if (SOCKET_SENSOR_FINAL_DE_CARRERA == estado){ // Compara el código del cliente con el FC
		if (value==0){ // Si el valor es 0, escrible en el canvas OFF
	  	dibujarcanvas_texto("OFF", "red"); // LLama a la función para escribir en el canvas
		}
		else{  // Si el valor es distinto a 0, obligatoriamente 1, escrible en el canvas ON
	 	dibujarcanvas_texto("ON", "green");// LLama a la función para escribir en el canvas
		}
	}
 });

 //Recibe la informacion del sensor dht 
socket.on("sensor_dht", function(readout){
	estado = SOCKET_SENSOR_DHT;
	console.log(estado);
	if(SOCKET_SENSOR_DHT == estado){ // Compara el código del cliente con el FC
		add_value_array_temperature(readout.temperature); // Función para añdir valor de temperatura
		add_value_array_humidity(readout.humidity); // Función para añadir valor de humedad
		if (chart == null)
			return;
		chart.update(); // Actualizar el gráfico
	}
});
// Recibe informacion del sensor pir
socket.on("sensor_pir", function(value){ 
	estado = SOCKET_SENSOR_PIR;
	console.log(estado);
	if(value == 1){ // Si el valor es 1, escrible en el canvas Intruso
		dibujarcanvas_texto("Intruso", "red"); //LLama a la función para escribir en el canvas
	} 
	else{ // Si el valor es distinto de 1, escrible en el canvas Sin rastro alguno
		dibujarcanvas_texto("Sin rastro alguno", "green"); //LLama a la función para escribir en el canvas
	}	
 });

// funcion al hacer click en el boton sensor final de carrera
function boton_final_de_carrera(){
	dibujarcanvas_texto(""); //LLama a la función para escribir en el canvas			 	
	socket.emit("init_sensor", SOCKET_SENSOR_FINAL_DE_CARRERA); //Manda peticion al servidor
 }
//funcion al hacer click en el boton temperatura
function sensor_dht(){ 
	socket.emit("init_sensor", SOCKET_SENSOR_DHT); // manda peticion al servidor
	var ctx = document.getElementById('myCanvas').getContext('2d'); // Usar canvas de la página web
	chart = new Chart(ctx, chart_config); // Crear gŕafico 
}
//Funcion al hacer click boton camara
function sensor_pir(){
	dibujarcanvas_texto(""); //LLama a la función para escribir en el canvas
	socket.emit("init_sensor", SOCKET_SENSOR_PIR); //Manda peticion al servidor
}
