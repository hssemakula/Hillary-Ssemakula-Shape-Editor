/*
Hillary Ssemakula
hillary_ssemakula@student.uml.edu
 COMP 4270 GUI Computer Graphics I UMass Lowell
Final Project
script page for the Shape editor program.

WARNING: Alot of trigonemetry ahead
 */

var shapes = []; //arry keeps track of shape objects.
var canvas = document.getElementById("canvas");
var polyType = "";
var startPolyDraw = false;
var isMouseDown = false;
var canvas1 = new CanvasObject(canvas); //This is the global canvas, we'll be working with.
var selectedShape = -100; //index to note selected shape.
var xChangeCanvas = 0; //tracks changes in mouse x and y canvas wide.
var yChangeCanvas = 0;
var mode = ""; //tracks whether we are rotating or scaling.
var fileOpenEvent; //used to store the file opening event.


function getMouseCoordinates(event) {
  //get mouse position
  var rect = event.target.getBoundingClientRect();
  var x = event.clientX - rect.left; //x position within canvas
  var y = event.clientY - rect.top; //y position within canvas
  return [x, y];
}

function Shape(type, x, y) {
  this.type = type; //string type of shape
  this.coordinates = []; //array of coordinates.
  this.selected = false;
  this.rotationIconPath; //rotation icon
  this.scaleXIconPath; //scaleX icon paths
  this.scaleYIconPath; //scaleY icon
  this.centerX = x; //coorinates for center of shape, poly's don't use this
  this.centerY = y;
  this.angle = 0; //angle of rotation at which shape is currently rotated.
  this.lineWidth;
  this.fillColor;
  this.lineColor;
}

//build shape using given center point
Shape.prototype.build = function() {

  initializeColors(this);

  //using shape type define coordinates.
  switch (this.type) {
    case "line":
      this.coordinates = [this.centerX - 50, this.centerY, this.centerX + 50, this.centerY];
      break;
    case "triangle":
      this.coordinates = [this.centerX, this.centerY - 50, this.centerX + 50, this.centerY + 50,
        this.centerX - 50, this.centerY + 50
      ];
      break;
    case "square":
    case "rectangle":
      var topLeftX = this.centerX - 50;
      var topLeftY = (this.type == "square") ? this.centerY - 50 : this.centerY - 25;
      this.coordinates = [topLeftX, topLeftY, topLeftX + 100, topLeftY, topLeftX + 100,
        (this.type == "square") ? topLeftY + 100 : topLeftY + 50,
        topLeftX, (this.type == "square") ? topLeftY + 100 : topLeftY + 50, topLeftX, topLeftY
      ];
      break;
    case "ellipse":
    case "circle":
      //circle and ellipse drawn using same code.
      this.coordinates = [this.centerX, this.centerY, (this.type == "ellipse") ? 100 : 50, 50];
      break;
    case "curve":
      this.coordinates = [
        this.centerX - 50, this.centerY, // start point on first quardratic curve.
        this.centerX - 25, this.centerY - 50, // control point on first quardratic curve
        this.centerX, this.centerY, //end point and start point: first/second curve.
        this.centerX + 25, this.centerY + 50, // control point on second quardratic curve
        this.centerX + 50, this.centerY // end point on second quardratic curve
      ];
      break;
    default:
  }
}

//Draw function for shape object.
Shape.prototype.draw = function(context) {
  //SHOULD BE FIRST: if shape has not been built yet and is not polygon or polyline, if not first colors dont render.
  if ((this.coordinates.length <= 0) && (this.type != "polygon") && (this.type != "polyline")) {
    this.build();
  }


  this.path = new Path2D(); //path object very important to check whether point lies in path.
  context.beginPath(this.path);
  context.lineWidth = this.lineWidth;
  context.strokeStyle = this.lineColor;
  context.fillStyle = this.fillColor;
  if (this.selected) {
    context.shadowColor = 'green';
    context.shadowBlur = 7;
  } else {
    context.shadowBlur = 0;
  }


  switch (String(this.type)) {
    case "line":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      this.path.lineTo(this.coordinates[2], this.coordinates[3]);
      break;
    case "triangle":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      this.path.lineTo(this.coordinates[2], this.coordinates[3]);
      this.path.lineTo(this.coordinates[4], this.coordinates[5]);
      this.path.lineTo(this.coordinates[0], this.coordinates[1]);
      break;
    case "square":
    case "rectangle":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      for (var i = 0; i <= this.coordinates.length; i += 2) {
        this.path.lineTo(this.coordinates[i], this.coordinates[i + 1]);
      }
      break;
    case "circle":
    case "ellipse":
      this.path.ellipse(this.coordinates[0], this.coordinates[1], this.coordinates[2], this.coordinates[3], this.angle, 0, 2 * Math.PI, true);
      break;
    case "curve":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      this.path.quadraticCurveTo(this.coordinates[2], this.coordinates[3],
        this.coordinates[4], this.coordinates[5]);
      this.path.quadraticCurveTo(this.coordinates[6], this.coordinates[7],
        this.coordinates[8], this.coordinates[9]);
      break;
    case "polyline":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      for (var i = 2; i < this.coordinates.length; i += 2) {
        this.path.lineTo(this.coordinates[i], this.coordinates[i + 1]);
      }
      break;
    case "polygon":
      this.path.moveTo(this.coordinates[0], this.coordinates[1]);
      for (var i = 2; i < this.coordinates.length; i += 2) {
        this.path.lineTo(this.coordinates[i], this.coordinates[i + 1]);
      }
      break;
    default:
  }

  context.closePath(this.path);
  context.stroke(this.path);

  //lines, curves and polylines don't have fills.
  if (this.type != "line" && this.type != "curve" && this.type != "polyline")
    //very important for shape to be filled.
    context.fill(this.path);

  this.drawRotaionAndMoveIcons(context);

}



