angular.module( 'moviematch.showmatch', [] )

.controller( 'ShowmatchController', function($scope, FetchMovies, Session, Auth, $routeParams, Socket, MatchRequestFactory) {
  $scope.movieChosen = false;
  $scope.winner;
  $scope.session;
  $scope.user = {};
  $scope.user.name = Auth.getUserName();
  $scope.movies = [];

  // Get session info
  Session.getSession()
    .then(function(session) {
      $scope.session = session;
      MatchRequestFactory.getMovies($scope.session.id)
        .then(function(movies) {
          console.log(movies,'is this the movies?')
          $scope.movies = movies.data;
        });
    })
    .then(function() {
      // Fires a 'ready' signal to server when last voter joins the room
      if ($routeParams.ready === "true") {    
        Socket.emit('selectedMovie', {
          session_id: $scope.session.id,
          session_name: $scope.session.sessionName
        });
      }

    })
    .catch(function(err) {
      console.error(err);
    });


  // Show winning movie
  Socket.on('winner', function(movie) {
    console.log(movie, '<--------------------------------------- MOVIE'); 
    $scope.winner = movie;
    $scope.movieChosen = true; 
  })

  //Update votes in real-time
  Socket.on('updateMovieVote', function(data) {
    for(var i = 0; i < $scope.movies.length; i ++) {
      if($scope.movies[i].id === data.movie.id) {
        $scope.movies[i].votes += data.vote;
      }
    }
  })

});
