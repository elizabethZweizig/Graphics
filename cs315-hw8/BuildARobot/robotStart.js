////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window  */
var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var keyBoard = new KeyboardState();

function fillScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.CubeTextureLoader()
        .setPath('../../images/airport/')
        .load([
            'sky-xpos.png',
            'sky-xneg.png',
            'sky-ypos.png',
            'sky-yneg.png',
            'sky-zpos.png',
            'sky-zneg.png'
        ]);
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    scene.add(new THREE.AmbientLight(0x222222));
    light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(200, 500, 500);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(-200, -100, -400);
    scene.add(light);
    gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
    scene.add(gridXZ);
    axes = new THREE.AxisHelper(150);
    axes.position.y = 1;
    scene.add(axes);
    drawRobot();
}

function createGUI() {
    gui = new dat.GUI({
        autoPlace: false
    });
    params = {
        swivel: 0,
        bend: 0,
        grab: 0
    };
    gui.add(params, 'swivel').min(-180).max(180).step(10).name('Swivel');
    gui.add(params, 'bend').min(-90).max(90).step(5).name('Bend');
    gui.add(params, 'grab').min(0).max(30).step(1).name('Grab');
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
}

function drawRobot() {

	//////////////////////////////
	// MATERIALS
	// Basic Material
	var basicMaterial = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
			color: 0xff0000,
			emissive: 0xff0000,
			emissiveIntensity: 5,
			emissiveMap: scene.background,
			envMap: scene.background,
			wireframe: false
	});

	// Metal Material
	var metalMaterial = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
			color: 0xF022CB
	});

	// Matte Material
	var matteMaterial = new THREE.MeshLambertMaterial({
			side: THREE.DoubleSide,
			color: 0x8D4BC5
	});

	// Glass Material
	var glassMaterial = new THREE.MeshPhongMaterial({
			color: 0x39105C,
			shininess: 100,
			transparent: true,
			opacity: 0.4,
			envMap: scene.background,
			combine: THREE.MixOperation,
			reflectivity: 0.8
	})

	var pupilMaterial = new THREE.MeshPhongMaterial({
			color: 0x000000,
			shininess: 100,
			transparent: false,
			envMap: scene.background,
			combine: THREE.MixOperation,
			reflectivity: 0.8
	})

  var options = {
		amount: 10,
		bevelThickness: 2,
		bevelSize: 1,
		bevelSegments: 3,
		bevelEnabled: true,
		curveSegments: 12,
		steps: 1,
		material: eyeMaterial
	};

	var cylinder;
	var leg;

	// MODELS

 //body
	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 45, 45, 150, 32 ), metalMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 225;
	cylinder.position.z = 0;
	scene.add( cylinder );

	// legs
	var upperleg, lowerleg, upperlegGeometry, lowerlegGeometry, legMaterial;
	upperlegGeometry = new THREE.CylinderGeometry(15, 12, 100, 16, 16);
	lowerlegGeometry = new THREE.CylinderGeometry(12, 5, 100, 16, 16);
	legMaterial = matteMaterial;
	upperleg = new THREE.Mesh(upperlegGeometry, legMaterial);
	lowerleg = new THREE.Mesh(lowerlegGeometry, legMaterial);
	var upperleftLeg, upperrightLeg, lowerleftLeg, lowerrightLeg;
	upperleftLeg = upperleg.clone();
	upperrightLeg = upperleg.clone();
	lowerleftLeg = lowerleg.clone();
	lowerrightLeg = lowerleg.clone();
  upperleftLeg.position.x = 0;
	upperleftLeg.position.y = -50;
	upperleftLeg.position.z = 0;
	scene.add(upperleftLeg);
  upperrightLeg.position.x = 0;
	upperrightLeg.position.y = -50;
	upperrightLeg.position.z = 0;
	scene.add(upperrightLeg);
  lowerleftLeg.position.x = 0;
	lowerleftLeg.position.y = -150;
	lowerleftLeg.position.z = 0;
	scene.add(lowerleftLeg);
  lowerleftLeg.position.x = 0;
	lowerrightLeg.position.y = -150;
	lowerrightLeg.position.z = 0;
	scene.add(lowerrightLeg);

	// The feet
	var footLength = 40;
	var footWidth = 20;
	var footShape = new THREE.Shape();
	footShape.moveTo(0, 0);
	footShape.lineTo(0, footWidth);
	footShape.lineTo(footLength, footWidth);
	footShape.lineTo(footLength, 0);
	footShape.lineTo(0, 0);
	var extrudeSettings = {
			steps: 2,
			amount: 10,
			bevelEnabled: true,
			bevelThickness: 3,
			bevelSize: 5,
			bevelSegments: 1
	};
	var geometry = new THREE.ExtrudeGeometry(footShape, extrudeSettings);
	var material = metalMaterial;
	var foot = new THREE.Mesh(geometry, material);
	foot.rotateX(Math.PI / 2);
	var leftFoot = foot.clone();
	leftFoot.position.x = 0;
	leftFoot.position.y = -200;
	leftFoot.position.z = 0;
	var rightFoot = foot.clone();
	rightFoot.position.x = 0;
	rightFoot.position.y = -200;
	rightFoot.position.z = 0;
	scene.add(leftFoot);
	scene.add(rightFoot);

	// The neck
	var neckCylinder, neckCylinderGeometry, neckCylinderMaterial;
	neckCylinderGeometry = new THREE.CylinderGeometry(15, 15, 25, 16, 16);
	neckCylinderMaterial = matteMaterial;
	neckCylinder = new THREE.Mesh(neckCylinderGeometry, neckCylinderMaterial);
	neckCylinder.position.x = 0;
	neckCylinder.position.y = 315;
	neckCylinder.position.z = 0;
	scene.add(neckCylinder);

	//Head
	var headBox, headBoxGeometry, headBoxMaterial;
	headBoxGeometry = new THREE.BoxGeometry(60, 60, 60);
	headBoxMaterial = metalMaterial;
	headBox = new THREE.Mesh(headBoxGeometry, headBoxMaterial);
	headBox.position.x = 0;
	headBox.position.y = 0;
	headBox.position.z = 0;
	scene.add(headBox);

	//eyes
	var eye, eyeGeometry, eyeMaterial;
	eyeGeometry = new THREE.SphereGeometry(8, 16, 16);
	eyeMaterial = glassMaterial;
	eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
	var leftEye, rightEye;
	leftEye = eye.clone();
	rightEye = eye.clone();
	leftEye.position.x = 30;
	leftEye.position.y = 10;
	leftEye.position.z = -15;
	rightEye.position.x = 30;
	rightEye.position.y = 10;
	rightEye.position.z = 15;
	scene.add(leftEye);
	scene.add(rightEye);

	//pupil
	var pupil, pupilGeometry, pMaterial;
	pupilGeometry = new THREE.SphereGeometry(4, 16, 16);
	pMaterial = pupilMaterial;
	pupil = new THREE.Mesh(pupilGeometry, pMaterial);
	var leftpupil, rightpupil;
	leftpupil = pupil.clone();
	rightpupil = pupil.clone();
	leftpupil.position.x = 30;
	leftpupil.position.y = 10;
	leftpupil.position.z = -15;
	rightpupil.position.x = 30;
	rightpupil.position.y = 10;
	rightpupil.position.z = 15;
	scene.add(leftpupil);
	scene.add(rightpupil);

