import { Server } from 'socket.io';
import logger from '../config/logger.js';
import Track from '../models/Track.js'; // Modèle de données pour les morceaux (à ajuster selon ta structure)

const jamSessions = {}; // Stocke les sessions Jam

export default function setupJamSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'https://spotifyaydt.netlify.app', 'https://spotify-aydt.vercel.app'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // 🔹 Rejoindre une session Jam
    socket.on('join-jam', ({ sessionId, user }) => {
      logger.info(`Données reçues : sessionId = ${sessionId}, user = ${user}`);
      if (!jamSessions[sessionId]) {
        jamSessions[sessionId] = {
          queue: [],
          currentTrack: null,
          startTime: null,
          listeners: [],
        };
      }

      jamSessions[sessionId].listeners.push(socket.id);
      socket.join(sessionId);

      // 🔹 Calcul du temps écoulé
      let elapsedTime = 0;
      if (jamSessions[sessionId].startTime) {
        elapsedTime = (Date.now() - jamSessions[sessionId].startTime) / 1000;
      }

      socket.emit('sync-playlist', {
        queue: jamSessions[sessionId].queue,
        currentTrack: jamSessions[sessionId].currentTrack,
        elapsedTime,
      });

      logger.info(`${user} joined session ${sessionId}`);
    });

    // 🔹 Ajouter un morceau à la playlist (avec l'ID du morceau)
    socket.on('add-track', async ({ sessionId, trackId }) => {
      logger.info(`Données reçues : sessionId = ${sessionId}, trackId = ${trackId}`);
      if (jamSessions[sessionId]) {
        try {
          const track = await Track.findById(trackId); // Recherche du morceau par son ID
          if (!track) {
            logger.info(`Morceau avec ID ${trackId} non trouvé`);
            return socket.emit('error', { message: 'Track not found' });
          }

          // Ajouter l'ID du morceau à la playlist
          jamSessions[sessionId].queue.push(track);
          io.to(sessionId).emit('update-playlist', jamSessions[sessionId].queue);

          logger.info(`Track with ID ${trackId} added to session ${sessionId}`);
        } catch (error) {
          logger.error(`Error adding track with ID ${trackId}: ${error.message}`);
        }
      }
    });

    // 🔹 Contrôler la lecture (play, pause, next)
    socket.on('control-track', async ({ sessionId, action }) => {
      if (jamSessions[sessionId]) {
        if (action === 'play' && jamSessions[sessionId].queue.length > 0) {
          const trackId = jamSessions[sessionId].queue[0];
          try {
            const track = await Track.findById(trackId);
            if (!track) {
              return socket.emit('error', { message: 'Track not found' });
            }

            jamSessions[sessionId].currentTrack = track;
            jamSessions[sessionId].startTime = Date.now();
            io.to(sessionId).emit('play-track', {
              track: jamSessions[sessionId].currentTrack,
              startTime: jamSessions[sessionId].startTime,
            });

            logger.info(`Playing track ${track.title} in session ${sessionId}`);
          } catch (error) {
            logger.error(`Error playing track with ID ${trackId}: ${error.message}`);
          }
        }
        if (action === 'pause') {
          io.to(sessionId).emit('pause-track');
        }
        if (action === 'next' && jamSessions[sessionId].queue.length > 1) {
          jamSessions[sessionId].queue.shift();
          const trackId = jamSessions[sessionId].queue[0];
          try {
            const track = await Track.findById(trackId);
            if (!track) {
              return socket.emit('error', { message: 'Track not found' });
            }

            jamSessions[sessionId].currentTrack = track;
            jamSessions[sessionId].startTime = Date.now();
            io.to(sessionId).emit('play-track', {
              track: jamSessions[sessionId].currentTrack,
              startTime: jamSessions[sessionId].startTime,
            });

            logger.info(`Next track: ${track.title} in session ${sessionId}`);
          } catch (error) {
            logger.error(`Error playing next track with ID ${trackId}: ${error.message}`);
          }
        }
      }
    });

    // 🔹 Ping régulier pour resynchronisation
    setInterval(() => {
      Object.keys(jamSessions).forEach((sessionId) => {
        if (jamSessions[sessionId].currentTrack && jamSessions[sessionId].startTime) {
          const elapsedTime = (Date.now() - jamSessions[sessionId].startTime) / 1000;
          io.to(sessionId).emit('sync-time', { elapsedTime });
        }
      });
    }, 5000); // Envoi toutes les 5 secondes

    // 🔹 Déconnexion d'un utilisateur
    socket.on('disconnect', () => {
      Object.keys(jamSessions).forEach((sessionId) => {
        jamSessions[sessionId].listeners = jamSessions[sessionId].listeners.filter(
          (id) => id !== socket.id
        );
      });
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
}