//Shape function to draw rotation and scale icons.
Shape.prototype.drawRotaionAndMoveIcons = function(context) {
  //if selected draw rotation icon
  if (this.selected) {
    var rotateIconX;
    var rotateIconY;
    var scaleXIconX;
    var scaleXIconY;
    var scaleYIconX;
    var scaleYIconY;

    switch (this.type) {
      case "line":
      case "polyline":
      case "polygon":
        //get midpoint of first line on shape.
        rotateIconX = (this.coordinates[0] + this.coordinates[2]) / 2;
        rotateIconY = (this.coordinates[1] + this.coordinates[3]) / 2;
        if (this.type != "line") {
          //for polys set this x and x as center because polys don't have a center
          this.centerX = rotateIconX;
          this.centerY = rotateIconY;
        }
        //scale x icon coordinates
        //calculate where to place icon i.e middle of poly or end of line.
        var index = this.coordinates.length / 2;
        scaleXIconX = ((this.coordinates.length / 2) % 2 == 0) ? this.coordinates[index] : this.coordinates[index - 1];
        scaleXIconY = ((this.coordinates.length / 2) % 2 == 0) ? this.coordinates[index + 1] : this.coordinates[index];

        //  polyline, polygon and line don't have yscale. Poly lines and polygons don't have y scale because they are user defined, have center

        scaleYIconX = ((this.coordinates.length / 2) % 2 == 0) ? this.coordinates[index + 2] : this.coordinates[index - 1 + 2];
        scaleYIconY = ((this.coordinates.length / 2) % 2 == 0) ? this.coordinates[index + 1 + 2] : this.coordinates[index + 2];
        break;
      case "triangle":
        //put icon at top vertex.
        rotateIconY = this.coordinates[1];
        rotateIconX = this.coordinates[0];
        //scale x icon.
        scaleXIconX = (this.coordinates[0] + this.coordinates[2]) / 2; //on midpoint of right side
        scaleXIconY = (this.coordinates[1] + this.coordinates[3]) / 2;

        //scale y icon
        scaleYIconX = (this.coordinates[2] + this.coordinates[4]) / 2; //on midpoint of base.
        scaleYIconY = (this.coordinates[3] + this.coordinates[5]) / 2;
        break;
      case "circle":
      case "ellipse":
        //put icon at top of circle or ellipse
        rotateIconX = this.centerX + (this.coordinates[3] * Math.sin(this.angle)); //top most x of ellipse = absolute X coordinate + yRadius * sin( rotaion angle)
        rotateIconY = this.centerY - (this.coordinates[3] * Math.cos(this.angle)); //top most y of ellipse = absolute Y coordinate - yRadius * cos( rotaion angle)
        //scale x icon.
        scaleXIconX = this.coordinates[2] * Math.cos(this.angle) + this.centerX; //left most x of ellipse = xRadius * Cos( rotaion angle) + absolute X coordinate.
        scaleXIconY = this.coordinates[2] * Math.sin(this.angle) + this.centerY; //left most y of ellipse = xRadius * Sin( rotaion angle) + absolute Y coordinate.
        //scale y icon.
        scaleYIconX = this.centerX - this.coordinates[3] * Math.sin(this.angle); // center x - xRadius* sin angle
        scaleYIconY = this.centerY + this.coordinates[3] * Math.cos(this.angle); //center y - xRadius* cos angle
        break;
      case "curve":
        //place icon at midpoint of curve.
        rotateIconX = this.coordinates[4];
        rotateIconY = this.coordinates[5];
        //scale x icon.
        scaleXIconX = this.coordinates[8];
        scaleXIconY = this.coordinates[9];

        //scale y icon.
        scaleYIconX = this.coordinates[6];
        scaleYIconY = this.coordinates[7];
        break;
      case "rectangle":
      case "square":
        //place icon at half of the first line.
        rotateIconX = (this.coordinates[0] + this.coordinates[2]) / 2;
        rotateIconY = (this.coordinates[1] + this.coordinates[3]) / 2;
        //scale x icon.
        scaleXIconX = (this.coordinates[2] + this.coordinates[4]) / 2;
        scaleXIconY = (this.coordinates[3] + this.coordinates[5]) / 2;
        //scale y icon.
        scaleYIconX = (this.coordinates[4] + this.coordinates[6]) / 2;
        scaleYIconY = (this.coordinates[5] + this.coordinates[7]) / 2;
        break;
      default:

    }
    this.rotationIconPath = new Path2D();
    this.scaleXIconPath = new Path2D();
    this.scaleYIconPath = new Path2D();

    //draw rotation icon

    context.lineWidth = 2;
    context.strokeStyle = "black"
    context.shadowColor = 'black';
    context.shadowBlur = 4;
    context.strokeStyle = "white";
    context.beginPath(this.rotationIconPath);
    this.rotationIconPath.arc(rotateIconX, rotateIconY, 5, 0, 1.5 * Math.PI);
    this.rotationIconPath.moveTo(rotateIconX + 7, rotateIconY);
    this.rotationIconPath.lineTo(rotateIconX + 2, rotateIconY + 1);
    this.rotationIconPath.moveTo(rotateIconX + 6, rotateIconY);
    this.rotationIconPath.lineTo(rotateIconX + 7, rotateIconY + 4);
    context.closePath(this.rotationIcon);
    context.stroke(this.rotationIconPath);

    //-----------------draw scale x icon.
    context.strokeStyle = "white";
    context.lineWidth = 5; //helps icon appear on top.
    context.fillStyle = "white";
    context.beginPath(this.scaleXIconPath);
    this.scaleXIconPath.arc(scaleXIconX, scaleXIconY, 2, 0, 2 * Math.PI);
    context.closePath(this.scaleXIconPath);
    context.stroke(this.scaleXIconPath);

    //-----------------draw scale y icon.
    context.strokeStyle = (this.type == "polyline" || this.type == "polygon") ? "#FADBD8" : "white";
    context.lineWidth = 5; //helps icon appear on top.
    context.fillStyle = "white";
    context.beginPath(this.scaleYIconPath);
    this.scaleYIconPath.arc(scaleYIconX, scaleYIconY, 2, 0, 2 * Math.PI);
    context.closePath(this.scaleYIconPath);
    context.stroke(this.scaleYIconPath);
  }

}


