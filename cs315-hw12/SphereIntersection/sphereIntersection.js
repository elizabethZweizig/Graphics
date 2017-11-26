'use strict'
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window  */
var camera, scene, renderer, cameraControls, canvasWidth, canvasHeight,
    redBall, greenBall, sphere, intersect1, intersect2, intersect3,
    line, lineGeom, lineMat, redBalllabel, greenBalllabel, gui, params,
    reflectionCube;
var SPHERE_SIZE = 200;
var objects = [];
var plane = new THREE.Plane(),
mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
redToGreenRay = new THREE.Vector3,
intersection = new THREE.Vector3(), INTERSECTED, SELECTED;

var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();

function fillScene() {

  // Set up gui sliders
	gui = new dat.GUI({
		autoPlace: false,
    height : (32 * 3)- 1
	});

  params = {
    scale: 1
  }

  gui.add(params, 'scale').min(0.5).max(2).step(0.1).name('Sphere Scale');
	gui.domElement.style.position = "relative";
	gui.domElement.style.top = "-400px";
	gui.domElement.style.left = "350px";

  //skybox

  var imagePrefix = "../../images/airport/sky-";
  var imageSuffix = ".png";
  var urls  = [imagePrefix+"xpos"+imageSuffix, imagePrefix+"xneg"+imageSuffix,
							imagePrefix+"ypos"+imageSuffix, imagePrefix+"yneg"+imageSuffix,
							imagePrefix+"zpos"+imageSuffix, imagePrefix+"zneg"+imageSuffix];
  reflectionCube = new THREE.ImageUtils.loadTextureCube( urls );
  reflectionCube.format = THREE.RGBFormat;

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );
	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, 500, 500 );
	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff, 0.6 );
	light.position.set( 100, 100, -400 );
	scene.add( light );

  //grid xz
  var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
  scene.add(gridXZ);

  drawSphereIntersection();
}

