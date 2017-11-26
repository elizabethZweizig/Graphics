'use strict'
////////////////////////////////////////////////////////////////////////////////
/*global THREE, document, window  */
var camera, renderer, params, gui, segmentGeo, segment, segmentMat,
    endPoint1, endPoint2;
var objects;

var clock = new THREE.Clock();
var scene = new THREE.Scene();

var intersection = new THREE.Vector3(), mouse = new THREE.Vector2(),
    canvasWidth, canvasHeight, INTERSECTED, SELECTED;
var plane = new THREE.Plane(),
    offset = new THREE.Vector3();

var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();

var INSIDE = 0; // 0000
var LEFT = 1;   // 0001
var RIGHT = 2;  // 0010
var BOTTOM = 4; // 0100
var TOP = 8;    // 1000

var xmin = -150;
var xmax = 150;
var ymin = -100;
var ymax = 100;

var red = new THREE.Color(0xff0000);
var green = new THREE.Color(0x00ff00);
var yellow = new THREE.Color(0xffff00);

function fillScene() {
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );


// Set up gui sliders
	gui = new dat.GUI({
		autoPlace: false,
    height : (32 * 3)- 1
	});

  params = {
  	clipping: false,
  };

	gui.add(params, 'clipping').name('Clipping');


	gui.domElement.style.position = "relative";
	gui.domElement.style.top = "-400px";
	gui.domElement.style.left = "350px";

	// LIGHTS

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 500, 500 );

	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, -100, -400 );

	scene.add( light );

	drawClippingFrame();
}


function drawClippingFrame() {
  var lineMat = new THREE.LineBasicMaterial({
	   color: 0xffffff
  });

  var edge1Geo = new THREE.Geometry();
  edge1Geo.vertices.push(
    new THREE.Vector3().set(xmin, ymax, 0),
    new THREE.Vector3().set(xmax, ymax, 0)
  );
  var edge1 = new THREE.Line( edge1Geo, lineMat );
  var edge2Geo = new THREE.Geometry();
  edge2Geo.vertices.push(
    new THREE.Vector3().set(xmin, ymax, 0),
    new THREE.Vector3().set(xmin, ymin, 0)
   );
  var edge2 = new THREE.Line( edge2Geo, lineMat );
  var edge3Geo = new THREE.Geometry();
  edge3Geo.vertices.push(
    new THREE.Vector3().set(xmax, ymax, 0),
    new THREE.Vector3().set(xmax, ymin, 0)
   );
  var edge3 = new THREE.Line( edge3Geo, lineMat );
  var edge4Geo = new THREE.Geometry();
    edge4Geo.vertices.push(
    new THREE.Vector3().set(xmin, ymin, 0),
    new THREE.Vector3().set(xmax, ymin, 0)
  );
  var edge4 = new THREE.Line( edge4Geo, lineMat );

  scene.add( edge1 );
  scene.add( edge2 );
  scene.add( edge3 );
  scene.add( edge4 );

  endPoint1 = new THREE.Mesh( new THREE.SphereGeometry( 15, 12, 12),
                       new THREE.MeshLambertMaterial({
                         color: 0x777777
                       }));
  scene.add( endPoint1 );
  endPoint1.position.x = 150;
  setCode(endPoint1);

  endPoint2 = new THREE.Mesh( new THREE.SphereGeometry( 15, 12, 12),
                       new THREE.MeshLambertMaterial({
                         color: 0x777777 }));
  scene.add( endPoint2 );
  endPoint2.position.y = 150;
  setCode(endPoint2);

  segmentMat = new THREE.LineBasicMaterial({
	   color: 0x000000
  });
  segmentGeo = new THREE.Geometry();
    segmentGeo.vertices.push(
    new THREE.Vector3().copy(endPoint1.position),
    new THREE.Vector3().copy(endPoint2.position)
  );
  segment = new THREE.Line( segmentGeo, segmentMat );

  scene.add(segment);

  objects = [endPoint1, endPoint2];

  animate();
}