function CanvasObject(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
}



CanvasObject.prototype.draw =
  function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < shapes.length; i++) {
      shapes[i].draw(this.context);
    }
  }

/* To be used for poly translation */

canvas.addEventListener('mousemove', setCoordChanges);

function setCoordChanges(event) {
  xChangeCanvas = event.movementX;
  yChangeCanvas = event.movementY;
}
/* ---------------------------------------------------------- */


//JQUERY
$(function() {


  attachDraggableAbility();


  //if polygon or polyline button has been clicked.
  $(".polybutton").click(function() {
    polyType = $(this).attr('id');
    startPolyDraw = true;
  });

  $("#canvas").click(function(event) {
    //if this is double click, don't try to select, just return.
    if (event.originalEvent.detail > 1) {
      return;
    }


    var coordinates = getMouseCoordinates(event);
    if (mode != "") {
      makeSelection(coordinates); //some how prevents a shape from getting deselected when you click during a rotion, I don't know how, but it works.
    }

    //this is function is also used to draw polys, so draw shouldn't be called here if we're making poly
    if (polyType == "" && mode == "") {
      canvas1.draw();
    }
  });

  //if color is selected in dropdown while shape is selected
  $(".colorOptions").change(function() {
    if (selectedShape != -100) {
      initializeColors(shapes[selectedShape]);
      canvas1.draw();
    }
  });



  //--------------------BEGIN MOUSE EVENTS---------------------------------
  $("#wrapper").mouseup(function(event) { //when cursor is off canvas and mouse is up stop rotating or anything.
    isMouseDown = false;
    mode = "";
  });

  $("#canvas").mousedown(function(event) {
    isMouseDown = true;

    var coordinates = getMouseCoordinates(event);
    if (selectedShape != -100) {
      //if clicked on rotation button
      if (canvas1.context.isPointInPath(shapes[selectedShape].rotationIconPath, coordinates[0], coordinates[1]) ||
        canvas1.context.isPointInStroke(shapes[selectedShape].rotationIconPath, coordinates[0], coordinates[1])) {
        mode = "rotate";
      }
      //if clicked on sacle x button
      else if (canvas1.context.isPointInPath(shapes[selectedShape].scaleXIconPath, coordinates[0], coordinates[1]) ||
        canvas1.context.isPointInStroke(shapes[selectedShape].scaleXIconPath, coordinates[0], coordinates[1])) {
        mode = "scaleX";
      }
      //if clicked on sacle y button
      else if (canvas1.context.isPointInPath(shapes[selectedShape].scaleYIconPath, coordinates[0], coordinates[1]) ||
        canvas1.context.isPointInStroke(shapes[selectedShape].scaleYIconPath, coordinates[0], coordinates[1])) {
        mode = "scaleY";
      }
    }

    makeSelection(coordinates); //if mouse down near another object, it can be selected.
    initPoly(coordinates); //initilize a polygon if poly button pressed
  });

  $("#canvas").mousemove(function(event) {
    var coordinates = getMouseCoordinates(event); //get current coordinates.
    var x = coordinates[0];
    var y = coordinates[1];

    //user is trying to rotate or scale something.
    if (polyType == "" && isMouseDown && mode != "") {

      switch (mode) {
        case "rotate":
          rotateShape(selectedShape, canvas1.context, x, y);
          break;
        case "scaleX":
        case "scaleY":
          scaleShape(selectedShape, canvas1.context, mode, x, y);
        default:

      }
    }


    //if user is dragging to define poly change last two coordintes and draw
    else if (polyType != "" && isMouseDown) {
      changeLastVertex(x, y);
      canvas1.draw();
    }

    //-------------------------------TRANSLATION CODE.
    //if shape is selected,
    else if (selectedShape != -100 && isMouseDown) {
      var dx = x - shapes[selectedShape].centerX; //change in previous center of shape to new one.
      var dy = y - shapes[selectedShape].centerY;

      //if new point is within shape then move: prevents selected shape from jumping from one point to another.
      switch (shapes[selectedShape].type) {
        //polys use their own change in x and y values.
        case "polygon":
        case "polyline":
          translateShape(selectedShape, xChangeCanvas, yChangeCanvas);
          break;
          //for curve or line we dont try to keep pointer in path.
        case "line":
        case "curve":
          translateShape(selectedShape, x, y);
          break;
        default:
          if (canvas1.context.isPointInPath(shapes[selectedShape].path, x, y) || canvas1.context.isPointInStroke(shapes[selectedShape].path, x, y)) { //keep pointer within shape.
            translateShape(selectedShape, x, y);
          }
      }
      shapes[selectedShape].selected = true;
      canvas1.draw();
    }

    //------------------------------------------------------
  });


  $("#canvas").mouseup(function() {
    isMouseDown = false;
    mode = "";
  });

  $("#canvas").dblclick(function(event) {
    finalizePoly(getMouseCoordinates(event));
  });

  $("#canvas").mouseout(function(event) {


    //causes infine line to be drawn
    //if mouse is moved outside canvas while poly is being defined, finalize poly with last known click.
    /*  if (polyType != "" && shapes.length > 0) {
        var coordinates = shapes[shapes.length - 1].coordinates;
        finalizePoly(coordinates[coordinates.length - 2], coordinates[coordinates.length - 1]);
      } */
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
      shapes.push(new Shape(String(ui.draggable.attr("id")), x, y));
      canvas1.draw();
    }
  });

  //------------DELETE SHAPE------------------------
  //when x button is clicked, if shape selected, delete it.
  $("#delete").click(function() {
    var button = $(this);

    if (button.hasClass("disabled") == false) {
      if (selectedShape != -100) {
        shapes.splice(selectedShape, 1);
        canvas1.draw();
        button.addClass("disabled");
        selectedShape = -100; //reset selection flag
      }
    }

  });

  //--------------------------CLEAR BUTTON------------------------
  //remove all shapes on canvas.
  $("#clear").click(function() {
    shapes = [];
    selectedShape = -100;
    canvas1.draw();
  });

  //----------------------------SAVE FILE---------------------
  $("#save").click(function() {
    if (selectedShape != -100) {
      shapes[selectedShape].selected = false;
      selectedShape = -100;
    }
    saveFile();
  });

  $("#load-dialog").dialog({
    autoOpen: false,
    modal: true,
    width: 350,
    show: "blind",
    hide: "blind",
  });
  $(".ui-dialog-titlebar").hide();

  //when yes button is clicked save canvas, close dialog.
  $("#yes").click(function() {
    $("#save").click();
    $("#clear").click(); //clear canvas.
    $("#load-dialog").dialog("close");
    readFile(fileOpenEvent);
  });

  //when no button is clickedclose dialog.
  $("#no").click(function() {
    $("#load-dialog").dialog("close");
    $("#clear").click(); //clear canvas.
    readFile(fileOpenEvent);
  });

  $('#load').change(function(evt) {
    fileOpenEvent = evt;
    if (shapes.length > 0) $("#load-dialog").dialog("open"); //show option to save
    else readFile(evt)
  });

});

