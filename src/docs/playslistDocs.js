/**
 * @swagger
 * components:
 *   schemas:
 *     Playlist:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-généré de la playlist
 *         name:
 *           type: string
 *           description: Nom de la playlist
 *         tracks:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des IDs des morceaux dans la playlist
 *       example:
 *         id: "a1b2c3"
 *         name: "Playlist Chill"
 *         tracks: ["Track ID 1", "Track ID 2"]
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Message d'erreur
 */

/**
 * @swagger
 * /playlists:
 *   get:
 *     summary: Récupérer toutes les playlists
 *     tags: [Playlists]
 *     responses:
 *       200:
 *         description: Liste des playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Playlist'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Créer une nouvelle playlist
 *     tags: [Playlists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Playlist'
 *     responses:
 *       201:
 *         description: Playlist créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /playlists/{id}:
 *   get:
 *     summary: Récupérer une playlist par ID
 *     tags: [Playlists]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la playlist
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la playlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *       404:
 *         description: Playlist non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Mettre à jour une playlist
 *     tags: [Playlists]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la playlist
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Playlist'
 *     responses:
 *       200:
 *         description: Playlist mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Playlist non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Supprimer une playlist
 *     tags: [Playlists]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la playlist
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Playlist supprimée avec succès
 *       404:
 *         description: Playlist non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
