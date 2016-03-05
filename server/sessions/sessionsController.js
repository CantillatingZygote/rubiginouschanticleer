var helpers = require( '../config/helpers' );
var Session = require( './sessions' ).Session;
var NewMovie = require('./sessions').NewMovie;
var SessionUser = require ('../sessions_users/sessions_users');

module.exports = {

  getAllSessions: function( req, res, next ) {
    Session.findAll()
    .then( function( sessions ) {
      res.send( sessions );
    })
  },

  addSession: function( req, res, next ) {
    var sessionName = req.body.sessionName;

    Session.create( {
      sessionName: sessionName
    } ).then( function() {
      res.status = 201;
      res.end();
    } )
  },

  getSessionByName: function( req, res, next ) {
    var sessionName = req.params.sessionName;

    Session.findOne( { where: { sessionName: sessionName } } )
    .then( function( session ) {
      res.json( session );
    }, function( err ) {
      helpers.errorHandler( err, req, res, next );
    });
  },

  deleteSession: function(sessionID) {

    NewMovie.destroy({ where: {session_id: sessionID}})
    .then(function() {
      return SessionUser.destroy({where: {session_id: sessionID}});
    })
    .then(function(){
      return Session.destroy({where: {id: sessionID}});
    });
  }
  
};