//-----------------------------LOAD FILE------------------

function readFile(evt) {
  var f = evt.target.files[0];
  if (f) {
    var r = new FileReader();
    r.onload = function(e) {
      var contents = e.target.result; //get contents
      var arr = JSON.parse(contents); //convert them into a javascript object.

      //--------------------------------------------------------------
      //At this point, covert objects in array into shapes
      for (var i = 0; i <= arr.length; i++) {
        var obj = arr[i];

        var newShape = new Shape(String(obj.type), Number(obj.centerX), Number(obj.centerY));
        newShape.coordinates = obj.coordinates;
        newShape.angle = Number(obj.angle);
        newShape.fillColor = String(obj.fillColor);
        newShape.lineColor = String(obj.lineColor);
        newShape.lineWidth = String(obj.lineWidth);
        newShape.selected = false;

        //add to shapes.
        shapes.push(newShape);
        canvas1.draw();
      }

      //-----------------------------------------------------
    }
    r.readAsText(f);
  } else {
    alert("Failed to load file");
  }
  var reader = new FileReader();

  reader.onload = function(e) {
    var dataURL = reader.result;
  }
  reader.readAsDataURL(f);
}




//stringfies the shapes array and saves the file
function saveFile() {
  var jsonString = shapesToJSON();
  var element = document.createElement('a'); //create anchor tag.
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonString)); //point anchor tag to json object.
  element.setAttribute('download', "myCanvasSave.json"); //make click on anchor tag downloadable.
  element.style.display = 'none'; //don't display link.
  document.body.appendChild(element); //add link to body
  element.click(); //simulate user click which starts downlaod.
  document.body.removeChild(element); //remove anchor tag.
}

function shapesToJSON() {
  var jsonString = "[";
  for (var i = 0; i < shapes.length; i++) {
    jsonString += "{"
    jsonString += "\"type\": \"" + shapes[i].type + "\",";
    jsonString += "\"angle\": " + shapes[i].angle + ",";
    jsonString += "\"centerX\":" + shapes[i].centerX + ",";
    jsonString += "\"centerY\":" + shapes[i].centerY + ",";
    jsonString += "\"coordinates\": [" + shapes[i].coordinates + "],";
    jsonString += "\"fillColor\": \"" + shapes[i].fillColor + "\",";
    jsonString += "\"lineColor\": \"" + shapes[i].lineColor + "\",";
    jsonString += "\"lineWidth\": " + shapes[i].lineWidth + ",";
    jsonString += "\"selected\": " + false;
    if (i == shapes.length - 1) jsonString += "}";
    else jsonString += "}, ";
  }
  jsonString += "]";
  return jsonString;
}

