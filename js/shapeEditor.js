var shapes = [];
var canvas = document.getElementById("canvas");
var polyType = "";
var startPolyDraw = false;
var isMouseDown = false;

function getMouseCoordinates(event) {
  //get mouse position
  var rect = event.target.getBoundingClientRect();
  var x = event.clientX - rect.left; //x position within canvas
  var y = event.clientY - rect.top; //y position within canvas
  return [x, y];
}

function Shape(type, coordinates) {
  this.type = type;
  this.coordinates = coordinates
}

Shape.prototype.draw = function(context) {
  context.beginPath();
  switch (String(this.type)) {
    case "line":
      context.moveTo(this.coordinates[0], this.coordinates[1]);
      context.lineTo(this.coordinates[2], this.coordinates[3]);
      break;
    case "triangle":
      context.moveTo(this.coordinates[0], this.coordinates[1]);
      context.lineTo(this.coordinates[2], this.coordinates[3]);
      context.lineTo(this.coordinates[4], this.coordinates[5]);
      context.lineTo(this.coordinates[0], this.coordinates[1]);
      break;
    case "square":
      context.rect(this.coordinates[0], this.coordinates[1], this.coordinates[2], this.coordinates[2]);
      break;
    case "rectangle":
      context.rect(this.coordinates[0], this.coordinates[1], this.coordinates[2], this.coordinates[3]);
      break;
    case "circle":
      context.arc(this.coordinates[0], this.coordinates[1], this.coordinates[2], 0, 2 * Math.PI);
      break;
    case "ellipse":
      context.ellipse(this.coordinates[0], this.coordinates[1], this.coordinates[2], this.coordinates[3], 0, 0, 2 * Math.PI);
      break;
    case "curve":
      context.moveTo(this.coordinates[0], this.coordinates[1]);
      context.quadraticCurveTo(this.coordinates[2], this.coordinates[3],
        this.coordinates[4], this.coordinates[5]);
      context.quadraticCurveTo(this.coordinates[6], this.coordinates[7],
        this.coordinates[8], this.coordinates[9]);
      break;
    case "polyline":
      context.moveTo(this.coordinates[0], this.coordinates[1]);
      for (var i = 2; i < this.coordinates.length; i += 2) {
        context.lineTo(this.coordinates[i], this.coordinates[i + 1]);
      }
      break;
    default:
  }
  context.stroke();
}

function CanvasObject(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
}

CanvasObject.prototype.draw = function() {
  this.context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < shapes.length; i++) {
    shapes[i].draw(this.context);
  }
}

