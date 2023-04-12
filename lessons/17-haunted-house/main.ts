import * as THREE from 'three';
import GUI from 'lil-gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Scene extends THREE.Scene {
  debugger: GUI = new GUI();
  camera: THREE.PerspectiveCamera = null;
  renderer: THREE.WebGLRenderer = null;
  orbitals: OrbitControls = null;
  width = window.innerWidth;
  height = window.innerHeight;
  textureLoader = new THREE.TextureLoader();
  ghosts: THREE.PointLight[] = []
  clock = new THREE.Clock()

  constructor(debug: boolean = true, addGridHelper: boolean = true) {
    super()

    // setup camera
    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, .1, 1000);
    this.camera.position.z = 12;
    this.camera.position.y = 12;
    this.camera.position.x = 12;

    // fog
    const fog = new THREE.Fog(0x262837, 15, 30)
    this.fog = fog

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
    this.orbitals.maxPolarAngle = Math.PI / 2.2
    this.orbitals.minDistance = 5
    this.orbitals.maxDistance = 33
    this.orbitals.enableDamping = true

    // set the background color
    // this.background = new THREE.Color(0x262837);
    this.renderer.setClearColor(0x262837);

    // Texture
    const doorColorTexture = this.textureLoader.load('/texture/door/color.jpg')
    const doorAlphaTexture = this.textureLoader.load('/texture/door/alpha.jpg')
    const doorAmbientOcclusionTexture = this.textureLoader.load('/texture/door/ambientOcclusion.jpg')
    const doorHeightTexture = this.textureLoader.load('/texture/door/height.jpg')
    const doorNormalTexture = this.textureLoader.load('/texture/door/normal.jpg')
    const doorMetalnessTexture = this.textureLoader.load('/texture/door/metalness.jpg')
    const doorRoughnessTexture = this.textureLoader.load('/texture/door/roughness.jpg')

    const bricksColorTexture = this.textureLoader.load('/texture/bricks/color.jpg')
    const bricksAmbientOcclusionTexture = this.textureLoader.load('/texture/bricks/ambientOcclusion.jpg')
    const bricksNormalTexture = this.textureLoader.load('/texture/bricks/normal.jpg')
    const bricksRoughnessTexture = this.textureLoader.load('/texture/bricks/roughness.jpg')

    const grassColorTexture = this.textureLoader.load('/texture/grass/color.jpg')
    const grassAmbientOcclusionTexture = this.textureLoader.load('/texture/grass/ambientOcclusion.jpg')
    const grassNormalTexture = this.textureLoader.load('/texture/grass/normal.jpg')
    const grassRoughnessTexture = this.textureLoader.load('/texture/grass/roughness.jpg')

    grassColorTexture.repeat.set(24, 24)
    grassAmbientOcclusionTexture.repeat.set(24, 24)
    grassNormalTexture.repeat.set(24, 24)
    grassRoughnessTexture.repeat.set(24, 24)

    grassColorTexture.wrapS = THREE.RepeatWrapping
    grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
    grassNormalTexture.wrapS = THREE.RepeatWrapping
    grassRoughnessTexture.wrapS = THREE.RepeatWrapping

    grassColorTexture.wrapT = THREE.RepeatWrapping
    grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
    grassNormalTexture.wrapT = THREE.RepeatWrapping
    grassRoughnessTexture.wrapT = THREE.RepeatWrapping

    const ambientLight = new THREE.AmbientLight(0xb9d5ff, 0.2)
    this.add(ambientLight)

    const moonLight = new THREE.DirectionalLight(0xb9d5ff, 0.2)
    moonLight.position.set(4, 5, -2)
    this.add(moonLight)

    const doorLight = new THREE.PointLight(0xff7d46, 1, 7)
    doorLight.position.set(0, 2.2, 2.5)
    this.add(doorLight)

    // ghost lights
    this.ghosts[0] = new THREE.PointLight(0xff00ff, 3, 3)
    this.ghosts[0].position.y = 1
    this.add(this.ghosts[0])

    this.ghosts[1] = new THREE.PointLight(0x00ffff, 3, 3)
    this.ghosts[1].position.y = 1
    this.add(this.ghosts[1])

    this.ghosts[2] = new THREE.PointLight(0xffff00, 3, 3)
    this.ghosts[2].position.y = 1
    this.add(this.ghosts[2])

    // Creates the geometry + materials
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(36 * 3, 36 * 2),
      new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture,
      })
    )
    // @ts-ignore
    floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))
    floor.rotation.x = -Math.PI * 0.5
    this.add(floor)

    const house = new THREE.Group()
    this.add(house)

    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 4),
      new THREE.MeshStandardMaterial({
        map: bricksColorTexture,
        aoMap: bricksAmbientOcclusionTexture,
        normalMap: bricksNormalTexture,
        roughnessMap: bricksRoughnessTexture,
      })
    )
    // @ts-ignore
    walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2))
    walls.position.y = 1.25
    house.add(walls)

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 1, 4),
      new THREE.MeshStandardMaterial({ color: '#b35f45' })
    )
    roof.rotation.y = Math.PI * 0.25
    roof.position.y = 2.5 + 0.5
    house.add(roof)

    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
      new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
      })
    )
    // @ts-ignore
    door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2))
    door.position.y = 1
    door.position.z = 2 + 0.01
    house.add(door)

    // Graves
    const graves = new THREE.Group()
    this.add(graves)

    const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
    const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' })

    // Shadows
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    moonLight.castShadow = true
    doorLight.castShadow = true
    this.ghosts[0].castShadow = true
    this.ghosts[1].castShadow = true
    this.ghosts[2].castShadow = true
    door.castShadow = true
    walls.castShadow = true
    floor.receiveShadow = true

    for (let i = 0; i < 25; i++) {
      const radius = 4 + Math.random() * 8
      const x = Math.cos(i + 1) * radius
      const z = Math.sin(i + 1) * radius

      // Create the mesh
      const grave = new THREE.Mesh(graveGeometry, graveMaterial)

      // Position
      grave.position.set(x, 0.3, z)

      // Rotation
      grave.rotation.z = (Math.random() - 0.5) * 0.2
      grave.rotation.y = (Math.random() - 0.5) * 0.4
      grave.castShadow = true

      // Add to the graves container
      graves.add(grave)
    }

    // setup Debugger
    if (debug) {
      const cameraGroup = this.debugger.addFolder('Camera');
      cameraGroup.add(this.camera, 'fov', 20, 80);
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.open();
    }
  }

  animateGhosts() {
    const elapsedTime = this.clock.getElapsedTime()
    const radius = 5;
    const getRadian = (angle: number) => angle * Math.PI / 180;
    this.ghosts.forEach((ghost, i) => {
      const angle = 360 / this.ghosts.length * i
      ghost.position.x = Math.cos(getRadian(angle) + (elapsedTime * 0.8)) * radius
      ghost.position.z = Math.sin(getRadian(angle) + (elapsedTime * 0.8)) * radius
      ghost.position.y = Math.sin(getRadian(angle) + (elapsedTime * 0.8 * (i + 1))) + 0.5
    })
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
  scene.animateGhosts()
  requestAnimationFrame(loop);
}

loop()