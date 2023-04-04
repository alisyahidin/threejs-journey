import * as THREE from 'three';
import GUI from 'lil-gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

class Scene extends THREE.Scene {
  debugger: GUI = new GUI();
  camera: THREE.PerspectiveCamera = null;
  renderer: THREE.WebGLRenderer = null;
  orbitals: OrbitControls = null;
  lights = {
    ambient: new THREE.AmbientLight(0xffffff, 0.5),
    directional: new THREE.DirectionalLight(0x00ffc, 0.5),
    hemisphere: new THREE.HemisphereLight(0xff0000, 0x00ff00, 0.3),
    point: new THREE.PointLight(0xfbff00, 0.5),
    reactarea: new THREE.RectAreaLight(0xbfff80, 2, 1, 1),
    spotlight: new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1),
  };
  lightCount: number = 0;
  lightDistance: number = 7;
  width = window.innerWidth;
  height = window.innerHeight;
  cube: THREE.Mesh;
  donut: THREE.Mesh;
  plane: THREE.Mesh;
  shpere: THREE.Mesh;

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

    // add window resizing
    Scene.addWindowResizing(this.camera, this.renderer);

    // sets up the camera's orbital controls
    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbitals.enableDamping = true

    // Adds an origin-centered grid for visual reference
    if (addGridHelper) {
      this.add(new THREE.GridHelper(10, 10, 'red'));
      this.add(new THREE.AxesHelper(3))
    }

    // set the background color
    this.background = new THREE.Color(0x000);

    // Creates the geometry + materials
    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.4
    material.flatShading = true

    this.cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    this.cube.position.y = 1;
    this.add(this.cube);

    this.shpere = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), material);
    this.shpere.position.y = 1.5;
    this.shpere.position.x = -2;
    this.add(this.shpere);

    this.donut = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.2, 16, 32), material);
    this.donut.position.y = 1;
    this.donut.position.x = 2;
    this.add(this.donut);

    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), material);
    this.plane.rotateX(-Math.PI * 0.5)
    this.add(this.plane);

    this.lights.directional.position.set(-0.5, 0.8, 0)
    this.lights.point.position.set(-2, 0.2, 1)
    this.lights.reactarea.position.set(2, 1, 1)
    this.lights.reactarea.lookAt(new THREE.Vector3())
    this.lights.spotlight.position.set(1, 4, 4)
    Object.values(this.lights).forEach(light => {
      this.add(light)
    })

    const pointLightHelper = new THREE.PointLightHelper(this.lights.point, 0.2)
    this.add(pointLightHelper)

    const direactionalLightHelper = new THREE.DirectionalLightHelper(this.lights.directional, 0.2)
    this.add(direactionalLightHelper)

    const spotLightHelper = new THREE.SpotLightHelper(this.lights.spotlight, 0.2)
    this.add(spotLightHelper)

    const reactareaLightHelper = new RectAreaLightHelper(this.lights.reactarea, 0.2)
    this.add(reactareaLightHelper)

    // setup Debugger
    if (debug) {
      // Add camera to debugger
      const cameraGroup = this.debugger.addFolder('Camera');
      cameraGroup.add(this.camera, 'fov', 20, 80);
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.close();

      const params: Record<keyof typeof this.lights, { color: number, groundColor?: number }> = {
        ambient: { color: this.lights.ambient.color.getHex() },
        directional: { color: this.lights.directional.color.getHex() },
        hemisphere: { color: this.lights.hemisphere.color.getHex(), groundColor: this.lights.hemisphere.groundColor.getHex() },
        point: { color: this.lights.point.color.getHex() },
        reactarea: { color: this.lights.reactarea.color.getHex() },
        spotlight: { color: this.lights.spotlight.color.getHex() },
      }
      Object.keys(this.lights).forEach((lightType: keyof typeof this.lights) => {
        const lightGroup = this.debugger.addFolder(lightType[0].toLocaleUpperCase() + lightType.substring(1));
        lightGroup.add(this.lights[lightType], 'visible');
        lightGroup
          .addColor(params[lightType], 'color')
          .onChange(() => {
            this.lights[lightType].color.set(params[lightType].color)
          })
        if (params[lightType].hasOwnProperty('groundColor')) {
          lightGroup
            .addColor(params[lightType], 'groundColor')
            .onChange(() => {
              (this.lights[lightType] as THREE.HemisphereLight).groundColor.set(params[lightType].color)
            })
        }
        lightGroup.add(this.lights[lightType], 'intensity', 0, 1);
        lightGroup.open();
      })
    }
  }

  animate() {
    this.shpere.rotation.x += 0.01;
    this.shpere.rotation.y += 0.01;
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.donut.rotation.x += 0.01;
    this.donut.rotation.y += 0.01;
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