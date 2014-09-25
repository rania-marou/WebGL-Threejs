(function() {
  window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
      return window.setTimeout(callback, 1000 / 60);
    };
  })();
  $(function() {
    var animate, camera, geometry, init, mesh, render, renderer, scene;
    camera = null;
    scene = null;
    geometry = null;
    mesh = null;
    renderer = null;
    init = function() {
      var material;
      camera = new THREE.Camera(75, 1, 1, 10000);
      camera.position.z = 500;
      scene = new THREE.Scene();
      geometry = new THREE.CubeGeometry(300, 300, 300);
      material = new THREE.MeshBasicMaterial({
        color: 0xFF5B99,
        wireframe: true
      });
      mesh = new THREE.Mesh(geometry, material);
      scene.addObject(mesh);

      geometry2 = new THREE.CubeGeometry(150, 150, 150);
      material2 = new THREE.MeshBasicMaterial({
        color: 0x99cc00, 
        wireframe: true
      });
      mesh2 = new THREE.Mesh(geometry2, material2);
      scene.addObject(mesh2);

      geometry3 = new THREE.CubeGeometry(200, 200, 200);
      material3 = new THREE.MeshBasicMaterial({
        color: 0xFDA300, 
        wireframe: true
      });
      mesh3 = new THREE.Mesh(geometry3, material3);
      scene.addObject(mesh3);

      renderer = new THREE.CanvasRenderer();
      renderer.setSize(300, 300);
      return $('#three').find('h3').first().after(renderer.domElement);
    };
    animate = function() {
      requestAnimationFrame(animate);
      return render();
    };
    render = function() {
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.02;
      
      mesh2.rotation.x += 0.01;
      mesh2.rotation.y += 0.03;

      mesh3.rotation.x += 0.03;
      mesh3.rotation.y += 0.01;
      return renderer.render(scene, camera);
    };
    init();
    return animate();
  });
}).call(this);
