angular.module( 'moviematch.match', ['moviematch.services'] )

.controller( 'MatchController', function( $scope, Match, FetchMovies) {

  var currMovieIndex = 0;
  var currMoviePackage = 0;

  var fetchNextMovies = function( packageNumber, callback ){         
    FetchMovies.getNext10Movies( packageNumber )
      .then(function( data ){
        console.log(data);
        $scope.moviePackage = data;
        callback();
      })
  };

  var loadNextMovie = function(){
    if( currMovieIndex === 9 ) {
      currMoviePackage++;
      fetchNextMovies( currMoviePackage )
        .then(function(){
          $scope.currMovie = $scope.moviePackage[0];
        })
      currMovieIndex = 0;
    }
    else {
      currMovieIndex++;
      $scope.currMovie = $scope.moviePackage[currMovieIndex];
    }
    
  };

  $scope.init = function() {        //as soon as the view is loaded request the first movie-package here
    fetchNextMovies( 0 , function() {
        $scope.currMovie = $scope.moviePackage[0];
        console.log($scope.currMovie);
      })
  }
  $scope.init();

  $scope.yes = function() { Match.sendVote( $scope.session.id, $scope.user.id, $scope.currMovie.id, true ); }
  $scope.no = function() { Match.sendVote( $scope.session.id, $scope.user.id, $scope.currMovie.id, false ); }
} );
