const socket = io();

const names = { batu: '🪨', gunting: '✂️', kertas: '📄' };

const boardEl = document.querySelector('#board');
let playersMap = {};
let keyPres = {
  right: false,
  left: false,
  up: false,
  down: false,
};

document.addEventListener('keypress', (event) => {
  console.log(event.key);

  switch (event.key) {
    case 'd':
      keyPres.right = true;

      break;
    case 'a':
      keyPres.left = true;

      break;
    case 'w':
      keyPres.up = true;
      break;
    case 's':
      keyPres.down = true;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  console.log(event.key);

  switch (event.key) {
    case 'd':
      keyPres.right = false;

      break;
    case 'a':
      keyPres.left = false;

      break;
    case 'w':
      keyPres.up = false;
      break;
    case 's':
      keyPres.down = false;
      break;
  }
});

setInterval(() => {
  if (keyPres.right) {
    socket.emit('right');
  }

  if (keyPres.left) {
    socket.emit('left');
  }

  if (keyPres.up) {
    socket.emit('up');
  }

  if (keyPres.down) {
    socket.emit('down');
  }

  socket.emit('checkCollision');
}, 1000 / 60);

socket.on('players', (players) => {
  for (const player of players) {
    if (!playersMap[player.id]) {
      playersMap[player.id] = player;
      const playerEl = document.createElement('div');
      playerEl.classList.add('player');
      boardEl.appendChild(playerEl);
      player.el = playerEl;
      console.log(names);
      if (player.id === socket.id) {
        player.el.style.border = '2px solid red';
      }
    }
    playersMap[player.id].el.innerText = names[player.choice.toLowerCase()];
    playersMap[player.id].el.style.left = `${player.x}px`;
    playersMap[player.id].el.style.top = `${player.y}px`;
  }
});

socket.on('updateChoice', (newChoice) => {
  playersMap[socket.id].choice = newChoice;

  const currentPlayerEl = playersMap[socket.id].el;
  currentPlayerEl.innerText = names[newChoice];
});

socket.on('playerDisconnected', (id) => {
  console.log('playerDisconnected', id);
  playersMap[id].el.remove();
  delete playersMap[id];
});
