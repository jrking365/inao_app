/**
 * @file controlleur pour les utilisateurs
 * @author Jean Roger NIGOUMI Guiala <mail@jrking-dev.com>
 *@version 1.0.0
 */

const User = require('../models').t_user;
const csv = require("csvtojson");

const Sequelize = require('sequelize');
const bcrypt = require('bcrypt-nodejs');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);


/**
 * @function setTimeconnect
 * @author Jean Roger NIGOUMI Guiala <mail@jrking-dev.com>
 * @description met a jour l'heure de connection
 * @param {User} user 
 */
function setTimeconnect(user) {
    return sequelize
        .query("UPDATE metier_inao.t_user SET last_connection = CURRENT_TIMESTAMP WHERE login = $login;", {

            bind: {
                login: user.login
            }
        }).spread((results, metadata) => {
        }).catch(error => response.status(400).send(error));
}

function makeHash(password, callback) {

    bcrypt.hash(password, null, null, (err, hash) => {

        callback(hash);

    });

}

/**
 * @function createUser
 * @author Jean Roger NIGOUMI Guiala <mail@jrking-dev.com>
 * @description crée un utilisateur en fonction du login et du mot de passe
 * @param {string} login 
 * @param {string} mdp 
 */
function createUser(login, mdp) {
    User
        .build({ login: login, mdp: mdp })
        .save()
        .then(user => {
            if (!user) {
                console.log("erreur");
            }
            else {
                console.log("success");
            }
        }).catch(error => res.status(400).send(error));
}

module.exports = {

    /**
     * @method checkAdmin
     * @author Jean Roger NIGOUMI Guiala <mail@jrking-dev.com>
     * @description vérifie que celui qui se connecte a le login admin
     * @param {*} req 
     * @param {*} response 
     */
    checkAdmin(req, response) {
        if (req.body.login === "m.baussier@inao.gouv.fr") {
            User.findOne({
                where: { login: req.body.login },
            }).then(user => {
                if (user) {
                    bcrypt.compare(req.body.password, user.mdp, (err, res) => {
                        if (res) {
                            req.session.regenerate(() => {
                                req.session.user = { login: user.login, id: user.id };
                                setTimeconnect(user);
                                response.redirect('/csv/upload/form');
                            });
                        } else {
                            response.redirect('/login/not');
                        }
                    });
                }
            }).catch(error => response.status(400).send(error));
        } else {
            response.redirect('/login');
        }
    },


    /**
     * @method login
     * @author Jean Roger NIGOUMI Guiala <mail@jrking-dev.com>
     * @description pour la connexion
     * @param {*} req 
     * @param {*} response 
     */
    login(req, response) {
        return User.findOne({
                where: {login: req.body.login},
            }).then(user => {
                if (!user) {
                    response.redirect('/login/not');
                } else {
                    bcrypt.compare(req.body.password, user.mdp, (err, res) => {
                        if (res) {
                            req.session.regenerate(() => {
                                req.session.user = {
                                    login: user.login,
                                    id: user.id
                                };
                                setTimeconnect(user);
                                response.redirect('/');

                            });
                        } else {
                            response.redirect('/login/not');
                        }
                    });
                }
            }).catch(error => response.status(400).send(error));
    },


    /**
     * @method createListUser
     * @author Jean Roger NIGOUMI Guiala <mail@jrking-dev.com>
     * @description crée les utilisateurs en fonction de la liste
     * @param {*} req 
     * @param {*} res 
     */
    createListUser(req, res) {
        const csvFilepath = req.file.path;
        csv()
            .fromFile(csvFilepath)
            .then((userList) => {
                if (userList.length >= 1) {
                    try {
                        userList.forEach(Fuser => {
                            User.findOne({
                                where: { login: Fuser.login }
                            }).then(user => {
                                if (!user) {
                                    makeHash(Fuser.mdp, cripte => {
                                        createUser(Fuser.login, cripte);
                                    });
                                } else {
                                    console.log("skip");
                                }
                            }).catch(error => response.status(400).send(error));
                        });
                        res.status(200).send({ message: "success" });
                    } catch (error) { res.status(400).send(error); }
                }
            });
    }

};