var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Gpio = require('onoff').Gpio;
var rpiDhtSensor = require('rpi-dht-sensor');
var node_webcam = require("node-webcam");
var picture_config = {
	widht: 750, 
	height: 500, 
	delay: 0,
	saveShots: true,
	quality: 100,
	output: "jpeg",
	device: false,
	callbackReturn: "/var/tmp",
	verbose: true
  };
var webcam = node_webcam.create(picture_config);
var port = process.env.PORT || 8888;

const SOCKET_SENSOR_APAGADO = 0;
const SOCKET_SENSOR_FINAL_DE_CARRERA = 1;
const SOCKET_SENSOR_DHT = 2;
const SOCKET_SENSOR_PIR = 3;
var estado_servidor = SOCKET_SENSOR_APAGADO; 

http.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));
//sensorres conenctados a los Gpios
var led = new Gpio(14, 'out'); 
var final_de_carrera = new Gpio(18, 'in', 'both');
var dht = new rpiDhtSensor.DHT11(2);
var pir = new Gpio(21, "in", "both");
var timer_led_activado = 0;
var timer_dht = 0;
var timer_camera_activado = 0;

// Timer para que el led se apague en un tiempo determinado
function timer_led(){
    timer_led_activado = 0;
    led.write(0);
    console.log("Led Apagado")	   			
 }
 function timer_camera(){
 	timer_camera_activado = 0;
 	//webcam.clear();
 	console.log("timer desactivado")
 }
// tuneles por donde pasa la información del servidor al cliente y viceversa
io.on('connection', function(socket){

	socket.on("init_sensor", function(estado){	//recibe el estado que le manda el cliente
		estado_servidor = estado; 
		console.log("estado servidor: ", estado_servidor);

		if (estado==SOCKET_SENSOR_FINAL_DE_CARRERA){	
			clearInterval(timer_dht);	// finaliza el timer del sensor dht
		}
		else if (estado == SOCKET_SENSOR_DHT){	
			timer_dht = setInterval(read_dht, 1000);  // inicia el timer del sensor dht
		}
		else if (estado == SOCKET_SENSOR_PIR){
			clearInterval(timer_dht);
		}

		final_de_carrera.watch(function(err, value){ // se ejecuta de forma asíncrona 
			if (estado_servidor == SOCKET_SENSOR_FINAL_DE_CARRERA){
				if (value==1){
       				value = 0;
       				io.emit('final_de_carrera', value);  				
  				} 
    			else{
    			value = 1;
    			io.emit('final_de_carrera', value);
    				if (timer_led_activado == 0){
    					timer_led_activado = 1;
   						var time = setTimeout(timer_led, 1000);
   						led.writeSync(1); 
   						console.log("Led Encendido");						
      				}
   				} 	   		
			}
		});	

		function read_dht() { // se ejecuta de forma síncrona con el timer
			if (estado_servidor == SOCKET_SENSOR_DHT){
				var readout = dht.read();
				console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(2) + '%'); 
				io.emit("sensor_dht", readout);	
			}	 	 			
		}

		pir.watch(function(err, value){
			if(estado_servidor == SOCKET_SENSOR_PIR){
				io.emit("sensor_pir", value)
				if(value==1){
					if(timer_camera_activado == 0){
						timer_camera_activado = 1;
						console.log("timer camera activado")
						setTimeout(timer_camera, 5000);
						webcam.capture("photo", function(error, data){
						//io.emit("camera", data);
						console.log("imagen creada:", error);
					});	

					}		
				}
			}
		}); 	
	});
});