function init() {
	canvasWidth = 600;
	canvasHeight = 400;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0 );
  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
	// CAMERA
	camera = new THREE.OrthographicCamera( canvasWidth / - 2, canvasWidth / 2, canvasHeight / 2, canvasHeight / - 2, 1, 1000 );
  camera.position.set( 0, 0, 100);

  camera.lookAt( new THREE.Vector3(0, 0, 0));
  scene.add( camera );
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function setCode(endpoint) {
  /* TODO:
    Codes are defined above using integers (INSIDE, RIGHT, LEFT, TOP).
    Assign the appropriate code to the endpoint.

    Three.js objects are also JavaScript objects, so you can assign them
    attributes as you like. You can use an attribute called 'code' and
    assign it like this:

    endpoint.code = VALUE

    It's of course possible for an endpoint to have more than one bit true. Using
    bitwise operators is the most straightforward way to set individual bits. In
    particular, bitwise OR my be of use here.

    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
  */

  // BEGIN CHANGES
  endpoint.code = INSIDE;
  if(endpoint.position.x > xmax)
  {
    endpoint.code |= RIGHT;
  }
  else if (endpoint.position.x <xmin)
  {
    endpoint.code |=LEFT;
  }
  else
  {
    endpoint.code |=INSIDE;
  }

  if (endpoint.position.y > ymax)
  {
    endpoint.code |= TOP;
  }
  else if (endpoint.position.y < ymin)
  {
    endpoint.code |=BOTTOM;
  }
  // END CHANGES
}

function checkForClipping() {
  /* TODO:
    Check the endpoint codes to see whether the segment can be rendered as is,
    whether it can be discareded without further processing, or whether we need
    to do clipping. Represent which of these cases is true by setting the segment's
    material color to green, red, or yellow.

    The main conditional should use bitwise operators to compare endpoints.
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators

    The behavior of the program here should also depend on whether params.clipping
    is set. If it is set, then the segment.visible value should be set to false for
    discarded segments (you'll need to deal with segment.visible) appropriately
    in all cases when the segment should be visible again, of course).

    If clipping calculation is necessary, you'll call doClipping()
  */
  // BEGIN CHANGES
  if (!params.clipping)
    {
      if ((endPoint1.code & endPoint2.code) > 0)
      {
        segment.material.color = red;
      }
      else if ((endPoint1.code == 0) && (endPoint2.code == 0))
      {
        segment.material.color = green;
      }
      else
      {
        segment.material.color = yellow;
      }
    }
    else
    {
        segment.material.color = green;
        doClipping();
    }
  // END CHANGES
}


