var keysPressed = [];
var movingDirection = null; // Pode ser "forward", "backward" ou null
var rotating = false;
var playerInContactWithBall = false;

document.addEventListener("keydown", (event) => {
  if (event.isTrusted) {
    if (!keysPressed.includes(event.code)) {
      keysPressed.push(event.code);

      switch (event.code) {
        case "ArrowUp":
          movingDirection = "forward";
          movePlayer();
          break;
        case "ArrowDown":
          movingDirection = "backward";
          movePlayer();
          break;
        case "ArrowLeft":
          startRotation("left");
          break;
        case "ArrowRight":
          startRotation("right");
          break;
        case "Space":
          tryKick();
          break;
      }
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (event.isTrusted) {
    const index = keysPressed.indexOf(event.code);
    if (index > -1) {
      keysPressed.splice(index, 1);
    }

    switch (event.code) {
      case "ArrowUp":
      case "ArrowDown":
        checkMovement();
        break;
      case "ArrowLeft":
      case "ArrowRight":
        stopRotation();
        break;
    }
  }
});

// Adicione a função para tentar chutar quando a tecla de espaço é pressionada
function tryKick() {
  if (playerInContactWithBall) {
    kickBall();
  }
}


AFRAME.registerComponent("player1", {
    init: function () {
      var el = this.el;

      el.addEventListener("collide", function (e) {
        if (e.detail.body.el.id === "ball" && el.id === "player1") {
          console.log("Collision detected between player and ball");
          
        }
      });
    },
  });

// Função para verificar e atualizar o movimento contínuo
function checkMovement() {
    var player = document.getElementById("player1");

    if (keysPressed.includes("ArrowUp")) {
        movingDirection = "forward";
    } else if (keysPressed.includes("ArrowDown")) {
        movingDirection = "backward";
    } else {
        movingDirection = null;
        if(player){
            player.setAttribute('gltf-model','./guardaRedes/scene.gltf');
            document.getElementById("player1").setAttribute("animation-mixer", "clip:Static pose");

        }
    }
}

// Função para movimentar o jogador continuamente
function movePlayer() {
    var player = document.getElementById("player1");
    var speed = 0.5;

    if (movingDirection) {
        var rotation = player.object3D.rotation.y;
        var deltaX = -Math.sin(rotation) * speed;
        var deltaZ = -Math.cos(rotation) * speed;

        switch (movingDirection) {
            case "forward":
                player.object3D.position.x -= deltaX;
                player.object3D.position.z -= deltaZ;
                break;
            case "backward":
                player.object3D.position.x += deltaX;
                player.object3D.position.z += deltaZ;
                break;
        }
        if(player){
          player.setAttribute('gltf-model','./correr/scene.gltf');
          document.getElementById("player1").setAttribute("animation-mixer", "clip:Take 001; loop:infinite");
        }
        updateCameraPosition();
    }
}

// Função para atualizar a posição da câmera
function updateCameraPosition() {
  var player = document.getElementById("player1");
  var cameraRig = document.getElementById("rig");
  if (player && cameraRig) {

    var distanceBehind = 10; // Distância atrás do jogador
    var rotation = player.object3D.rotation.y + Math.PI;

        cameraRig.object3D.position.x = player.object3D.position.x + distanceBehind * Math.sin(rotation);
        cameraRig.object3D.position.z = player.object3D.position.z + distanceBehind * Math.cos(rotation);

    cameraRig.object3D.position.y = player.object3D.position.y + 1.6;
    // Rotação para ver o jogador
    cameraRig.object3D.rotation.y = player.object3D.rotation.y + Math.PI;

  }
}
// Função para iniciar a rotação
function startRotation(direction) {
  rotating = true;

  function rotate() {
    if (rotating) {
      rotatePlayer(direction);
      requestAnimationFrame(rotate);
    }
  }
  rotate();
}

// Função para parar a rotação
function stopRotation() {
  rotating = false;
}

// Função para rotacionar o jogador
function rotatePlayer(direction) {
  var player = document.getElementById("player1");
  var rotationSpeed = 0.03;

  switch (direction) {
    case "left":
      player.object3D.rotation.y += rotationSpeed;
      break;
    case "right":
      player.object3D.rotation.y -= rotationSpeed;
      break;
  }
}

// Função para chutar a bola
function kickBall() {
  var ball = document.getElementById("ball");
  var player = document.getElementById("player1");
  var force = 10;

  if (ball.body) {
    console.log("kick");
        var direction = new THREE.Vector3(0, 0, -1).applyQuaternion(player.object3D.quaternion);

    ball.body.applyImpulse(
            new CANNON.Vec3(direction.x * force, direction.y * force, direction.z * force),
      ball.body.position
    );
  }
}

  

// Função para atualizar o movimento e chutar a bola no loop de renderização
function animate() {
  requestAnimationFrame(animate);
  movePlayer();
  updateCameraPosition();
}

animate(); // Inicie o loop de renderização