function drawSphereIntersection() {

  var sphereMaterial = new THREE.MeshPhongMaterial( {
		color: 0xFFFFFF,
		shininess: 100,
		transparent: true,
		opacity: 0.5,
		envMap: reflectionCube,
		combine: THREE.MixOperation,
		reflectivity: 0.3 } );
	sphereMaterial.color.setRGB( 0.2, 0, 0.2 );
	sphereMaterial.specular.setRGB( 1, 1, 1 );


  sphere = new THREE.Mesh( new THREE.SphereGeometry( SPHERE_SIZE, 16, 16),
                          sphereMaterial);
  scene.add( sphere );

  redBall = new THREE.Mesh( new THREE.SphereGeometry( 30, 12, 12),
                       new THREE.MeshLambertMaterial({ color: 0xff0000 }));
  redBall.position.x = 0;
  redBall.position.y = 0;
  redBall.position.z = -300;
  scene.add( redBall );

  greenBall = new THREE.Mesh( new THREE.SphereGeometry( 30, 12, 12),
                       new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
  greenBall.position.x = 0;
  greenBall.position.y = 0;
  greenBall.position.z = 300;
  scene.add( greenBall );

  intersect1 = new THREE.Mesh( new THREE.SphereGeometry( 15, 12, 12),
                       new THREE.MeshLambertMaterial({ color: 0xff0000 }));
  intersect1.position.x = 0;
  intersect1.position.y = 0;
  intersect1.position.z = -50;
  scene.add( intersect1 );

  intersect2 = new THREE.Mesh( new THREE.SphereGeometry( 15, 12, 12),
                       new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
  intersect2.position.x = 0;
  intersect2.position.y = 0;
  intersect2.position.z = 50;
  scene.add( intersect2 );

  intersect3 = new THREE.Mesh( new THREE.SphereGeometry( 15, 12, 12),
                       new THREE.MeshLambertMaterial({ color: 0xffff00 }));
  scene.add( intersect3 );

  lineMat = new THREE.LineBasicMaterial({
	   color: 0x000000
  });

  lineGeom= new THREE.Geometry();
  lineGeom.vertices.push(
	   redBall.position,
	   greenBall.position
   );
  line = new THREE.Line( lineGeom, lineMat );
  scene.add( line );

  // objects that we want to test for intersection (picking) by
  // the ray caster
  objects = [redBall, greenBall, sphere];
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
  renderer.setPixelRatio( window.devicePixelRatio );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );

	// CONTROLS
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.set( -800, 600, -500);
	cameraControls.target.set(4,0,92);

	// HTML LABELS
  redBalllabel = document.createElement('div');
	redBalllabel.style.position = 'absolute';
	redBalllabel.style['pointer-events'] = 'none';
	redBalllabel.style.width = 100;
	redBalllabel.style.height = 50;

  greenBalllabel = document.createElement('div');
	greenBalllabel.style.position = 'absolute';
	greenBalllabel.style['pointer-events'] = 'none';
	greenBalllabel.style.width = 100;
	greenBalllabel.style.height = 50;
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
  sphere.scale.set(params.scale, params.scale, params.scale);
  placeIntersects();

	window.requestAnimationFrame(animate);
	render();
}

function placeIntersects(){
  // TODO:
  // Position the intersect1, intersect2, and intersect3 objects, and set their visibility
  // appropriately. Three.js objects have a boolean property 'visible' that you can
  // use for this.

  // Refer to either the Shirley reading or the 3D Math Primer textbook P 727
  // for how to calculate the intersection between the line and the sphere.
  // Do not use any built in ray-tracing or intersection calculation functions from
  // Three.js. The point here is to do it manually. You may use whetever Vector3
  // operations you need, and whatever JS Math operations you need
  // https://threejs.org/docs/#api/math/Vector3
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math

  // All your new code should be contained here in this function, with the exception of
  // variable declarations, which you can make in whatever scope you feel appropriate.

  // Be aware of which vector operations are destructive, and use .clone() as
  // necessary.

  // The yellow ball (intersect3) should appear in the case when there is only one
  // point of intersection. However, in practice, it's rare that we can observe
  // an intersection precisely at one point, so for visualization purposes I
  // give the yellow ball a little more space, and have it appear in a window of
  // plus or minus 10 units from a single point of intersection.

  // The three lines of code below are the temporary positioning of the objects
  // for the starter file. You can ignore/delete this code (you will need to
  // replace it). It simply positions the intersect objects on the line relative
  // to the endpoints. There's not a lot here that's directly relevant to the actual
  // solution.

  intersect1.position.copy(greenBall.position.clone().add(redBall.position.clone().multiplyScalar(5)).divideScalar(6));
  intersect2.position.copy(redBall.position.clone().add(greenBall.position.clone().multiplyScalar(5)).divideScalar(6));
  intersect3.position.copy(redBall.position.clone().add(greenBall.position.clone()).divideScalar(2));

  var greenRay = new THREE.Vector3();
  greenRay = greenBall.position.clone().normalize();

  var redRay = new THREE.Vector3();
  redRay = redBall.position.clone().normalize();

  var center = sphere.position;

  var e = new THREE.Vector3();
  e.subVectors(center, redBall.position.clone());


  var d = new THREE.Vector3();
  d.subVectors(redBall.position.clone(), greenBall.position.clone()).normalize();

  var a = e.dot(d);

  var r = SPHERE_SIZE * params.scale;

  var eSqr = e.dot(e);
  var multA = a * a;
  var multR = r * r;

  var x = multR - eSqr;

  var y = x + multA;

  var f = new THREE.Vector3();
  f = Math.sqrt(y);

  var t = new THREE.Vector3();
  t = a - f;

  var point = new THREE.Vector3();
  point = (d.clone().multiplyScalar(t));
  point.add(redBall.position.clone());
  //console.log(point);

  intersect2.position.x = point.x;
  intersect2.position.y = point.y;
  intersect2.position.z = point.z;
  //

  var e1 = new THREE.Vector3();
  e1.subVectors(center, greenBall.position.clone());

  var d1 = new THREE.Vector3();
  d1.subVectors(greenBall.position.clone(), redBall.position.clone()).normalize();

  var a1 = e1.dot(d1);

  var eSqr1 = e1.dot(e1);
  var multA = a1 * a1;
  var multR = r * r;

  var x1 = multR - eSqr1;

  var y1 = x1 + multA;

  var f1 = new THREE.Vector3();
  f1 = Math.sqrt(y1);

  var t1 = new THREE.Vector3();
  t1 = a1 - f1;

  var point2 = new THREE.Vector3();
  point2 = (d1.clone().multiplyScalar(t1));
  point2.add(greenBall.position.clone());
  intersect1.position.x = point2.x;
  intersect1.position.y = point2.y;
  intersect1.position.z = point2.z;

  if(point.distanceTo(point2) < 15){
    intersect3.visible = true;
    intersect1.visible = false;
    intersect2.visible = false;
  }
  else{
    intersect3.visible = false;
    intersect1.visible = true;
    intersect2.visible = true;
  }
  // END OF CHANGES
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
	camera.updateMatrixWorld();

  // place x, y, z HTML labels on each of the points
	redBalllabel.style.top = (toXYCoords(redBall.position).y + $("#canvas").offset().top + 10)  + 'px';
	redBalllabel.style.left = (toXYCoords(redBall.position).x + $("#canvas").offset().left + 10) + 'px';
	redBalllabel.innerHTML =
		Math.round(redBall.position.x) + ", " +
		Math.round(redBall.position.y) + ", " +
		Math.round(redBall.position.z);
	document.body.appendChild(redBalllabel);

	greenBalllabel.style.top = (toXYCoords(greenBall.position).y + $("#canvas").offset().top + 10)  + 'px';
	greenBalllabel.style.left = (toXYCoords(greenBall.position).x + $("#canvas").offset().left + 10) + 'px';
	greenBalllabel.innerHTML =
		Math.round(greenBall.position.x) + ", " +
		Math.round(greenBall.position.y) + ", " +
		Math.round(greenBall.position.z);
	document.body.appendChild(greenBalllabel);

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
      SELECTED.position.copy( intersection.sub( offset ) );
      lineGeom.vertices = [redBall.position, greenBall.position];
      lineGeom.verticesNeedUpdate = true;
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
		cameraControls.enabled = false;
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
	cameraControls.enabled = true;
	if ( INTERSECTED ) {
		SELECTED = null;
	}
	canvas.style.cursor = 'auto';
}

function toXYCoords (pos) {
  //var vector = projector.projectVector(pos.clone(), camera);
	var vector = pos.clone().project(camera);
	vector.x = (vector.x + 1)/2 * canvasWidth;
	vector.y = -(vector.y - 1)/2 * canvasHeight;
	//console.log(vector);
  return vector;
}


try {
  init();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
