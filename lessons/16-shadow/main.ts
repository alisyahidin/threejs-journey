import * as THREE from 'three';
import GUI from 'lil-gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Scene extends THREE.Scene {
  debugger: GUI = new GUI();
  camera: THREE.PerspectiveCamera = null;
  renderer: THREE.WebGLRenderer = null;
  orbitals: OrbitControls = null;
  lightDistance: number = 7;
  width = window.innerWidth;
  height = window.innerHeight;
  sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  sphereShadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  clock = new THREE.Clock()

  constructor(debug: boolean = true, addGridHelper: boolean = true) {
    super()

    // setup camera
    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, .1, 1000);
    this.camera.position.z = 12;
    this.camera.position.y = 12;
    this.camera.position.x = 12;

    // setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('canvas') as HTMLCanvasElement,
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.BasicShadowMap

    // add window resizing
    Scene.addWindowResizing(this.camera, this.renderer);

    // sets up the camera's orbital controls
    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbitals.enableDamping = true

    // Adds an origin-centered grid for visual reference
    if (addGridHelper) {
      this.add(new THREE.GridHelper(10, 10, 'red'));
    }

    // set the background color
    this.background = new THREE.Color(0x000);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.add(ambientLight)

    // Shadow light
    const light = new THREE.DirectionalLight(0xffffff, 0.3)
    light.position.set(2, 2, -1)
    light.castShadow = true
    light.shadow.mapSize.set(1024, 1024)
    light.shadow.camera.far = 14
    light.shadow.radius = 5
    this.add(light)

    const lightShadowHelper = new THREE.CameraHelper(light.shadow.camera)
    this.add(lightShadowHelper)

    const spotLight = new THREE.SpotLight(0xffffff, 0.3)
    spotLight.castShadow = true
    spotLight.position.set(0, 2, -2)
    spotLight.shadow.mapSize.set(1024 * 2, 1024 * 2)
    spotLight.shadow.camera.fov = 30
    spotLight.shadow.camera.far = 8
    this.add(spotLight)

    const spotLightHelper = new THREE.CameraHelper(spotLight.shadow.camera)
    this.add(spotLightHelper)

    const pointLight = new THREE.PointLight(0xffffff, 0.3)
    pointLight.position.set(-3, 3, 3)
    pointLight.castShadow = true
    pointLight.shadow.mapSize.set(1024, 1024)
    this.add(pointLight)

    const pointLightHelper = new THREE.CameraHelper(pointLight.shadow.camera)
    this.add(pointLightHelper)

    // Creates the geometry + materials
    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xf542d1, roughness: 0.4 })
    );
    this.sphere.position.y = 0.5;
    this.sphere.castShadow = true
    this.add(this.sphere);

    // Baked shadow
    const alphaMap = new THREE.TextureLoader().load('/texture/simple-shadow.jpg')

    this.sphereShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.7),
      new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap, transparent: true })
    )
    this.sphereShadow.rotation.x = -Math.PI * 0.5
    this.sphereShadow.position.y = 0.01
    this.add(this.sphereShadow)

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({ roughness: 0.4 })
    )
    plane.rotation.x = Math.PI * -0.5
    plane.receiveShadow = true
    this.add(plane)

    // setup Debugger
    if (debug) {
      const lightGroup = this.debugger.addFolder('Lights');
      lightGroup.add(ambientLight, 'intensity', 0, 1).name('Ambient intensity')
      lightGroup.add(light, 'intensity', 0, 1).name('Directional intensity')
      lightGroup.add(light.position, 'x', -4, 4)
      lightGroup.add(light.position, 'z', -4, 4)
      lightGroup.add(light.position, 'y', 0, 8)
      lightGroup.open();

      const lightShadowGroup = this.debugger.addFolder('Shadow');
      const directionalGroup = lightShadowGroup.addFolder('Directional light')
      directionalGroup.add(light, 'visible').name('Light')
      directionalGroup.add(lightShadowHelper, 'visible').name('helper')

      const spotlGroup = lightShadowGroup.addFolder('Spot light')
      spotlGroup.add(spotLight, 'visible').name('Light')
      spotlGroup.add(spotLightHelper, 'visible').name('helper')

      const pointGroup = lightShadowGroup.addFolder('Point light')
      pointGroup.add(pointLight, 'visible').name('Light')
      pointGroup.add(pointLightHelper, 'visible').name('helper')

      const params = {
        basic: true,
        pcf: false,
        pcfSoft: false,
        vsm: false,
      }
      const updateParams = (key: keyof typeof params) => {
        for (let i in params) {
          params[i as keyof typeof params] = false
        }
        params[key] = true
        switch (key) {
          case 'basic':
            this.renderer.shadowMap.type = THREE.BasicShadowMap
            break;
          case 'pcf':
            this.renderer.shadowMap.type = THREE.PCFShadowMap
            break;
          case 'pcfSoft':
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
            break;
          case 'vsm':
            this.renderer.shadowMap.type = THREE.VSMShadowMap
            break;
        }
        this.sphere.material.needsUpdate = true
        plane.material.needsUpdate = true
      }
      lightShadowGroup.add(params, 'basic').name('BasicShadowMap').listen().onChange(() => updateParams('basic'))
      lightShadowGroup.add(params, 'pcf').name('PCFShadowMap').listen().onChange(() => updateParams('pcf'))
      lightShadowGroup.add(params, 'pcfSoft').name('PCFSoftShadowMap').listen().onChange(() => updateParams('pcfSoft'))
      lightShadowGroup.add(params, 'vsm').name('VSMShadowMap').listen().onChange(() => updateParams('vsm'))
      lightShadowGroup.add(light.shadow, 'radius', 0, 7)


      const meshGroup = this.debugger.addFolder('Objects');
      meshGroup.add(this.sphere.position, 'x', -2, 2).name('Sphere X')
      meshGroup.add(this.sphere.position, 'z', -2, 2).name('Sphere Z')
      meshGroup.add(this.sphere.position, 'y', -2, 2).name('Sphere Y')
      meshGroup.close();

      // Add camera to debugger
      const cameraGroup = this.debugger.addFolder('Camera');
      cameraGroup.add(this.camera, 'fov', 20, 80);
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.close();
    }
  }

  animate() {
    const elapsedTime = this.clock.getElapsedTime()
    this.sphere.position.x = Math.cos(elapsedTime) * 2
    this.sphere.position.z = Math.sin(elapsedTime) * 2
    this.sphere.position.y = (Math.abs(Math.sin(elapsedTime * 3))) + 0.5

    this.sphereShadow.position.x = this.sphere.position.x
    this.sphereShadow.position.z = this.sphere.position.z
    this.sphereShadow.material.opacity = (1 - this.sphere.position.y) * 0.7
  }

  static addWindowResizing(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) {
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
  }
}

const scene = new Scene();

function loop() {
  scene.camera.updateProjectionMatrix();
  scene.orbitals.update()
  scene.renderer.render(scene, scene.camera);
  scene.animate()
  requestAnimationFrame(loop);
}

loop()