//arms
	leftArmConnector = new THREE.Mesh(
		new THREE.TorusGeometry(15, 10, 10, 10, 2 * Math.PI), matteMaterial);
	leftArmConnector.position.x = 0;
	leftArmConnector.position.y = 265;
	leftArmConnector.position.z = -45;
	scene.add( leftArmConnector );

	rightArmConnector = new THREE.Mesh(
		new THREE.TorusGeometry(15, 10, 10, 10, 2 * Math.PI), matteMaterial);
	rightArmConnector.position.x = 0;
	rightArmConnector.position.y = 265;
	rightArmConnector.position.z = 45;
	scene.add( rightArmConnector );

	rightShoulder = new THREE.Mesh(
		new THREE.CylinderGeometry(15, 15, 30, 20, 1, false), matteMaterial);
	rightShoulder.position.x = 0;
	rightShoulder.position.y = 265;
	rightShoulder.position.z = 0;
	scene.add( rightShoulder );

	leftShoulder = new THREE.Mesh(
		new THREE.CylinderGeometry(15, 15, 30, 20, 1, false), matteMaterial);
	leftShoulder.position.x = 0;
	leftShoulder.position.y = 265;
	leftShoulder.position.z = 0;
	scene.add( leftShoulder );

	rightHumerus = new THREE.Mesh(
		new THREE.CylinderGeometry(10, 10, 80, 20, 1, false), metalMaterial);
	rightHumerus.position.x = 0;
	rightHumerus.position.y = 230;
	rightHumerus.position.z = 0;
	scene.add( rightHumerus );

	leftHumerus = new THREE.Mesh(
		new THREE.CylinderGeometry(10, 10, 80, 20, 1, false), metalMaterial);
	leftHumerus.position.x = 0;
	leftHumerus.position.y = 230;
	leftHumerus.position.z = 0;
	scene.add( leftHumerus );

	leftElbow = new THREE.Mesh(
		new THREE.CylinderGeometry(15, 15, 15, 15, 1, false), matteMaterial);
	leftElbow.position.x = 0;
	leftElbow.position.y = 0;
	leftElbow.position.z = 0;
	leftElbow.rotation.y = Math.PI/2;
	leftElbow.rotation.z = Math.PI/2;
	scene.add( leftElbow );

	rightElbow = new THREE.Mesh(
		new THREE.CylinderGeometry(15, 15, 15, 15, 1, false), matteMaterial);
	rightElbow.position.x = 0;
	rightElbow.position.y = 0;
	rightElbow.position.z = 0;
	rightElbow.rotation.y = Math.PI/2;
	rightElbow.rotation.z = Math.PI/2;
	scene.add( rightElbow );

	rightForarm = new THREE.Mesh(
		new THREE.CylinderGeometry(10, 7, 40, 20, 1, false), metalMaterial);
	rightForarm.position.x = 0;
	rightForarm.position.y = -30;
	rightForarm.position.z = 0;
	scene.add( rightForarm );

	leftForarm = new THREE.Mesh(
		new THREE.CylinderGeometry(10, 7, 40, 20, 1, false), metalMaterial);
	leftForarm.position.x = 0;
	leftForarm.position.y = -30;
	leftForarm.position.z = 0;
	scene.add( leftForarm );

	rightWrist = new THREE.Mesh(
		new THREE.CylinderGeometry(10, 10, 10, 10, 1, false), matteMaterial);
	rightWrist.position.x = 0;
	rightWrist.position.y = 175;
	rightWrist.position.z = 0;
	rightWrist.rotation.y = Math.PI/2;
	rightWrist.rotation.z = Math.PI/2;
	scene.add( rightWrist );

	leftWrist = new THREE.Mesh(
		new THREE.CylinderGeometry(10, 10, 10, 10, 1, false), matteMaterial);
	leftWrist.position.x = 0;
	leftWrist.position.y = -70;
	leftWrist.position.z = 0;
	leftWrist.rotation.y = Math.PI/2;
	leftWrist.rotation.z = Math.PI/2;
	scene.add( leftWrist );

  rightUpperClaw = new THREE.Mesh(
    new THREE.ExtrudeGeometry(drawClaw(), options));
  rightUpperClaw.position.x = 5;
  rightUpperClaw.position.y = 170;
  rightUpperClaw.position.z = 0;
  rightUpperClaw.rotation.y = Math.PI;
  rightUpperClaw.rotation.z = Math.PI * 1.5;
  rightUpperClaw.material = pupilMaterial;
  scene.add( rightUpperClaw );

  leftUpperClaw = new THREE.Mesh(
   new THREE.ExtrudeGeometry(drawClaw(), options));
  leftUpperClaw.position.x = -5;
  leftUpperClaw.position.y = -60;
  leftUpperClaw.position.z = 0;
  leftUpperClaw.rotation.y = Math.PI;
  leftUpperClaw.rotation.z = Math.PI * 1.5;
  leftUpperClaw.material = pupilMaterial;
  scene.add( leftUpperClaw );


  rightLowerClaw = new THREE.Mesh(
    new THREE.ExtrudeGeometry(drawClaw(), options));
  rightLowerClaw.position.x = 5;
  rightLowerClaw.position.y = 170;
  rightLowerClaw.position.z = 0;
  //rightLowerClaw.rotation.y = Math.PI;
  rightLowerClaw.rotation.z = Math.PI * 1.5;
  rightLowerClaw.material = pupilMaterial;
  scene.add( rightLowerClaw );

  leftLowerClaw = new THREE.Mesh(
    new THREE.ExtrudeGeometry(drawClaw(), options));
  leftLowerClaw.position.x = -5;
  leftLowerClaw.position.y = -60;
  leftLowerClaw.position.z = 0;
  leftLowerClaw.rotation.z = Math.PI * 1.5;
  leftLowerClaw.material = pupilMaterial;
  scene.add( leftLowerClaw );


