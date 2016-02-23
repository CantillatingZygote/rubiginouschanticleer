angular.module( 'moviematch.services', [] )

.factory( 'Auth', function( $http ) {
  return {
    signin : function( user ) {
      return $http.post( '/api/users/signin', user )
      .then(function ( resp ) {
        return resp.data.token;
      });
    },

    signup : function( user ) {
      return $http.post( '/api/users/signup', user )
      .then(function( resp ) {
        console.log("resp", resp.data.token);
        return resp.data.token;
      })
      .catch(function( err ) {
        console.log(err);
      });
    },

    isAuth : function() {
      return !!$window.localStorage.getItem( 'com.moviematch' );
    },

    signout : function() {
      $window.localStorage.removeItem( 'com.moviematch' );
      $location.path( '/signin' );
    }
  } 
} )

.factory( 'Session', function( $http ) {
  return {
    createSession: function( sessionName ) {
      return $http.post( '/api/sessions', { sessionName: sessionName } )
      .then( function( response ) {
        return response;
      }, function( err ) {
        console.error( err );
      } );
    }
  }
} )

.factory( 'Match', function( $http ) {
  return {
    sendVote: function( sessionID, userID, movieID, vote ) {
      return $http.post( // returns a promise; if you want to make use of a callback simply use .then on the return value.
        '/api/votes', // expect this endpoint to take a json object
                                      // with sessionID and userID
                                      // OR sessionuserID
                                      // AND movieID
                                      // AND vote (boolean true/false where true is yes and false is no)
        { session_id: sessionID, user_id: userID, movie_id: movieID, vote: vote })
      .then( function( response ) { // if the promise is resolved
        return response;
      },
      function( err ) { // if the promise is rejected
        console.error( err );
      } );
    }
  }
} );
