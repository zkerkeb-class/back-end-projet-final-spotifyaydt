/**
 * @swagger
 * components:
 *   schemas:
 *     Artist:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-généré de l'artiste
 *         name:
 *           type: string
 *           description: Nom de l'artiste
 *         albums:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des albums associés à l'artiste
 *       example:
 *         id: "a1b2c3"
 *         name: "Nom Artiste"
 *         albums: ["Album ID 1", "Album ID 2"]
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
 * /artists:
 *   get:
 *     summary: Récupérer tous les artistes
 *     tags: [Artists]
 *     responses:
 *       200:
 *         description: Liste des artistes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artist'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Créer un nouvel artiste
 *     tags: [Artists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Artist'
 *     responses:
 *       201:
 *         description: Artiste créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artist'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /artists/{id}:
 *   get:
 *     summary: Récupérer un artiste par ID
 *     tags: [Artists]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'artiste
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'artiste
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artist'
 *       404:
 *         description: Artiste non trouvé
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
 *     summary: Mettre à jour un artiste
 *     tags: [Artists]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'artiste
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Artist'
 *     responses:
 *       200:
 *         description: Artiste mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artist'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Artiste non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Supprimer un artiste
 *     tags: [Artists]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'artiste
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artiste supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Artiste supprimé avec succès
 *       404:
 *         description: Artiste non trouvé
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
