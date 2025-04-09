/**
 * @swagger
 * components:
 *   schemas:
 *     Album:
 *       type: object
 *       required:
 *         - title
 *         - artist
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-généré de l'album
 *         title:
 *           type: string
 *           description: Titre de l'album
 *         artist:
 *           type: string
 *           description: Artiste associé à l'album
 *         tracks:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des pistes dans l'album
 *       example:
 *         id: "d5fE_asz"
 *         title: "Album Title"
 *         artist: "Artist ID"
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
 * /albums:
 *   get:
 *     summary: Récupérer tous les albums
 *     tags: [Albums]
 *     responses:
 *       200:
 *         description: Liste des albums
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Créer un nouvel album
 *     tags: [Albums]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Album'
 *     responses:
 *       201:
 *         description: Album créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Album'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /albums/{id}:
 *   get:
 *     summary: Récupérer un album par ID
 *     tags: [Albums]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'album
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'album
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Album'
 *       404:
 *         description: Album non trouvé
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
 *     summary: Mettre à jour un album
 *     tags: [Albums]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'album
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Album'
 *     responses:
 *       200:
 *         description: Album mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Album'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Album non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Supprimer un album
 *     tags: [Albums]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'album
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Album supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Album supprimé avec succès
 *       404:
 *         description: Album non trouvé
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
