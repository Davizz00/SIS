// Dibujar el canvas
c.width = 750;
c.height = 500; 
function dibujarcanvas_texto(texto,w,h,){
	var canvas = document.getElementById("myCanvas")
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "black";
    ctx.fillRect(0,0, c.width, c.height);
    ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.fillStyle = color;
    ctx.fillText(texto,w,h);
    
}

// este signo $ equivale a document.getElementById("ID")



function button1(){
	$(function() {

  		var socket = io();

  		// (sensor) variable
 		 socket.on('sensor', function(value){
			if (value== 0){
	 		   $('#c').text('sensor": ' + value + " led apagado");
	  		   dibujarcanvas_texto("LED APAGADO", "red")
			}
			else{
	 		   $('#c').text('sensor": ' + value + " led encendido");
	 		   dibujarcanvas_texto("LED ENCENDIDO", "red");
 			}
    
   		 console.log('sensor received');
  		});

	});
	dibujarcanvas_texto("");
	
}