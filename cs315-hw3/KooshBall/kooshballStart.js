////////////////////////////////////////////////////////////////////////////////
/*global THREE, document, window  */
var camera, scene, renderer;
var cameraControls;

var clock = new THREE.Clock();

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 500, 500 );

	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, -100, -400 );

	scene.add( light );
;

//grid xz
 var gridXZ = new THREE.GridHelper(2000, 100);
 gridXZ.setColors( new THREE.Color(0xCCCCCC), new THREE.Color(0x888888) );
 scene.add(gridXZ);

 //axes
 var axes = new THREE.AxisHelper(150);
 axes.position.y = 1;
 scene.add(axes);

 drawKooshBall();
}

function drawKooshBall() {
    // The cylinders' geometry.
    var cylinderGeo = new THREE.CylinderGeometry(3, 3, 500, 32);
    // Array of materials (i.e., colors) which can be randomly (or systematically) retrieved.
    var naturalLight = 0xffffff;
    var cylinderMaterials = [
        new THREE.MeshPhongMaterial(
            {
                color: '#6e007f', //purple
                specular: naturalLight,
                shininess: 100
            }),
        new THREE.MeshPhongMaterial(
            {
                color: '#01c3fe', //light blue
                specular: naturalLight,
                shininess: 100
            }),
        new THREE.MeshPhongMaterial(
            {
                color: '#990000', //red
                specular: naturalLight,
                shininess: 100
            })
    ];

    /* BEGIN CHANGES */

    // Get a random number between -1 and 1 so that we get all the way around
    function getRandomCoord() {
        return Math.random() * 2 - 1;
    }

    var i = 0;
    var total = 500;
    for (i; i < total; i++) {
        // Create the cylinder object using the geometry and material above.
        var cylinderMaterial = cylinderMaterials[i % cylinderMaterials.length];
        var cylinder = new THREE.Mesh(cylinderGeo, cylinderMaterial);
        // Generate random point and its antipodal point.
        var a = getRandomCoord();
        var b = getRandomCoord();
        var c = getRandomCoord();
        var maxCorner = new THREE.Vector3(a, b, c);
        var minCorner = new THREE.Vector3(-a, -b, -c);
        // Vector between diametrically opposite points.
        var cylAxis = new THREE.Vector3().subVectors(maxCorner, minCorner);
        // Normalized axis.
        cylAxis.normalize();
        // Angle calculated by taking arc-cos of the y axis.
        var theta = Math.acos(cylAxis.y);
        //Random rotational axis.
        var x = getRandomCoord();
        var y = getRandomCoord();
        var z = getRandomCoord();
        var rotationAxis = new THREE.Vector3(x, y, z);
        // Normalize axis for `makeRotationAxis`.
        rotationAxis.normalize();
        // Don't use position, rotation, scale.
        // We'll use the matrix property to rotate theta radians around the rotation axis:
        cylinder.matrixAutoUpdate = false;
        // This is how we manually set the rotation for the matrix.
        // makeRotationAxis() takes a vector representing a rotation axis and
        // a value (in radians) representing the angle around that axis to rotate.
        cylinder.matrix.makeRotationAxis(rotationAxis, theta);
        // We add the cylinder to the scene:
        scene.add(cylinder);
    }
    /* END CHANGES */
}

function init() {
	var canvasWidth = 600;
	var canvasHeight = 400;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0 );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );
	// CONTROLS
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.set( -800, 600, 500);
	cameraControls.target.set(0,0,0);
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
	renderer.render(scene, camera);
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
