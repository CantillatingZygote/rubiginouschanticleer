angular.module( 'moviematch.lobby', [] )

.controller( 'LobbyController', function( $scope, Session, Lobby, Socket, $location, Auth, $window, $uibModal) {
  $scope.session = {};
  $scope.users;

  Session.getSession()
  .then( function( session ) {

    $scope.session = session;
    
    Lobby.getUsersInOneSession( $scope.session.sessionName )
    .then( function( users ){
      $scope.users = users;
    } );

  });

  $scope.username = Auth.getUserName();
  $scope.readyCount = 0;


  //this function is listening to any newUser event and recieves/appends the new user
  Socket.on( 'newUser', function( data ) {
    $scope.users.push( data );  
  } );

  Socket.on('removeUser', function (data) {
    for(var i = 0; i < $scope.users.length; i++) {
      if($scope.users[i].username === data.username) {
        $scope.users.splice(i, 1);
      }
    }
  })
  
  Socket.on( 'newReadyUser', function( data ) {
    $scope.readyCount++
    console.log($scope.readyCount)
    if ($scope.readyCount === $scope.users.length) {
      Socket.emit('allReady', {sessionName: $scope.session.sessionName});
    }
  });

  Socket.on('goMatch', function() {
    $location.path('/match');
  })

  $scope.startSession = function( sessionName ) {
    Socket.emit( 'startSession', { sessionName: sessionName } );
  };

  var isOpen = false;
  Socket.on('sessionStarted', function() {
    if (isOpen === false) {
      isOpen = true;
      open();
    }
  });

  //start options view when everyone is in the room
  var open = function () {

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '../app/movieinput/movieinput.html',
        controller: 'MovieInputController',
        size: 'lg'
      });

      modalInstance.result
        .then(function (movieSelection) {
          Socket.emit('ready', {sessionName: $scope.session.sessionName})
        });
    };

  // $scope.$on('$routeChangeStart', function (next, current) {
  //   if($location.path() === '/match') {
  //     return;
  //   } else {
  //     console.log($scope.username, '<--username')
  //     console.log(Socket, '<--sock')
  //     Socket.emit('routeChange', {sessionName: $scope.session.sessionName, username: $scope.username});
  //     // Socket.leave($window.localStorage.getItem('sessionName'));
  //     console.log('left', $window.localStorage.getItem('sessionName'))
  //   }
  // })
} )
