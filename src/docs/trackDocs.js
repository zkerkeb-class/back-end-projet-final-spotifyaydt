/**
 * @swagger
 * components:
 *   schemas:
 *     Track:
 *       type: object
 *       required:
 *         - title
 *         - artist
 *         - album
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-généré de la piste audio
 *         title:
 *           type: string
 *           description: Titre de la piste audio
 *         artist:
 *           type: string
 *           description: ID de l'artiste associé
 *         album:
 *           type: string
 *           description: ID de l'album associé
 *       example:
 *         id: "123abc"
 *         title: "Track Example"
 *         artist: "Artist ID"
 *         album: "Album ID"
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
 * /tracks:
 *   get:
 *     summary: Récupérer toutes les pistes audio
 *     tags: [Tracks]
 *     responses:
 *       200:
 *         description: Liste des pistes audio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Track'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Créer une nouvelle piste audio
 *     tags: [Tracks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Track'
 *     responses:
 *       201:
 *         description: Piste audio créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /tracks/{id}:
 *   get:
 *     summary: Récupérer une piste audio par ID
 *     tags: [Tracks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la piste audio
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la piste audio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       404:
 *         description: Piste audio non trouvée
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
 *     summary: Mettre à jour une piste audio
 *     tags: [Tracks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la piste audio
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Track'
 *     responses:
 *       200:
 *         description: Piste audio mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Piste audio non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Supprimer une piste audio
 *     tags: [Tracks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la piste audio
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Piste audio supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Piste audio supprimée avec succès
 *       404:
 *         description: Piste audio non trouvée
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
