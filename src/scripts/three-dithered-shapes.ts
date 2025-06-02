import * as THREE from "three";

function initialize3DPaintBlobs(canvas: HTMLCanvasElement): void {
  if (!THREE) {
    console.error("THREE.js not loaded");
    return;
  }

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Simple, calm lighting setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(5, 8, 3);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -15;
  directionalLight.shadow.camera.right = 15;
  directionalLight.shadow.camera.top = 15;
  directionalLight.shadow.camera.bottom = -15;
  scene.add(directionalLight);

  // Single subtle accent light
  const accentLight = new THREE.PointLight(0xffffff, 0.3, 30, 2);
  accentLight.position.set(-8, 6, 8);
  scene.add(accentLight);

  // Bright painterly color palette (not used for B&W but kept for structure)
  const painterlyColors = [
    0xff6b35, // Vermillion
    0xf7931e, // Orange
    0xffd23f, // Yellow
    0x06ffa5, // Spring Green
    0x3ddc84, // Green
    0x1b98e0, // Blue
    0x6c5ce7, // Purple
    0xe17055, // Terracotta
    0xf39c12, // Golden
    0xe74c3c, // Red
    0x9b59b6, // Amethyst
    0x1abc9c, // Turquoise
  ];

  const paintShapes: THREE.Mesh[] = [];
  const splatters: THREE.Mesh[] = [];
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;

  // Minimal mouse tracking (no interactions)
  window.addEventListener("mousemove", (e: MouseEvent) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Create various fun geometric shapes
  function createShapeGeometry(): THREE.BufferGeometry {
    const shapeTypes = [
      () => new THREE.BoxGeometry(1, 1, 1),
      () => new THREE.SphereGeometry(0.8, 16, 16),
      () => new THREE.ConeGeometry(0.8, 1.5, 8),
      () => new THREE.CylinderGeometry(0.5, 0.8, 1.2, 8),
      () => new THREE.TorusGeometry(0.6, 0.3, 8, 16),
      () => new THREE.OctahedronGeometry(0.8),
      () => new THREE.DodecahedronGeometry(0.8),
      () => new THREE.TetrahedronGeometry(1),
    ];

    const randomShape =
      shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    return randomShape();
  }

  // Create soft paint material with subsurface scattering effect
  function createSoftPaintMaterial(color: number): THREE.ShaderMaterial {
    // Dithering shader material
    const ditherVertexShader = `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const ditherFragmentShader = `
      uniform float time;
      uniform vec3 lightPosition;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      // Ordered dithering matrix (Bayer 4x4)
      mat4 ditherMatrix = mat4(
        0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
        12.0/16.0, 4.0/16.0, 14.0/16.0,  6.0/16.0,
        3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
        15.0/16.0, 7.0/16.0, 13.0/16.0,  5.0/16.0
      );
      
      float getDitherValue(vec2 coord) {
        int x = int(mod(coord.x, 4.0));
        int y = int(mod(coord.y, 4.0));
        
        if (x == 0 && y == 0) return ditherMatrix[0][0];
        if (x == 1 && y == 0) return ditherMatrix[0][1];
        if (x == 2 && y == 0) return ditherMatrix[0][2];
        if (x == 3 && y == 0) return ditherMatrix[0][3];
        
        if (x == 0 && y == 1) return ditherMatrix[1][0];
        if (x == 1 && y == 1) return ditherMatrix[1][1];
        if (x == 2 && y == 1) return ditherMatrix[1][2];
        if (x == 3 && y == 1) return ditherMatrix[1][3];
        
        if (x == 0 && y == 2) return ditherMatrix[2][0];
        if (x == 1 && y == 2) return ditherMatrix[2][1];
        if (x == 2 && y == 2) return ditherMatrix[2][2];
        if (x == 3 && y == 2) return ditherMatrix[2][3];
        
        if (x == 0 && y == 3) return ditherMatrix[3][0];
        if (x == 1 && y == 3) return ditherMatrix[3][1];
        if (x == 2 && y == 3) return ditherMatrix[3][2];
        if (x == 3 && y == 3) return ditherMatrix[3][3];
        
        return 0.5;
      }
      
      void main() {
        // Calculate basic lighting
        vec3 lightDir = normalize(lightPosition - vWorldPosition);
        float NdotL = max(dot(vNormal, lightDir), 0.0);
        
        // Add some ambient
        float ambient = 0.3;
        float diffuse = NdotL * 0.7;
        float intensity = ambient + diffuse;
        
        // Add some surface variation for interest
        float surface = sin(vWorldPosition.x * 10.0) * cos(vWorldPosition.y * 8.0) * sin(vWorldPosition.z * 12.0);
        intensity += surface * 0.1;
        
        // Get pixel coordinates for dithering
        vec2 pixelCoord = gl_FragCoord.xy * 0.5; // Scale down for larger dither pattern
        float ditherThreshold = getDitherValue(pixelCoord);
        
        // Apply dithering
        float finalColor = step(ditherThreshold, intensity);
        
        gl_FragColor = vec4(vec3(finalColor), 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader: ditherVertexShader,
      fragmentShader: ditherFragmentShader,
      uniforms: {
        time: { value: 0 },
        lightPosition: { value: new THREE.Vector3(10, 10, 5) },
      },
      transparent: false,
      side: THREE.DoubleSide,
    });
  }

  // Create paint shapes
  function createPaintShapes(): void {
    console.log("Creating 3D paint shapes...");

    // Check screen size for positioning
    const isMobile = window.innerWidth < 768;
    const showcaseArea = document.querySelector(".mobile-showcase");

    // Create a big corner shape for all devices (top right)
    const cornerGeometry = createShapeGeometry();
    const cornerColor =
      painterlyColors[Math.floor(Math.random() * painterlyColors.length)];
    const cornerMaterial = createSoftPaintMaterial(cornerColor);
    const cornerShape = new THREE.Mesh(cornerGeometry, cornerMaterial);

    // Position in top right corner of screen
    if (isMobile) {
      // Mobile: far right positioning
      cornerShape.position.x = 5; // Further right for mobile
      cornerShape.position.y = 7; // Higher up
      cornerShape.position.z = 1; // Close to camera
    } else {
      // Desktop: moderate right positioning
      cornerShape.position.x = 3.5; // Positioned for visibility
      cornerShape.position.y = 6; // High up
      cornerShape.position.z = 1; // Very close to camera for prominence
    }

    // Make it large and imposing
    const cornerScale = 3.5 + Math.random() * 0.5; // Consistently large
    cornerShape.scale.setScalar(cornerScale);

    // Random rotation for visual interest
    cornerShape.rotation.x = Math.random() * Math.PI * 2;
    cornerShape.rotation.y = Math.random() * Math.PI * 2;
    cornerShape.rotation.z = Math.random() * Math.PI * 2;

    // Slow, subtle animation
    cornerShape.userData = {
      angularVelocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.003, // Much slower rotation
        (Math.random() - 0.5) * 0.003,
        (Math.random() - 0.5) * 0.003
      ),
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.002, // Slower floating
      originalPosition: cornerShape.position.clone(),
      originalScale: cornerScale,
      isCorner: true,
    };

    cornerShape.castShadow = true;
    cornerShape.receiveShadow = true;
    scene.add(cornerShape);
    paintShapes.push(cornerShape);

    // Create larger showcase shapes for all devices
    for (let i = 0; i < 3; i++) {
      // Reduced from 5 to 3
      const geometry = createShapeGeometry();
      const color =
        painterlyColors[Math.floor(Math.random() * painterlyColors.length)];
      const material = createSoftPaintMaterial(color);
      const shape = new THREE.Mesh(geometry, material);

      // Position prominently in showcase area
      if (isMobile) {
        // Mobile: concentrate in top right area
        shape.position.x = 2 + Math.random() * 4; // Right side only (2 to 6)
        shape.position.y = 5 + Math.random() * 3; // High up (5 to 8)
        shape.position.z = -1 + Math.random() * 3; // Close to camera (-1 to 2)
      } else {
        // Desktop: spread across top area
        shape.position.x = (Math.random() - 0.5) * 10; // Slightly less spread to avoid corner
        shape.position.y = 4 + Math.random() * 4; // Much higher up for prominent display
        shape.position.z = -2 + Math.random() * 6; // Closer to camera
      }

      // Much larger scale for visual impact
      const scale = 2.0 + Math.random() * 1.5; // Way bigger shapes
      shape.scale.setScalar(scale);

      // Dynamic rotation
      shape.rotation.x = Math.random() * Math.PI * 2;
      shape.rotation.y = Math.random() * Math.PI * 2;
      shape.rotation.z = Math.random() * Math.PI * 2;

      // Slower showcase physics properties
      shape.userData = {
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008, // Much slower rotation
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008
        ),
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.003 + Math.random() * 0.002, // Slower floating
        originalPosition: shape.position.clone(),
        originalScale: scale,
        isShowcase: true,
      };

      shape.castShadow = true;
      shape.receiveShadow = true;
      scene.add(shape);
      paintShapes.push(shape);
    }

    // Create background shapes for all devices
    for (let i = 0; i < 2; i++) {
      // Reduced from 3 to 2
      const geometry = createShapeGeometry();
      const color =
        painterlyColors[Math.floor(Math.random() * painterlyColors.length)];
      const material = createSoftPaintMaterial(color);
      const shape = new THREE.Mesh(geometry, material);

      // Position for background (well below showcase area)
      shape.position.x = (Math.random() - 0.5) * 25;
      shape.position.y = -6 + Math.random() * 4; // Much lower area
      shape.position.z = (Math.random() - 0.5) * 15;

      // Smaller scale for background
      const scale = 0.3 + Math.random() * 0.4;
      shape.scale.setScalar(scale);

      // Random rotation
      shape.rotation.x = Math.random() * Math.PI * 2;
      shape.rotation.y = Math.random() * Math.PI * 2;
      shape.rotation.z = Math.random() * Math.PI * 2;

      // Much slower physics properties
      shape.userData = {
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002, // Very slow rotation
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002
        ),
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.001 + Math.random() * 0.001, // Very slow floating
        originalPosition: shape.position.clone(),
        originalScale: scale,
        isShowcase: false,
      };

      shape.castShadow = true;
      shape.receiveShadow = true;
      scene.add(shape);
      paintShapes.push(shape);
    }
  }

  // Animation loop
  function animate(): void {
    time += 0.01;

    // Update paint shapes with gentle animation
    paintShapes.forEach((shape) => {
      const userData = shape.userData;

      // Gentle floating animation
      userData.floatOffset += userData.floatSpeed;
      const floatY = Math.sin(userData.floatOffset) * 0.5;
      const floatX = Math.cos(userData.floatOffset * 0.7) * 0.3;

      shape.position.y = userData.originalPosition.y + floatY;
      shape.position.x = userData.originalPosition.x + floatX;

      // Gentle rotation
      shape.rotation.x += userData.angularVelocity.x;
      shape.rotation.y += userData.angularVelocity.y;
      shape.rotation.z += userData.angularVelocity.z;

      // Update shader uniforms
      if (shape.material.uniforms) {
        shape.material.uniforms.time.value = time;
        shape.material.uniforms.lightPosition.value.set(5, 8, 3);
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // Setup camera position to work with showcase area for all devices
  camera.position.z = 8; // Closer to make shapes more prominent
  camera.position.y = 4; // Higher to look at showcase area
  camera.lookAt(0, 4, 0); // Look directly at showcase area

  // Handle resize to maintain viewport coverage
  function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Use the same close-up focus on showcase area for all devices
    const baseDistance = 8; // Close positioning
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera.position.z = baseDistance / Math.min(aspectRatio, 0.8);
    camera.position.y = 4;
    camera.lookAt(0, 4, 0);
  }

  window.addEventListener("resize", onWindowResize);

  // Initialize
  createPaintShapes();
  console.log("3D paint shape scene initialized");

  // Initial resize to ensure proper viewport coverage
  onWindowResize();
  animate();
}

// Expose the function globally on the window object
(window as any).initialize3DPaintBlobs = initialize3DPaintBlobs;
