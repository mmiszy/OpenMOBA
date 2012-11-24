/*global THREE: false */
/*jslint es5: true, nomen: true, vars: true, browser: true */
var scene;
var object;
var projector;
var camera;
var cube;

var player = {
	state : 'idle',
	target : {
		x : 0,
		z : 0
	},	
	move : function (mapX, mapZ) {
		cube.position.x = mapX;
		cube.position.z = mapZ;
		player.state = 'moving';
		
		player.target.x = mapX;
		player.target.z = mapZ;
	}
};



function normalisedMouseToPlane (mouseX, mouseY) {
	var
		startVector = new THREE.Vector3(),
		endVector = new THREE.Vector3(),
		dirVector = new THREE.Vector3(),
		goalVector = new THREE.Vector3(),
		t;

	startVector.set(mouseX, mouseY, -1.0);
	endVector.set(mouseX, mouseY, 1.0);

	// Convert back to 3D world coordinates
	startVector = projector.unprojectVector(startVector, camera);
	endVector = projector.unprojectVector(endVector, camera);

	// Get direction from startVector to endVector
	dirVector.sub(endVector, startVector);
	dirVector.normalize();

	// Find intersection where y = 0
	t = startVector.y / - (dirVector.y);

	// Find goal point
	goalVector.set(startVector.x + t * dirVector.x,
					startVector.y + t * dirVector.y,
					startVector.z + t * dirVector.z);
	return goalVector;
}

