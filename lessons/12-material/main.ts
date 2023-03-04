// https://github.com/nidorx/matcaps

import * as THREE from 'three';
import GUI from 'lil-gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Scene extends THREE.Scene {
  debugger: GUI = null;
  camera: THREE.PerspectiveCamera = null;
  renderer: THREE.WebGLRenderer = null;
  orbitals: OrbitControls = null;
  lights: Array<THREE.Light> = [];
  lightCount: number = 1;
  lightDistance: number = 7;
  width = window.innerWidth;
  height = window.innerHeight;
  clock: THREE.Clock = new THREE.Clock()
  sphere: THREE.Mesh;
  plane: THREE.Mesh;
  donut: THREE.Mesh;
  material: THREE.MeshToonMaterial | THREE.MeshBasicMaterial | THREE.MeshNormalMaterial | THREE.MeshMatcapMaterial | THREE.MeshDepthMaterial | THREE.MeshPhongMaterial;
  textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
  cubeTextureLoader: THREE.CubeTextureLoader = new THREE.CubeTextureLoader()

  constructor(debug: boolean = true, addGridHelper: boolean = true) {
    super()

    // setup camera
    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, .1, 1000);
    this.camera.position.z = 5;
    this.camera.position.y = 5;
    this.camera.position.x = 5;

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
    this.background = new THREE.Color(0xefefef);

    // create the lights
    for (let i = 0; i < this.lightCount; i++) {
      // Positions evenly in a circle pointed at the origin
      const light = new THREE.PointLight(0xffffff, 1);
      let lightX = this.lightDistance * Math.sin(Math.PI * 2 / this.lightCount * i);
      let lightZ = this.lightDistance * Math.cos(Math.PI * 2 / this.lightCount * i);

      // Create a light
      light.position.set(lightX, this.lightDistance / 2, lightZ)
      light.lookAt(0, 0, 0)

      this.add(light);

      this.lights.push(light);
      // Visual helpers to indicate light positions
      this.add(new THREE.PointLightHelper(light, .5, 0xff9900));
    }

    this.useBasicMaterial()

    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 128, 128),
      this.material
    )
    this.sphere.position.x = -1.5;
    this.sphere.position.y = 1;

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 128, 128),
      this.material
    )
    this.plane.position.y = 1;

    this.donut = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 64, 128),
      this.material
    )
    this.donut.position.x = 1.5;
    this.donut.position.y = 1;

    this.add(this.sphere, this.plane, this.donut);

    // setup Debugger
    if (debug) {
      this.debugger = new GUI();
      const lightGroup = this.debugger.addFolder('Lights');
      for (let i = 0; i < this.lights.length; i++) {
        lightGroup.add(this.lights[i], 'visible');
      }
      lightGroup.close();

      // Add camera to debugger
      const cameraGroup = this.debugger.addFolder('Camera');
      cameraGroup.add(this.camera, 'fov', 20, 80);
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.close();

      // Add material to debugger
      // Material side controller
      const materialType = {
        basic: true,
        normal: false,
        matcap: false,
        depth: false,
        pong: false,
        toon: false,
        standard: false,
        environment: false,
      }
      const updateMaterialType = (key: keyof typeof materialType) => {
        for (let i in materialType) {
          materialType[i as keyof typeof materialType] = false
        }
        materialType[key] = true
        switch (key) {
          case 'basic':
            this.useBasicMaterial()
            break;
          case 'normal':
            this.useNormalMaterial()
            break;
          case 'matcap':
            this.useMatcapMaterial()
            break;
          case 'depth':
            this.useMeshDepthMaterial()
            break;
          case 'pong':
            this.useMeshPongMaterial()
            break;
          case 'toon':
            this.useMeshToonMaterial()
            break;
          case 'standard':
            this.useMeshStandardMaterial()
            break;
          case 'environment':
            this.useEnvironmentMap()
            break;
        }
        this.sphere.material = this.material
        this.donut.material = this.material
        this.plane.material = this.material
      }
      const materialGroup = this.debugger.addFolder('Material');
      materialGroup.open();
      for (let materialKey in materialType) {
        let name = `Mesh ${materialKey.charAt(0).toUpperCase() + materialKey.substring(1)} Material`;
        if ((materialKey as keyof typeof materialType) === 'environment') {
          name = 'Environment Map'
        }
        materialGroup.add(materialType, materialKey).name(name).listen().onChange(() => updateMaterialType(materialKey as keyof typeof materialType))
      }

      // Add material to debugger
      const materialOptionGroup = this.debugger.addFolder('Material Option');
      materialOptionGroup.open();
      materialOptionGroup.add(this.material, 'transparent');

      // Material side controller
      const params = {
        front: true,
        back: false,
        double: false,
      }
      const updateParams = (key: keyof typeof params) => {
        for (let i in params) {
          params[i as keyof typeof params] = false
        }
        params[key] = true
        switch (key) {
          case 'front':
            this.material.side = THREE.FrontSide
            this.material.needsUpdate = true
            break;
          case 'back':
            this.material.side = THREE.BackSide
            this.material.needsUpdate = true
            break;
          case 'double':
            this.material.side = THREE.DoubleSide
            this.material.needsUpdate = true
            break;
        }
      }

      materialOptionGroup.add(params, 'front').name('Material Front Side').listen().onChange(() => updateParams('front'))
      materialOptionGroup.add(params, 'back').name('Material Back Side').listen().onChange(() => updateParams('back'))
      materialOptionGroup.add(params, 'double').name('Material Double Side').listen().onChange(() => updateParams('double'))
      materialOptionGroup.open()
    }
  }

  useBasicMaterial = () => {
    // import textures
    const doorColorTexture = this.textureLoader.load('/texture/door/color.jpg')
    const doorAlphaTexture = this.textureLoader.load('/texture/door/alpha.jpg')

    // Creates the geometry + materials
    this.material = new THREE.MeshBasicMaterial()
    // material.color.set('yellow')
    // material.color = new THREE.Color(0xFF00FF)
    this.material.map = doorColorTexture
    this.material.transparent = true
    this.material.alphaMap = doorAlphaTexture
    this.material.side = THREE.DoubleSide
  }

  useNormalMaterial = () => {
    this.material = new THREE.MeshNormalMaterial()
    this.material.flatShading = true
  }

  useMatcapMaterial = () => {
    const randomId = Math.max(1, Math.ceil(Math.random() * 8))
    const matcapTexture = this.textureLoader.load(`/texture/matcaps/${randomId}.png`)
    this.material = new THREE.MeshMatcapMaterial()
    this.material.matcap = matcapTexture
  }

  useMeshDepthMaterial = () => {
    this.material = new THREE.MeshDepthMaterial()
  }

  useMeshPongMaterial = () => {
    this.material = new THREE.MeshPhongMaterial({ shininess: 100 })
  }

  useMeshToonMaterial = () => {
    const gradientTexture = this.textureLoader.load('/texture/gradients/3.jpg')
    gradientTexture.minFilter = THREE.NearestFilter
    gradientTexture.magFilter = THREE.NearestFilter
    gradientTexture.generateMipmaps = false

    this.material = new THREE.MeshToonMaterial()
    this.material.gradientMap = gradientTexture
  }

  useMeshStandardMaterial = () => {
    // import textures
    const doorColorTexture = this.textureLoader.load('/texture/door/color.jpg')
    const doorAlphaTexture = this.textureLoader.load('/texture/door/alpha.jpg')
    const doorAmbientOcclusionTexture = this.textureLoader.load('/texture/door/ambientOcclusion.jpg')
    const doorHeightTexture = this.textureLoader.load('/texture/door/height.jpg')
    const doorNormalTexture = this.textureLoader.load('/texture/door/normal.jpg')
    const doorMetalnessTexture = this.textureLoader.load('/texture/door/metalness.jpg')
    const doorRoughnessTexture = this.textureLoader.load('/texture/door/roughness.jpg')

    this.plane.geometry.setAttribute('uv2', new THREE.BufferAttribute((this.plane.geometry.attributes.uv as THREE.Float32BufferAttribute).array, 2))
    this.sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute((this.sphere.geometry.attributes.uv as THREE.Float32BufferAttribute).array, 2))
    this.donut.geometry.setAttribute('uv2', new THREE.BufferAttribute((this.donut.geometry.attributes.uv as THREE.Float32BufferAttribute).array, 2))

    this.material = new THREE.MeshStandardMaterial({
      map: doorColorTexture,
      aoMap: doorAmbientOcclusionTexture,
      aoMapIntensity: 1,
      displacementMap: doorHeightTexture,
      displacementScale: 0.05,
      metalnessMap: doorMetalnessTexture,
      roughnessMap: doorRoughnessTexture,
      normalMap: doorNormalTexture,
      normalScale: new THREE.Vector2(0.5, 0.4),
      alphaMap: doorAlphaTexture,
      transparent: true
    })
  }

  useEnvironmentMap = () => {
    const randomId = Math.ceil(Math.random() * 4) - 1;
    const environmentMapTexture = this.cubeTextureLoader.load([
      `/texture/environmentMaps/${randomId}/px.jpg`,
      `/texture/environmentMaps/${randomId}/nx.jpg`,
      `/texture/environmentMaps/${randomId}/py.jpg`,
      `/texture/environmentMaps/${randomId}/ny.jpg`,
      `/texture/environmentMaps/${randomId}/pz.jpg`,
      `/texture/environmentMaps/${randomId}/nz.jpg`,
    ])

    this.material = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.15, envMap: environmentMapTexture })
  }

  animateMeshs() {
    this.donut.rotation.x = this.clock.getElapsedTime() * 0.2
    this.donut.rotation.y = this.clock.getElapsedTime() * 0.2
    this.sphere.rotation.x = this.clock.getElapsedTime() * 0.2
    this.sphere.rotation.y = this.clock.getElapsedTime() * 0.2
    this.plane.rotation.x = this.clock.getElapsedTime() * 0.2
    this.plane.rotation.y = this.clock.getElapsedTime() * 0.2
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
  scene.animateMeshs()
  scene.camera.updateProjectionMatrix();
  scene.orbitals.update()
  scene.renderer.render(scene, scene.camera);
  requestAnimationFrame(loop);
}

loop()