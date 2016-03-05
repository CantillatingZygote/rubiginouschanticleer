angular.module( 'moviematch.match', [] )

.controller( 'MatchController', function($http, $location, $scope, Match, Auth, Session, FetchMovies, Socket, Lobby, MatchRequestFactory) {
  $scope.session = {};
  $scope.user = {};
  $scope.users;
  $scope.usersDone = 0;
  $scope.movies;
  $scope.currMovie = {};
  $scope.done = false;
  $scope.routed = false;



  $scope.user.name = Auth.getUserName();

  // Sets currMovie to next movie OR moves client to waiting page
  var loadNextMovie = function(){
    if($scope.currMovie.index < $scope.movies.length - 1) {
      $scope.currMovie.index++;
      $scope.currMovie.movie = $scope.movies[$scope.currMovie.index];
    } else {
      Socket.emit('doneVoting', {username : $scope.user.name, sessionName: $scope.session.sessionName});
      $scope.done = true;
      // $location.path('/showmatch')
    }
  };

  // Listening to when other voters are done
  Socket.on('updateVoters', function(data) {
    // console.log('I GOT AN EMIT!!!!!');
    $scope.usersDone++;
    console.log('finished', $scope.usersDone, 'total', $scope.users.length);
    if ($scope.usersDone === $scope.users.length && !$scope.routed) {
      $location.path("/showmatch/true");
    } else if ($scope.done) {
      $scope.routed = true;
      $location.path("/showmatch/false");
    }
  })

  // Fires when client votes on a movie. Updates vote score of movie in DB
  $scope.updateVote = function(vote) {
    if (vote !== 0) {
      MatchRequestFactory.updateVote(vote, $scope.currMovie.movie.id)
      .then(function() {
        //real time update
        Socket.emit('rtVoteUpdate', {
          movie: $scope.currMovie.movie,
          sessionName: $scope.session.sessionName,
          vote: vote
        });

        loadNextMovie();
      })
    } else {
      loadNextMovie();
    }

  };

  // Listen for the signal to redirect to a 'match found' page.
  Socket.on( 'matchRedirect', function( id ) {
    // id refers to the id of the movie that the group matched on
    Match.matchRedirect( id );
  });

  //as soon as the view is loaded request the first movie-package here
  $scope.init = function() {
    // Assign session id 
    Session.getSession()
      .then( function( session ) {
        $scope.session = session;
        // Get all movies from session

        Lobby.getUsersInOneSession($scope.session.sessionName)
          .then(function(users){
            $scope.users = users;
          });

        MatchRequestFactory.getMovies($scope.session.id)
          .then(function(movies) {
            $scope.movies = movies.data;
            console.log($scope.movies)
            $scope.currMovie.movie = $scope.movies[0];
            $scope.currMovie.index = 0;
          })
      });
    };


  $scope.init();
})

.factory('MatchRequestFactory', function($http) {
  var updateVote = function(vote, movie_id) {
    return $http({
      method: 'PUT',
      url: '/api/movies/votes',
      data: {
        id: movie_id,
        vote: vote
      }
    });
  }

  var getMovies = function(session_id) {
    console.log(session_id,'goes to getMovies')
    return $http({
      method: 'GET',
      url: '/api/movies/' + session_id
    });
  }
  return {
    updateVote: updateVote,
    getMovies: getMovies
  };

});