//TranslateShape: add change in x and y to every point.
function translateShape(shapeIndex, dx, dy) {
  var x = dx; //save x and y before calculating change.
  var y = dy;
  if (shapes[selectedShape].type != "polyline" && shapes[selectedShape].type != "polygon") {
    dx -= shapes[selectedShape].centerX; //change in previous center of shape to new one.
    dy -= shapes[selectedShape].centerY;
  }

  var shape = shapes[shapeIndex];
  switch (shape.type) {
    case "circle":
    case "ellipse":
      //if circle or ellipse just translate center.
      shape.coordinates[0] += dx;
      shape.coordinates[1] += dy;
      break;
    default:
      for (var i = 0; i < shape.coordinates.length; i += 2) {
        shape.coordinates[i] += dx
        shape.coordinates[i + 1] += dy;
      }

  }
  shape.centerX = x; //update center of shape.
  shape.centerY = y;
}


//changes last coordinate of poly to given coordinates
function changeLastVertex(x, y) {
  var shapeIndex = shapes.length - 1; //last shape added
  var xIndexToChange = shapes[shapeIndex].coordinates.length - 2; //last coordintes added by mouse down as place holders. i.e -1000,-1000, these are to be cahged to new x and y
  var yIndexToChange = shapes[shapeIndex].coordinates.length - 1;
  var xBefore = xIndexToChange - 2; //x,y before the last point.(before place holder values -1000)
  var yBefore = yIndexToChange - 2;

  //check if new point to be added is the same as last point added.
  if ((xBefore >= 0 && shapes[shapeIndex].coordinates[xBefore] == x) && shapes[shapeIndex].coordinates[yBefore] == y) {
    shapes[shapeIndex].coordinates.pop(); //remove place holder points -1000, -1000, also there is nothing to add, last point same as new point.
    shapes[shapeIndex].coordinates.pop();
  } else {
    shapes[shapeIndex].coordinates[xIndexToChange] = x; //coordinates changed
    shapes[shapeIndex].coordinates[yIndexToChange] = y;
  }
}


//make selection and update flag to reflect selected shape.
function makeSelection(coordinates) {
  //if there are shapes that have been drawn and we're not in poly mode.
  if (shapes.length > 0 && polyType == "" && mode == "") {
    //for all shape paths check if pointer lies in any path of any shape stored so far.
    for (var i = 0; i < shapes.length; i++) {
      if (canvas1.context.isPointInPath(shapes[i].path, coordinates[0], coordinates[1]) ||
        canvas1.context.isPointInStroke(shapes[i].path, coordinates[0], coordinates[1])) {

        if (selectedShape != -100) {
          shapes[selectedShape].selected = false;
        }
        selectedShape = i;
        shapes[selectedShape].selected = true;
        document.getElementById("delete").classList.remove("disabled");
        return;
      }
    }
    if (selectedShape != -100) {
      shapes[selectedShape].selected = false;
      selectedShape = -100;
      document.getElementById("delete").classList.add("disabled");
    }
  } //if polytype is being drawn no shape should be selected.
  else if (polyType != "" && selectedShape != -100) {
    document.getElementById("delete").classList.add("disabled");
    shapes[selectedShape].selected = false;
    selectedShape = -100;
  }

}


//passed mouse coordinates, checks if a poly button is selected and initializes a new poly shape to be drawn by moving mouse.
function initPoly(coordinates) {
  //if a plogon or polyline button has been clicked
  if (polyType != "") {
    //if first click add new polygon or polyline
    if (startPolyDraw) {
      //add -1000,-1000 at end because mousemove changes those values for rubberbanding.
      //-1000 is a place holder for next click coordinates.
      var newShape = new Shape(polyType, 0, 0); //create new shape.
      initializeColors(newShape);
      newShape.coordinates = [coordinates[0], coordinates[1], -1000, -1000]; //add clicked coordinate and shapeholder coordinates
      newShape.fillColor = "white"; //prevent fill color before finalization of polygon
      shapes.push(newShape); //add it to shapes.
      startPolyDraw = false; //turn poly initialization off until next time poly button is clicked
    } else {
      //if vertices have been added to shape by mouse move, last 2 points won't be -1000
      if (shapes[shapes.length - 1].coordinates[shapes[shapes.length - 1].coordinates.length - 2] != -1000) {
        shapes[shapes.length - 1].coordinates.push(-1000);
        shapes[shapes.length - 1].coordinates.push(-1000);
        shapes[shapes.length - 1].fillColor = "white"; //prevent fill color before finalization of polygon
      }
      changeLastVertex(coordinates[0], coordinates[1]);
      canvas1.draw();

    }
  }
}

//set colors of the shape.
function initializeColors(shape) {
  //set line color to selected line color
  var lineColorOption = document.getElementById("lineColorSelect");
  var lineColor = lineColorOption.options[lineColorOption.selectedIndex].value;
  shape.lineColor = String(lineColor);

  //lineWidth
  var lineWidthOption = document.getElementById("lineWidthSelect");
  var lineWidth = lineWidthOption.options[lineWidthOption.selectedIndex].value;
  shape.lineWidth = Number(lineWidth) + 3;

  //fill Color
  var fillColorOption = document.getElementById("fillColorSelect");
  var fillColor = fillColorOption.options[fillColorOption.selectedIndex].value;
  shape.fillColor = String(fillColor);
}