function doClipping() {
  /* TODO:
  Here you'll clip one endpoint at the nearest intersection with an edge by calculating
  the intersection and setting the point's position to that point.

  This function will only calculate one clipping point, then it will check again whether
  further clipping is needed.

  In order to determine which endpoint to clip, check them one at a time. If endPoint1
  needs clipping, clip it. If it doesn't, clip endPoint2. If they both do, the
  recursive call to checkForClipping() will handle both cases one at a time.

  When you have set the clipped endpoint's coordinates to the intersection point,
  be sure to update the line segment's geometry with these lines:

      segment.geometry.vertices = [endPoint1.position, endPoint2.position];
      segment.geometry.verticesNeedUpdate = true;

  Also, be sure that you re-set the code for the newly clipped endpoint, or the
  recursive checkForClipping() call will blow up the stack.
  */

  // BEGIN CHANGES
  var temp;

  if(endPoint1.code != 0)
  {
    // for endPoint1
    if (endPoint1.position.x < xmin)
    {
      temp = (xmin - endPoint1.position.x)/(endPoint2.position.x - endPoint1.position.x);

      endPoint1.position.y = ((1-temp) * endPoint1.position.y) + (temp * endPoint2.position.y);
      endPoint1.position.x = xmin;
    }
    else if (endPoint1.position.x > xmax)
    {
      temp = (xmax - endPoint1.position.x)/(endPoint2.position.x - endPoint1.position.x);

      endPoint1.position.y = ((1-temp) * endPoint1.position.y) + (temp * endPoint2.position.y);
      endPoint1.position.x = xmax;
    }

    if (endPoint1.position.y < ymin)
    {
      temp = (ymin - endPoint1.position.y)/(endPoint2.position.y - endPoint1.position.y);

      endPoint1.position.x = ((1-temp) * endPoint1.position.x) + (temp * endPoint2.position.x);
      endPoint1.position.y = ymin;
    }
    else if (endPoint1.position.y > ymax)
    {
      temp = (ymax - endPoint1.position.y)/(endPoint2.position.y - endPoint1.position.y);

      endPoint1.position.x = ((1-temp) * endPoint1.position.x) + (temp * endPoint2.position.x);
      endPoint1.position.y = ymax;
    }
  }

  if (endPoint2.code != 0)
  {
    // for endPoint2
    if (endPoint2.position.x < xmin)
    {
      temp = (xmin - endPoint2.position.x)/(endPoint1.position.x - endPoint2.position.x);

      endPoint2.position.y = ((1-temp) * endPoint2.position.y) + (temp * endPoint1.position.y);
      endPoint2.position.x = xmin;
    }
    else if (endPoint2.position.x > xmax)
    {
      temp = (xmax - endPoint2.position.x)/(endPoint1.position.x - endPoint2.position.x);

      endPoint2.position.y = ((1-temp) * endPoint2.position.y) + (temp * endPoint1.position.y);
      endPoint2.position.x = xmax;
    }

    if (endPoint2.position.y < ymin)
    {
      temp = (ymin - endPoint2.position.y)/(endPoint1.position.y - endPoint2.position.y);

      endPoint2.position.x = ((1-temp) * endPoint2.position.x) + (temp * endPoint1.position.x);
      endPoint2.position.y = ymin;
    }
    else if (endPoint2.position.y > ymax)
    {
      temp = (ymax - endPoint2.position.y)/(endPoint1.position.y - endPoint2.position.y);

      endPoint2.position.x = ((1-temp) * endPoint2.position.x) + (temp * endPoint1.position.x);
      endPoint2.position.y = ymax;
    }
  }
  // console.log("OUTSIDE: t: " + t + ", y1: " +endPoint1.position.y + ", y2: "+ endPoint2.position.y);

  segment.geometry.vertices = [endPoint1.position, endPoint2.position];
  segment.geometry.verticesNeedUpdate = true;
  // END CHANGES
}

function animate() {
  checkForClipping();
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	renderer.render(scene, camera);
}


function onDocumentMouseMove( event ) {
	event.preventDefault();
  // this converts window mouse values to x and y mouse coordinates that range
  // between -1 and 1 in the canvas
  mouse.set(
     (( event.clientX / window.innerWidth ) * 2 - 1) *
     (window.innerWidth/canvasWidth),
     (-((event.clientY - ($("#canvas").position().top + (canvasHeight/2))) / window.innerHeight) * 2 )
     * (window.innerHeight/canvasHeight));

  // uses Three.js built-in raycaster to send a ray from the camera
	raycaster.setFromCamera( mouse, camera );
	if ( SELECTED ) {
    if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
      SELECTED.position.copy( intersection.sub( offset ));
      segment.geometry.vertices = [endPoint1.position, endPoint2.position];
      segment.geometry.verticesNeedUpdate = true;
      setCode(SELECTED);
    }
		return;
	}

  // determines which objects are intersected by the ray, and sets the dragging
  // plane with respect to the camera view.
	var intersects = raycaster.intersectObjects(objects);
	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[0].object ) {
			INTERSECTED = intersects[0].object;
			plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection( plane.normal ),
        INTERSECTED.position);
		}
		canvas.style.cursor = 'pointer';
	} else {
		INTERSECTED = null;
		canvas.style.cursor = 'auto';
	}
}

// handles mouse down event
function onDocumentMouseDown( event ) {
	event.preventDefault();
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects );
	if ( intersects.length > 0 ) {
		SELECTED = intersects[ 0 ].object;
		if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
			offset.copy( intersection ).sub( SELECTED.position );
		}
		canvas.style.cursor = 'move';
	}
}

// handles mouse up event
function onDocumentMouseUp( event ) {
	event.preventDefault();
	if ( INTERSECTED ) {
		SELECTED = null;
	}
	canvas.style.cursor = 'auto';
}

try {
  init();
  fillScene();
  addToDOM();
} catch(error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
