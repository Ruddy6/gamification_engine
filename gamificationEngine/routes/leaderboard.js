var mongoose = require('mongoose');

require('./../modeles/playerSchema');

var playerModel = mongoose.model('player');

/**
 * Permet de créer le leaderboard d'une application.
 * Le leaderboard est un classement des meilleurs player d'une application.
 * Il contient la liste des players représentés par leur pseudo et leur nombre de points,
 * classé par ordre de points décroissant.
 * @param {type} req
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Le leaderboard de l'application ou un code erreur 400 si un problème a été rencontré.
 */
exports.getLeaderboard = function(req, res) {
    var app_id = req.params.id;
    playerModel.aggregate([
            {$match: {application: new mongoose.Types.ObjectId(app_id)}},
            {$project: {
                pseudo: 1,
                points: 1
            }},
        {$sort: {points: -1}}], function(err, leaderboard) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            res.send(leaderboard);
        }
    });
};