// //
// // Assembling
// //
leftRobotClaw = new THREE.Group()
    .add(leftLowerClaw)
    .add(leftUpperClaw)
    .add(leftWrist);
rightRobotClaw = new THREE.Group()
    .add(rightLowerClaw)
    .add(rightUpperClaw)
    .add(rightWrist);

leftRobotForearm = new THREE.Group()
    .add(leftRobotClaw)
    .add(leftForarm)
    .add(leftElbow);
rightRobotForearm = new THREE.Group()
    .add(rightRobotClaw)
    .add(rightForarm)
    .add(rightElbow);
leftRobotArm = new THREE.Group()
    .add(leftRobotForearm)
    .add(leftHumerus)
    .add(leftShoulder);
rightRobotArm = new THREE.Group()
    .add(rightRobotForearm)
    .add(rightHumerus)
    .add(rightShoulder);

robotEyes = new THREE.Group()
    .add(leftEye)
    .add(rightEye)
    .add(leftpupil)
    .add(rightpupil);
robotHead = new THREE.Group()
    .add(headBox)
    .add(robotEyes);
robotBody = new THREE.Group()
    .add(neckCylinder)
    .add(cylinder)
    .add(leftArmConnector)
    .add(rightArmConnector);

robotLeftLeg = new THREE.Group()
    .add(upperleftLeg)
    .add(lowerleftLeg)
    .add(leftFoot);