$(function() {
  var canvas1 = new CanvasObject(canvas); //This is the global canvas, we'll be working with.


  attachDraggableAbility();


  //if polygon or polyline button
  $(".polybutton").click(function() {
    polyType = $(this).attr('id');
    startPolyDraw = true;
    //console.log(polyType);
    //console.log(startPolyDraw);
  });

  $("#canvas").click(function() {
    if (polyType != "") {}
  });



  //--------------------BEGIN MOUSE EVENTS---------------------------------
  $("#canvas").mousedown(function(event) {
    isMouseDown = true;
    var coordinates = getMouseCoordinates(event);
    initPoly(coordinates); //initilize a polygon if poly button pressed
  });

  $("#canvas").mousemove(function(event) {
    var coordinates = getMouseCoordinates(event); //get current coordinates.
    var x = coordinates[0];
    var y = coordinates[1];



    //if user is dragging to define poly change last two coordintes and draw
    if (polyType != "" && isMouseDown) {
      var shapeIndex = shapes.length - 1; //last shape added
      var xToChange = shapes[shapeIndex].coordinates.length - 2; //last coordintes added by mouse down i.e 0,0, these are to be cahged to new x and y
      var yToChange = shapes[shapeIndex].coordinates.length - 1;

      shapes[shapeIndex].coordinates[xToChange] = x; //coordinates changed
      shapes[shapeIndex].coordinates[yToChange] = y;
      canvas1.draw();
    }

  });


  $("#canvas").mouseup(function() {
    isMouseDown = false;
  });

  //--------------------- END MOUSE EVENTS ----------------------------


  $("#canvas").droppable({


    //when button hovers over canvas turn into shape.
    over: function(event, ui) {
      //get the clone of button being dragged
      clone = $(".ui-draggable-dragging");
      //get actual drawing i.e svg
      drawing = clone.children().children();
      clone.removeClass("btn-dark"); //remove button styles.
      clone.addClass("shapeHover");
      drawing.attr('fill', 'rgba(255, 255, 255, 0)'); //apply canavs styles
      drawing.attr('stroke', '#37474F');
    },
    out: function(event, ui) {
      //get the clone of button being dragged
      clone = $(".ui-draggable-dragging");
      //get actual drawing i.e svg
      drawing = clone.children().children();
      clone.removeClass("shapeHover"); //remove button styles.
      clone.addClass("btn-dark");
      drawing.attr('fill', '#37474F'); //apply canavs styles
      drawing.attr('stroke', 'white');
    },
    drop: function(event, ui) {
      var rect = event.target.getBoundingClientRect();
      var x = event.clientX - rect.left; //x position within the canvas
      var y = event.clientY - rect.top; //y position within the canvas

      switch (String(ui.draggable.attr("id"))) {
        case "line":
          shapes.push(new Shape("line", [x - 50, y, x + 50, y]));
          break;
        case "triangle":
          shapes.push(new Shape("triangle", [x + 50, y + 50, x, y - 50, x - 50, y + 50]));
          break;
        case "square":
          shapes.push(new Shape("square", [x - 50, y - 50, 100]));
          break;
        case "rectangle":
          shapes.push(new Shape("rectangle", [x - 50, y - 25, 100, 50]));
          break;
        case "circle":
          shapes.push(new Shape("circle", [x, y, 50]));
          break;
        case "ellipse":
          shapes.push(new Shape("ellipse", [x, y, 100, 50]));
          break;
        case "curve":
          shapes.push(new Shape("curve", [
            x - 50, y + 25, // start point on first quardratic curve.
            x - 25, y - 25, // control point on first quardratic curve
            x, y, //end point and start point: first/second curve.
            x + 25, y + 25, // control point on second quardratic curve
            x + 50, y - 25 // end point on second quardratic curve
          ]));
          break;
        default:
      }
      canvas1.draw();
    }
  });


});

//passed mouse coordinates, checks if a poly button is selected and initializes a new poly shape to be drawn by moving mouse.
function initPoly(coordinates) {
  //if we handn't innitialized poly yet. initialize it.
  if (startPolyDraw) {
    switch (polyType) {
      case "polyline":
        //add 0,0 at end because mousemove changes those values for rubberbanding.
        shapes.push(new Shape("polyline", [coordinates[0], coordinates[1], 0, 0]));
        break;
      case "polygon":
        shapes.push(new Shape("polygon", [coordinates[0], coordinates[1], 0, 0]));
        break;
    }
    startPolyDraw = false; //turn poly initialization off until next time button is poly clicked
  }

}




/* This function iterates through all html elements with the class shapeButton and innitializes them as draggable */
function attachDraggableAbility() {
  //make all elements with class shapeButton, draggable.(i.e. all shape buttons.)
  $(".shapeButton").draggable({

    //VERY IMPORTANT REVERT FUNCTION: enables button to stick only to canvas
    revert: function(droppableReceiver) {
      //if passed object is false then no droppable object was available to receive draggable
      if (droppableReceiver === false) {
        //revert the postion of the draggable back
        return true;
      } else {
        //else some droppable object received the draggable
        //Check if the droppable object that received draggable is a canvas
        if (droppableReceiver.attr('id') == "canvas") return false; //return false so that draggable button doesn't revert back to original position
        else return true; //else draggable was dropped at an inavlid location, revert back to original position.
      }
    },
    helper: "clone",
    cancel: false, //enable buttons draggability.
    stack: ".shapeButton", //ensures that button being dragged is always on top
    containment: "#wrapper" //keep draggable from scrolling off screen. keep it within the body div.
  }); //make all buttons with class "draggable", draggable.

}