//called by double click this method finalizes the polygon or polyline drawing.
function finalizePoly(coordinates) {
  if (polyType == "polyline" && shapes[shapes.length - 1].coordinates.length < 4) {
    alert("A ployline cannot be a dot");
    return;
  }

  //check if polygon drawn is more than 3 sides.(2 * 3 vertices)
  else if (polyType == "polygon" && shapes[shapes.length - 1].coordinates.length < 6) {
    alert("A ploygon cannot have less than 3 sides");
    return;
  }

  //check if last point dragged to, in polygon mode is close to the first point, if so join
  else if (polyType == "polygon") {

    var shapeIndex = shapes.length - 1;
    var lastXIndex = shapes[shapeIndex].coordinates.length - 2; //most recent coordinates of polygon placed.
    var lastYIndex = shapes[shapeIndex].coordinates.length - 1;

    //if last point clicked is close to starting point, join to starting point else add
    if (Math.abs(shapes[shapeIndex].coordinates[0] - shapes[shapeIndex].coordinates[lastXIndex]) <= 5 &&
      Math.abs(shapes[shapeIndex].coordinates[1] - shapes[shapeIndex].coordinates[lastYIndex]) <= 5) {
      shapes[shapeIndex].coordinates[lastXIndex] = shapes[shapeIndex].coordinates[0];
      shapes[shapeIndex].coordinates[lastYIndex] = shapes[shapeIndex].coordinates[1];
    } else {

      //else add another vertex and join to start point.
      shapes[shapeIndex].coordinates.push(shapes[shapeIndex].coordinates[0]);
      shapes[shapeIndex].coordinates.push(shapes[shapeIndex].coordinates[1]);
    }
    initializeColors(shapes[shapeIndex]); //set polyGon to it's rightful fill
  }
  canvas1.draw();
  startPolyDraw = false;
  polyType = "";
}


//rotate a shape at the center point.
function rotateShape(shapeIndex, context, x, y) {
  var shape = shapes[shapeIndex];
  var rotationPointX = shape.centerX; // make point of rotation center of shape.
  var rotationPointY = shape.centerY;
  var coordinates = shape.coordinates;
  var tempWorkArr = coordinates.slice(0); //copy coordinates into temp array, we don't want to change the original yet.   //original values saved to be used in calculations.
  var angle = 0;

  //calculate angle where mouse click is
  //make triangle between clicked point and center, find angle using cosine.
  var d2 = Math.sqrt(Math.pow((y - shape.centerY), 2)); //distance of right angle line to same level as clicked point.
  var d1 = Math.sqrt(Math.pow((x - shape.centerX), 2) + Math.pow((y - shape.centerY), 2));

  angle = Math.acos(d2 / d1);

  //adjust angle calculated to place it in right quadrant.
  if ((x - shape.centerX) < 0 && (y - shape.centerY) > 0) { //angle is in third quadrant add 180
    angle = Math.PI + angle;
  } else if ((x - shape.centerX) > 0 && (y - shape.centerY) > 0) { //angle is in second quadrant subtract 180
    angle = Math.PI - angle;
  } else if ((x - shape.centerX) < 0 && (y - shape.centerY) < 0) { //angle is in fourth quadrant subtract it from 360
    angle = (2 * Math.PI) - angle;
  }

  context.save();
  switch (shape.type) {
    case "circle":
    case "ellipse":
      //basically for circle and ellipse rotation just change the angle at which they are drawn since we are rotating about the center, no matrix needed.
      shape.angle = angle;
      break;
    default: // Move rotation point to center of the shape.

      //if shape is polyline or polygon, we can't tell what the center is since it's user defined: we used the exact point where the rotaion icon is
      if (shape.type == "polygon" || shape.type == "polyline") {
        rotationPointX = (shape.coordinates[0] + shape.coordinates[2]) / 2;
        rotationPointY = (shape.coordinates[1] + shape.coordinates[3]) / 2;
      }

      context.translate(rotationPointX, rotationPointY);
      //translate each point of shape to new rotation point.
      //(i.e we want to rotate about a given point, not the origin so we translate the coordinate system to that point)
      for (var i = 0; i < tempWorkArr.length; i += 2) {
        tempWorkArr[i] -= rotationPointX;
        tempWorkArr[i + 1] -= rotationPointY;
      }
      if (isNaN(angle)) angle = 0; //fix error where a speedy click produces Nan
      var changeInAngle = angle - shape.angle; //if shape was already rotated, only rotate it by difference.

      //***ROTATION MATRIX ***
      //This calculation is shorthand for the transformation matrix for rotation. ROtate every point on shape.
      for (var i = 0; i < tempWorkArr.length; i += 2) {
        coordinates[i] = (tempWorkArr[i] * Math.cos(changeInAngle)) + (tempWorkArr[i + 1] * -Math.sin(changeInAngle));
        coordinates[i + 1] = (tempWorkArr[i] * Math.sin(changeInAngle)) + (tempWorkArr[i + 1] * Math.cos(changeInAngle));
      }
      for (var i = 0; i < tempWorkArr.length; i += 2) {
        coordinates[i] += rotationPointX;
        coordinates[i + 1] += rotationPointY;
      }

      //update angle at which shape is rotated.
      shape.angle = angle;
  }

  context.restore();
  canvas1.draw();
}


