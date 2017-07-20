// Dibujar el canvas
const CANVAS_WIDTH= 750;
const CANVAS_HEIGHT= 500; 
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

// funcion al hacer click en el boton final de carrera
function boton_final_de_carrera(){
	$(function() {
		var socket = io();
  		// (sensor) variable
 		socket.on('sensor', function(value){
			if (value== 0){
	  			dibujarcanvas_texto("OFF", "red")
			}
			else{
	 			dibujarcanvas_texto("ON", "green");
 			}
  		});
	});
	dibujarcanvas_texto("");
}