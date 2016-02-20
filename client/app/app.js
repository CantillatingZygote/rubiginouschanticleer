angular.module( 'moviematch', [
  'moviematch.auth',
  'moviematch.match',
  'moviematch.prefs',
  'moviematch.sessions',
  'moviematch.services',
  'moviematch.showmatch',
  'ngRoute'
  ])

.config( function ( $routeProvider ) {
  $routeProvider
    .when( '/signin', {
      templateUrl: 'app/auth/signin.html',
      controller: 'AuthController'
    })
    .when( '/signup', {
      templateUrl: 'app/auth/signup.html',
      controller: 'AuthController'
    })
    .when( '/match', {
      templateUrl: 'app/match/match.html',
      controller: 'MatchController'
    })
    




    //Added route from Steffen:
    .when( '/showmatch', {
      templateUrl: 'app/showmatch/showmatch.html',
      controller: 'ShowmatchController'
    })
    .otherwise({
      redirectTo: '/signin'
    });
});