robotRightLeg = new THREE.Group()
    .add(upperrightLeg)
    .add(lowerrightLeg)
    .add(rightFoot);

robot = new THREE.Group()
  .add(robotHead)
  .add(robotBody)
  .add(robotLeftLeg)
  .add(robotRightLeg)
  .add(leftRobotArm)
  .add(rightRobotArm);

  innerGroup = new THREE.Group().add(robot);
  outerGroup = new THREE.Group().add(innerGroup);
  robotLeftLeg.position.set(0,150,-25);
  robotRightLeg.position.set(0,150,25);
  leftRobotClaw.position.set(0, 20, 0);
  rightRobotClaw.position.set(0,-230,0);
  leftRobotForearm.position.set(0,200,0);
  leftRobotArm.position.set(0,0,-60);
  rightRobotArm.position.set(0,0,60);
  rightRobotForearm.position.set(0,200,0);
  robotHead.position.set(0,355,0);
  robot.position.set(0,0,0);


scene.add(outerGroup);
}

function drawClaw() {
	var claw = new THREE.Shape();
	claw.moveTo(10, 10); // starting point
	claw.bezierCurveTo(20, 35, 50, 35, 60, 10);
	claw.bezierCurveTo(50, 20, 20, 20, 10, 10);
	return claw;
}


function animate() {
    // Sliders
    leftRobotArm.rotation.y = (params.swivel * Math.PI / 180);
    rightRobotArm.rotation.y = (params.swivel * Math.PI / 180);
    leftRobotForearm.rotation.z = (params.bend * Math.PI / 180);
    rightRobotForearm.rotation.z = (params.bend * Math.PI / 180);
    rightUpperClaw.rotation.z = (-70 * Math.PI / 180) - (params.grab * Math.PI / 180);
    rightLowerClaw.rotation.z = (-70 * Math.PI / 180) - (params.grab * Math.PI / 180);
    leftUpperClaw.rotation.z = (-70 * Math.PI / 180) - (params.grab * Math.PI / 180);
    leftLowerClaw.rotation.z = (-70 * Math.PI / 180) - (params.grab * Math.PI / 180);



    // Keyboard Movement
    keyBoard.update();

    // Movement Constants
    var moveSpeed = 5;
    var eyeSpeed = 0.1;

    var rotateSpeed = 2.5;
    rotateSpeed *= Math.PI / 180;
    // Forward vector
    var forward = new THREE.Vector3(1, 0, 0);
    forward.applyQuaternion(innerGroup.quaternion).normalize();
    // Moving Forward
    if (keyBoard.pressed("W")) {
        outerGroup.translateOnAxis(forward, moveSpeed);
    }
    // Moving Back
    if (keyBoard.pressed("S")) {
        outerGroup.translateOnAxis(forward.multiplyScalar(-1), moveSpeed);
    }
    // Rotate Left
    if (keyBoard.pressed("A")) {
        outerGroup.rotateY(rotateSpeed);
    }
    // Rotate Right
    if (keyBoard.pressed("D")) {
        outerGroup.rotateY(-rotateSpeed);
    }
    // Move Legs
    if (keyBoard.pressed("W") || keyBoard.pressed("A") || keyBoard.pressed("S") || keyBoard.pressed("D")) {
        moveLegs();
    }
    robotHead.rotateOnAxis (forward,eyeSpeed);
    window.requestAnimationFrame(animate);
    render();
}
var cycle = 0;

function moveLegs(){
  cycle = cycle == 360 ? 1 : ++cycle;
	cycle += 1;
  robotLeftLeg.rotation.z = Math.cos(cycle * (Math.PI/180));
	robotRightLeg.rotation.z = Math.cos(cycle * (Math.PI/180) + Math.PI);
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
	camera.position.set( -800, 600, -500);
	cameraControls.target.set(4,301,92);
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);

}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	renderer.render(scene, camera);
}

try {
  init();
  createGUI();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
