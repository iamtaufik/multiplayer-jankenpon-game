import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
let players = [];

const port = process.env.PORT || 3000;

app.use(express.static('public'));

const game = ['Batu', 'Gunting', 'Kertas'];

io.on('connection', async (socket) => {
  const player = {
    choice: game[Math.floor(Math.random() * game.length)],
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    x: Math.floor(Math.random() * 1200),
    y: Math.floor(Math.random() * 700),
    id: socket.id,
  };
  players.push(player);

  socket.on('right', () => {
    player.x += 1;
  });

  socket.on('left', () => {
    player.x -= 1;
  });

  socket.on('up', () => {
    player.y -= 1;
  });

  socket.on('down', () => {
    player.y += 1;
  });

  socket.on('checkCollision', () => {
    // Assume players are considered "close" if their distance is less than 10 pixels.
    const closePlayers = players.filter((otherPlayer) => {
      if (otherPlayer.id !== player.id) {
        const distance = Math.sqrt(Math.pow(player.x - otherPlayer.x, 2) + Math.pow(player.y - otherPlayer.y, 2));
        return distance < 15;
      }
      return false;
    });

    // Check for collisions and handle them.
    for (const closePlayer of closePlayers) {
      if (closePlayer.choice !== player.choice) {
        const winningConditions = {
          batu: 'gunting',
          gunting: 'kertas',
          kertas: 'batu',
        };
        if (winningConditions[player.choice.toLocaleLowerCase()] === closePlayer.choice.toLocaleLowerCase()) {
          closePlayer.choice = player.choice;
          io.to(closePlayer.id).emit('updateChoice', player.choice);
        } else {
          player.choice = closePlayer.choice;
          io.to(player.id).emit('updateChoice', closePlayer.choice);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    players = players.filter((p) => p.id !== socket.id);
    io.emit('playerDisconnected', socket.id);
  });
});

setInterval(() => {
  io.emit('players', players);
}, 1000 / 30);

httpServer.listen(port, () => {
  console.log('listening on *:3000');
});
