var keysPressed = [];
var movingDirection = null; // Pode ser "forward", "backward" ou null
var rotating = false;
var playerInContactWithBall = false;
var score_1 = 0;
var score_2 = 0;
var sessionStartTime = sessionStorage.getItem('sessionStartTime');

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



AFRAME.registerComponent("baliza1", {
    init: function () {
      var el = this.el;

      el.addEventListener("collide", function (e) {
        if (e.detail.body.el.id === "ball" && el.id === "baliza01") {
          console.log("golo baliza1");
          score_1 += 1;
          setTimeout(function () {
            updateScoreText();
          },1000);
          document.getElementById('goal-message').setAttribute('visible', 'true');
        }
      });
    },
  });

  
AFRAME.registerComponent("baliza2", {
  init: function () {
    var el = this.el;

    el.addEventListener("collide", function (e) {
      if (e.detail.body.el.id === "ball" && el.id === "baliza02") {
        console.log("golo baliza2");
        score_2 += 1;
        setTimeout(function () {
          updateScoreText();
        },1000);
        document.getElementById('goal-message2').setAttribute('visible', 'true');
        
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

  
function updateScoreText() {
  var scoreText = document.getElementById('score_1');
  scoreText.setAttribute('value', score_1);
  var scoreText = document.getElementById('score_2');
  scoreText.setAttribute('value', score_2);
  document.getElementById('goal-message2').setAttribute('visible', 'false');
  document.getElementById('goal-message').setAttribute('visible', 'false');

  resetBallPosition();
  resetPlayerPosition(); 
}

function resetPlayerPosition() {
  var player = document.getElementById('player1');
  setTimeout(function () {
    player.setAttribute('position', '2 0 -4');  // Posição inicial do jogador
    player.setAttribute('rotation', '0 0 0');  // Posição inicial do jogador
    
  }, 100);
}

function resetBallPosition() {
  var ball = document.getElementById('ball');
  setTimeout(function () {
    
  },1000);
  setTimeout(function () {
    // Posição inicial da bola
    ball.removeAttribute('dynamic-body');
    ball.setAttribute('static-body')
    ball.setAttribute('position','2, 10, -4');
    ball.removeAttribute('static-body');
    ball.setAttribute('dynamic-body')

  }, 100); 
}
// Função para obter a diferença de tempo em minutos e segundos
function getSessionDuration() {
  // Obter o tempo de início da sessão
 
  
  if (!sessionStartTime) {
    // Se não houver tempo de início da sessão, definir um novo
    sessionStartTime = Date.now();
    sessionStorage.setItem('sessionStartTime', sessionStartTime);
  }

  // Obter o tempo atual
  var currentTime = Date.now();

  // Calcular a diferença de tempo em milissegundos
  var timeDifference = currentTime - sessionStartTime;

  // Calcular minutos e segundos
  var minutes = Math.floor(timeDifference / 60000); // 1 minuto = 60.000 milissegundos
  var seconds = Math.floor((timeDifference % 60000) / 1000); // 1 segundo = 1.000 milissegundos
   // Adicionar zeros à esquerda se for menor que 10
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
 
  return { minutes, seconds };
}

function updateSessionDuration() {
  setInterval(function() {
    var sessionDuration = getSessionDuration();
   //console.clear(); // Limpa a tela do console (opcional)
    document.getElementById('minutes').setAttribute('value', sessionDuration.minutes);
    document.getElementById('seconds').setAttribute('value', sessionDuration.seconds);

    //console.log("Tempo de sessão: " + sessionDuration.minutes + " minutos e " + sessionDuration.seconds + " segundos");
  }, 1000); // Atualizar a cada 1000 milissegundos (1 segundo)
}

// Função para atualizar o movimento no loop de renderização
function animate() {
  requestAnimationFrame(animate);
  movePlayer();
  updateCameraPosition();
}
updateSessionDuration();

animate(); 