//scale shape while it 's at center.
function scaleShape(shapeIndex, context, mode, x, y) {

  var shape = shapes[shapeIndex];
  var scalePointX = shape.centerX; // fix shape at it's center during scaling.
  var scalePointY = shape.centerY;
  var coordinates = shape.coordinates;
  var scaleFactorX = 1;
  var scaleFactorY = 1;

  //set scale factor, if factor is set to constant value, scaling is good but doesn't allow
  //for a user's scaling speed. So add the change in x or y but divide it by a constant factor 100,
  //otherwise the user moves a little bit and the shape scales alot.
  if (xChangeCanvas < 0) {
    scaleFactorX = 0.995 + (xChangeCanvas / 1000);
  } else {
    scaleFactorX = 1.005 + (xChangeCanvas / 1000);
  }
  if (yChangeCanvas < 0) {
    scaleFactorY = 0.995 + (yChangeCanvas / 1000);
  } else {
    scaleFactorY = 1.005 + (yChangeCanvas / 1000);
  }
  var isIconOnRight = (shape.angle <= Math.PI / 2) || (((3 * Math.PI / 2) <= shape.angle) && (shape.angle <= (2 * Math.PI)));
  var isIconOnLeft = (shape.angle > Math.PI / 2) && (shape.angle < (3 * Math.PI / 2));

  switch (shape.type) {
    case "circle":
    case "ellipse":
      //This code effectively scales either the y or x radius.
      (mode == "scaleX") ? (shape.coordinates[2] += (x - shape.centerX - shape.coordinates[2])) : (shape.coordinates[3] += (y - shape.centerY - shape.coordinates[3]));
      break;
    case "rectangle":
    case "square":
      //use distance formula to find width and height.
      var width = Math.sqrt(Math.pow((shape.coordinates[2] - shape.coordinates[0]), 2) + Math.pow((shape.coordinates[3] - shape.coordinates[1]), 2));
      var height = Math.sqrt(Math.pow((shape.coordinates[6] - shape.coordinates[0]), 2) + Math.pow((shape.coordinates[7] - shape.coordinates[1]), 2));
      if (mode == "scaleX") {
        var changeInX = x - shape.centerX - ((width / 2) * Math.cos(shape.angle));
        var changeInY = changeInX * Math.tan(shape.angle);

        //if width is 2 or less and shape is facing a certain way refuse to scale it any further
        if (width <= 2 && (isIconOnRight && (changeInX < 0))) {} else if (width <= 2 && (isIconOnLeft && (changeInX > 0))) {} else {
          shape.coordinates[0] -= changeInX;
          shape.coordinates[2] += changeInX;
          shape.coordinates[4] += changeInX;
          shape.coordinates[6] -= changeInX;
          shape.coordinates[8] -= changeInX;
          shape.coordinates[1] -= changeInY;
          shape.coordinates[3] += changeInY;
          shape.coordinates[5] += changeInY;
          shape.coordinates[7] -= changeInY;
          shape.coordinates[9] -= changeInY;
        }
      } else if (mode == "scaleY") {
        var changeInY = y - shape.centerY - ((height / 2) * Math.cos(shape.angle));
        var changeInX = changeInY * Math.tan(shape.angle);
        //if height is 2 or less and scale is negative, don't do anything
        if (height <= 2 && (isIconOnRight && (changeInY < 0))) {} else if (height <= 2 && (isIconOnLeft && (changeInY > 0))) {} else {
          shape.coordinates[0] += changeInX;
          shape.coordinates[2] += changeInX;
          shape.coordinates[4] -= changeInX;
          shape.coordinates[6] -= changeInX;
          shape.coordinates[8] += changeInX;
          shape.coordinates[1] -= changeInY;
          shape.coordinates[3] -= changeInY;
          shape.coordinates[5] += changeInY;
          shape.coordinates[7] += changeInY;
          shape.coordinates[9] -= changeInY;
        }

      }
      break;
    case "triangle":
      var base = Math.sqrt(Math.pow((shape.coordinates[4] - shape.coordinates[2]), 2) + Math.pow((shape.coordinates[5] - shape.coordinates[3]), 2));
      if (mode == "scaleX") {
        var scaleXX = (shape.coordinates[0] + shape.coordinates[2]) / 2;
        var scaleXY = (shape.coordinates[1] + shape.coordinates[3]) / 2;
        var centerToScaleXPoint = Math.sqrt(Math.pow((scaleXX - shape.centerX), 2) + Math.pow((scaleXY - shape.centerY), 2));
        var changeInX = x - shape.centerX - centerToScaleXPoint * Math.cos(shape.angle);
        var changeInY = changeInX * Math.tan(shape.angle);
        if (base <= 2 && (isIconOnRight && (changeInX < 0))) {} else if (base <= 2 && (isIconOnLeft && (changeInX > 0))) {} else {
          shape.coordinates[2] += changeInX;
          shape.coordinates[4] -= changeInX;
          shape.coordinates[5] -= changeInY;
          shape.coordinates[3] += changeInY;
        }
      } else if (mode == "scaleY") {
        var scaleYX = (shape.coordinates[2] + shape.coordinates[4]) / 2;
        var scaleYY = (shape.coordinates[3] + shape.coordinates[5]) / 2;
        var height = Math.sqrt(Math.pow((shape.coordinates[0] - scaleYX), 2) + Math.pow((shape.coordinates[1] - scaleYY), 2));
        var centerToScaleYPoint = Math.sqrt(Math.pow((scaleYX - shape.centerX), 2) + Math.pow((scaleYY - shape.centerY), 2));
        var changeInY = y - shape.centerY - centerToScaleYPoint * Math.cos(shape.angle);
        var changeInX = changeInY * Math.tan(shape.angle);
        //if height of triangle is less than 0 and scale is negative ie wants to reduce futher, do nothing.
        if (height <= 2 && (isIconOnRight && (changeInY < 0))) {} else if (height <= 2 && (isIconOnLeft && (changeInY > 0))) {} else {
          shape.coordinates[0] += changeInX;
          shape.coordinates[2] -= changeInX;
          shape.coordinates[4] -= changeInX;
          shape.coordinates[1] -= changeInY;
          shape.coordinates[5] += changeInY;
          shape.coordinates[3] += changeInY;
        }

      }
      break;
    case "line":
      //since I'm scaling about a shapes's center a line cannot be scaled by it's y, only it's i.e it can be made longer not taller.
      var length = Math.sqrt(Math.pow((shape.coordinates[0] - shape.coordinates[2]), 2) + Math.pow((shape.coordinates[1] - shape.coordinates[3]), 2));
      var centerToScaleXPoint = Math.sqrt(Math.pow((shape.coordinates[2] - shape.centerX), 2) + Math.pow((shape.coordinates[3] - shape.centerY), 2));
      var changeInX = x - shape.centerX - (centerToScaleXPoint * Math.cos(shape.angle));
      var changeInY = changeInX * Math.tan(shape.angle);
      if (length <= 20 && (isIconOnRight && (changeInX < 0))) {} else if (length <= 2 && (isIconOnLeft && (changeInX > 0))) {} else {
        shape.coordinates[2] += changeInX;
        shape.coordinates[0] -= changeInX;
        shape.coordinates[1] -= changeInY;
        shape.coordinates[3] += changeInY;
      }
      break;
    case "curve":
      var length = Math.sqrt(Math.pow((shape.coordinates[8] - shape.coordinates[0]), 2) + Math.pow((shape.coordinates[9] - shape.coordinates[1]), 2));
      var highPointDifference = Math.sqrt(Math.pow((shape.coordinates[6] - shape.coordinates[2]), 2) + Math.pow((shape.coordinates[3] - shape.coordinates[7]), 2));
      if (mode == "scaleX") {
        var centerToXScalePoint = Math.sqrt(Math.pow((shape.coordinates[8] - shape.centerX), 2) + Math.pow((shape.coordinates[9] - shape.centerY), 2));
        var changeInX = x - shape.centerX - (centerToXScalePoint * Math.cos(shape.angle));
        var changeInY = changeInX * Math.tan(shape.angle);
        if (length <= 20 && (isIconOnRight && (changeInX < 0))) {} else if (length <= 2 && (isIconOnLeft && (changeInX > 0))) {} else {
          shape.coordinates[8] += changeInX;
          shape.coordinates[6] += changeInX;
          shape.coordinates[0] -= changeInX;
          shape.coordinates[2] -= changeInX;
          shape.coordinates[9] += changeInY;
          shape.coordinates[7] += changeInY;
          shape.coordinates[3] -= changeInY;
          shape.coordinates[1] -= changeInY;
        }
      } else if (mode == "scaleY") {

        var centerToYScalePoint = Math.sqrt(Math.pow((shape.coordinates[6] - shape.centerX), 2) + Math.pow((shape.coordinates[7] - shape.centerY), 2));
        var changeInY = y - shape.centerY - centerToYScalePoint * Math.cos(shape.angle);
        var changeInX = changeInY * Math.tan(shape.angle);
        if (highPointDifference <= 60 && (isIconOnRight && (changeInY < 0))) {} else if (height <= 2 && (isIconOnLeft && (changeInY > 0))) {} else {
          shape.coordinates[8] += changeInX;
          shape.coordinates[6] -= changeInX;
          shape.coordinates[0] -= changeInX;
          shape.coordinates[2] += changeInX;
          shape.coordinates[9] -= changeInY;
          shape.coordinates[7] += changeInY;
          shape.coordinates[3] -= changeInY;
          shape.coordinates[1] += changeInY;

        }
      }
      break;
    case "polyline":
    case "polygon":
      if (mode == "scaleX" && xChangeCanvas != 0) {
        for (var i = 0; i < shape.coordinates.length; i += 2) {
          shape.coordinates[i] *= scaleFactorX;
        }
      } else if (mode == "scaleY" && yChangeCanvas != 0) {
        for (var i = 0; i < shape.coordinates.length; i += 2) {
          shape.coordinates[i + 1] *= scaleFactorY;
        }
      }
      break;
    default:
  }
  canvas1.draw();
}

function changeOption(id, value) {
  switch (String(id)) {
    case "lineColorSelect":
      lineColor = String(value);
      document.getElementById("lineColorDiv").style.backgroundColor = lineColor;
      break;
    case "fillColorSelect":
      fillColor = String(value);
      document.getElementById("fillColorDiv").style.backgroundColor = fillColor;
      break;
    case "lineWidthSelect":
      lineWidth = 3 + Number(value);
      break;
    default:

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
