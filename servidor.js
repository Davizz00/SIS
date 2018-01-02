// Servidor 

// Variables para crear el servidor 
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Variables para utilizar los sensores 
var Gpio = require('onoff').Gpio;
var rpiDhtSensor = require('rpi-dht-sensor');


var port = process.env.PORT || 8888; // Puerto asignado 8888

const SOCKET_SENSOR_APAGADO = 0; // el sensor o sensores no están activados
const SOCKET_SENSOR_FINAL_DE_CARRERA = 1; // Valor para activar el final de carrera 
const SOCKET_SENSOR_DHT = 2; // Valor para activar el sensor de temperatura y humedad
const SOCKET_SENSOR_PIR = 3; // Valor para  actvar el sensor de presencia(PIR)
var estado_servidor = SOCKET_SENSOR_APAGADO; // El estado del sensor en el servidor está apagado (0)

http.listen(port, function () { // Servidor escucha en el puerto (port 8888)
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

//sensores conenctados a los Gpios de la Raspberry Pi 
var led = new Gpio(14, 'out'); // El led se conecta al pin GPIO 14. Información de salida
var final_de_carrera = new Gpio(18, 'in', 'both'); // El FC se conecta al pin GPIO 18. Información de entrada y salida
var dht = new rpiDhtSensor.DHT11(2); // El DHT se conecta al pin GPIO 2
var pir = new Gpio(21, "in", "both");// El PIR se conecta al pin GPIO 21. Información de entrada y salida

var timer_led_activado = 0;
var timer_dht = 0;


 
// tuneles por donde pasa la información del servidor al cliente y viceversa
io.on('connection', function(socket){

	socket.on("init_sensor", function(estado){	//recibe el estado(Código) que le manda el cliente
		estado_servidor = estado; 
		console.log("estado servidor: ", estado_servidor);

		if (estado==SOCKET_SENSOR_FINAL_DE_CARRERA){ // Compara el código del cliente con el FC
			console.log("final de carrrera");
			clear();
		}
		else if (estado == SOCKET_SENSOR_DHT){ // Compara el código del cliente con el DHT
			clear();	
			console.log("dht");
			timer_dht = setInterval(read_dht, 1000);  // inicia el timer del sensor dht y llama a la función read_dht	
		}
		else if (estado == SOCKET_SENSOR_PIR){ // Compara el código del cliente con el PIR
			console.log("pir");
			clear();
			
		}

		final_de_carrera.watch(function(err, value){ // Lee la información del sensor. Se ejecuta de forma asíncrona 
			if (estado_servidor == SOCKET_SENSOR_FINAL_DE_CARRERA){ // Compara el código del cliente con el del final de carrera
				if (value==1){ 
       				value = 0;
       				io.emit('final_de_carrera', value); // Manda al cliente el valor 0 (No pulsado)				
  				} 
    			else{
    			value = 1; 
    			io.emit('final_de_carrera', value);// Manda al cliente el valor 1 (Pulsado)	
    				if (timer_led_activado == 0){ 
    					timer_led_activado = 1;
   						var time = setTimeout(timer_led, 2000); // Inicializa un timer que se ejecuta a los 2 segundos y llama a la función timer_led
   						led.writeSync(1); // Enciende el led
   						console.log("Led Encendido");						
      				}
   				} 	   		
			}
		});	

		function clear(){
			clearInterval(timer_dht);  // Finaliza (borra) el timer del sensor dht
		}

		function timer_led(){
    		timer_led_activado = 0;
    		led.write(0); // Se apaga el led
    		console.log("Led Apagado");  			
 		}

		function read_dht() { // se ejecuta de forma síncrona con el timer
			if ((estado==SOCKET_SENSOR_FINAL_DE_CARRERA)||(estado == SOCKET_SENSOR_PIR)){
				clear(); //Llama a la función clear para parar parar el sensor DHT cuando se active el PIR o el FC
			}
			var readout = dht.read(); // Lee  la información del sensnor DHT
			console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(2) + '%'); 
			io.emit("sensor_dht", readout); // Manda al cliente los calores de temperatura y humedad
				 	 			
		}

		pir.watch(function(err, value){ 
			if(estado_servidor == SOCKET_SENSOR_PIR){  // Compara el código del cliente con el PIR
				io.emit("sensor_pir", value); // Envía al cliente el valor del sensor
			}
		}); 	
	});
});


