var express = require( 'express' );
var db = require( './config/db' );
var app = express();
var votesController = require('./votes/votesController');

//var Sequelize = require('sequelize');

var http = require( 'http' ).Server( app );
var io = require( 'socket.io' )( http );
var Session = require( './sessions/sessions' ).Session;
var User = require( './users/users' );
//var NewMovie = require('./newMovies/newMovies');
var NewMovie = require( './sessions/sessions').NewMovie;

//NewMovie.belongsTo(Session, {foreignKey: 'session_id'});

io.on( 'connect' , function( socket ){
  console.log( 'we are connected!!' );
  socket.on( 'disconnect', function() {
    console.log( 'were not connected anymore' );
  });

  //this recieves the create event emitted in client/sessions/sessions.js-emitCreate
  socket.on( 'session', function( data ) {
    Session.findOne( { where: { sessionName: data.sessionName } } )
    .then( function( session ) {
      //this function emits an event named newSession and sends the newly created session
      io.emit( 'newSession', session.dataValues );
    } );
  } );

  //this function listens to the new join event in client/sessions/sessions.js-emitJoin
  socket.on( 'newJoin', function( data ) {
    //this function creates a new or joins an existing socket-room
    socket.join( data.sessionName );
      //this function emits a newUser event and the new user to a specific room named the session name
      io.to( data.sessionName ).emit( 'newUser', data );
  } );

  socket.on( 'startSession', function( data ) {
    socket.join( data.sessionName );
    io.to( data.sessionName ).emit( 'sessionStarted' );
  } );

  // Listens for when a user is done voting
  socket.on('doneVoting', function(data) {
    io.to(data.sessionName).emit('updateVoters', data.username);
  })

  // Listens for all voters to finish
  socket.on('selectedMovie', function(data) { 
    votesController.checkMatch(data.session_id, function(movie) {
      console.log('do i get here??!?!?!??', movie)
      socket.join(data.sessionName);
      io.emit('winner', movie);
    });
  });

  // Listens for individual votes to update in real-time
  socket.on('rtVoteUpdate', function(data) {
    console.log('real time voting say whaaat')
    socket.join(data.sessionName);
    io.to(data.sessionName).emit('updateMovieVote', data);
  })

  // This listener handles broadcasting a matched movie to connected clients.
  // socket.on( 'foundMatch', function( data ) {
  //   socket.join( data.sessionName );
  //   io.to( data.sessionName ).emit( 'matchRedirect', data.movie.id );
  // })

  socket.on('routeChange', function(data) {
    socket.join( data.sessionName );
    io.to( data.sessionName ).emit('removeUser', {username: data.username})
  })

  socket.on('ready', function (data) {
    socket.join(data.sessionName);
    io.to(data.sessionName).emit('newReadyUser', {count: "blah"})
  })

  socket.on('allReady', function(data) {
    socket.join(data.sessionName);
    io.to(data.sessionName).emit('goMatch');
  })
});

const PORT = 8000;

require( './config/middleware' )( app, express );
require( './config/routes' )( app, express );

http.listen( process.env.PORT || PORT );
console.log( 'Listening on port ' + PORT );

module.exports = app;