window.addEventListener("load", function () {
	"use strict";

	// Keyboard input
	var keyboard = new THREEx.KeyboardState();

	// Scene
	scene = new THREE.Scene();
	objectManager.setScene(scene);
	
	// Camera
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 15;
	camera.position.y = 20;
	camera.rotation.x = -1.0;
	scene.add(camera);
	
	// point-and-click
	projector = new THREE.Projector();
	
	// Renderer
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Cube (currently used as a waypoint)
	var
		geometry = new THREE.CubeGeometry(1, 1, 1),
		material = new THREE.MeshPhongMaterial({color: 0xaaaaaa}),
		blueMaterial = new THREE.MeshPhongMaterial({color: 0x5555FF});
		
	cube = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
	cube.position.y += 1;
	cube.position.x += 5;
	cube.name = 'cube';
	scene.add(cube);
	
	// Second cube (possible to lift up to the air)
	var pickerGeometry = new THREE.CubeGeometry(1, 1, 1);
	pickerGeometry.computeCentroids();
	var picker = new THREE.Mesh(geometry, blueMaterial);
	picker.position.y += 1;
	picker.position.x += 5;
	picker.name = 'picker';
	scene.add(picker);
	
	// Grass Plane
	var 
		planeGeometry = new THREE.CubeGeometry(20, 0.1, 20),
		planeMap = THREE.ImageUtils.loadTexture("textures/grass.jpg"),
		planeMaterial = new THREE.MeshLambertMaterial({map: planeMap }),
		plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.name = 'plane';
	scene.add(plane);
	
	// Block of flats
	var
		jsloader = new THREE.JSONLoader(),
		mesh;
		
	objectManager.onAllLoaded(function () { console.log(arguments); });
	objectManager.addObject("blok", "models/Blok/Blok.json");
	objectManager.addObject("blok2", "models/Blok/Blok.json");
	console.log (objectManager);
	//objectManager.getByName("blok").position.x += 30;
	/*	
    jsloader.load(
		"models/Blok/Blok.json",
		function(geometry, materials) {
			//console.log(geometry);
			//console.log(materials);
			//mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({overdraw:true}));
			mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
			//var mesh = new THREE.Mesh(geometry, blueMaterial);
			//mesh.position.x += 50;
			scene.add(mesh);
			
			mesh.position.x += 30;
			mesh.scale.x = 0.5;
			mesh.scale.y = 0.5;
			mesh.scale.z = 0.5;
		}
	);*/
	
	jsloader.load(
		"models/TV.json",
		function (geometry, materials) {
			object = new THREE.Mesh(geometry, blueMaterial);
			scene.add(object);
			object.position.y = 0;
			object.scale.x = 2;
			object.scale.y = 2;
			object.scale.z = 2;
			object.name = 'mech';
		}
	);

	// Lights
	var pointLight1 = new THREE.PointLight(0xaaFFaa);
	pointLight1.position.x = 130;
	pointLight1.position.y = 50;
	pointLight1.position.z = 10;
	scene.add(pointLight1);
	var pointLight2 = new THREE.PointLight(0xFFaaaa);
	pointLight2.position.x = 10;
	pointLight2.position.y = 50;
	pointLight2.position.z = 130;
	scene.add(pointLight2);
	var pointLight2 = new THREE.PointLight(0xaaaaFF);
	pointLight2.position.x = 130;
	pointLight2.position.y = 50;
	pointLight2.position.z = 130;
	scene.add(pointLight2);

	var prevTime = Date.now();
	var curTime = Date.now();

	function render () {
		stats.begin();
		if (curTime - prevTime  > 16) {
			//controls.update(); 	
			while (curTime - prevTime  > 16) {
				checkKeyboard();
				updatePlayer();
				cube.rotation.x += 0.05;
				cube.rotation.y += 0.05;
				prevTime += 16;
			}
			renderer.render(scene, camera);
			stats.end();
		}
		curTime = Date.now();
		requestAnimationFrame(render, renderer.domElement);
	} 
	
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	function checkKeyboard(event) {
		if (keyboard.pressed("W")) {
			camera.position.z -= 0.5;
		}
		if (keyboard.pressed("S")) {
			camera.position.z += 0.5;
		}
		if (keyboard.pressed("A")) {
			camera.position.x -= 0.5;
		}
		if (keyboard.pressed("D")) {
			camera.position.x += 0.5;
		}
	}
	
	function updatePlayer() {
		if (player.state === 'moving') {
			var dir = direction(object.position, player.target);
			object.rotation.y = -dir;
			object.position.x += Math.cos(dir) * 0.2;
			object.position.z += Math.sin(dir) * 0.2;
			
			if (distance(object.position, player.target) <= 1)
			{
				player.state = 'idle';
				cube.position.x = 10000;
				cube.position.z = 10000;
			}
		}
	}
	
	function testForPicking(x, y) { 
		var vector = new THREE.Vector3(x, y, 1);
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray(camera.position, vector.subSelf( camera.position ).normalize());
		var intersects = ray.intersectObjects(scene.children, true);

		if (intersects.length > 0) {
			var target = intersects[0].object;
			if (target.name === 'picker')
				target.position.y += 0.5;
			/*if ( INTERSECTED != intersects[ 0 ].object ) {
				if ( INTERSECTED )
					INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
				INTERSECTED.material.emissive.setHex( 0xff0000 );
			}*/
			console.log("HIT! " + target.name);
			return true;
		} 
		else {
			console.log("missed");
			/*
			if ( INTERSECTED )
				INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

			INTERSECTED = null;
			*/
			return false;
		}
	}
	
	function onMouseDown(event) {
		var x = event.clientX;
		var y = event.clientY;
		
		x = (x / window.innerWidth) * 2 - 1;
		y = 1 - (y / window.innerHeight) * 2;
		
		var hitSomething = testForPicking(x, y);
		
		if (!hitSomething)
		{
			var planeTarget = normalisedMouseToPlane(x, y);
			player.move(planeTarget.x, planeTarget.z);
		}
	}
			
	window.addEventListener('resize', onWindowResize);
	window.addEventListener('mousedown', onMouseDown);
	// Uncomment that to turn on fullscreen
	/*window.addEventListener('click', function onWindowClick () {```
		if (THREEx.FullScreen.activated()) {
		    window.removeEventListener('click', onWindowClick);
		} else {
		    //THREEx.FullScreen.request();
		}
	});*/

	var stats = new Stats();
	stats.setMode(0); // 0: fps, 1: ms
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.body.appendChild(stats.domElement);
	render();
});