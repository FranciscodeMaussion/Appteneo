angular.module('controllers', [])

  .controller('WelcomeCtrl', function($scope, $state, UserService, $ionicLoading) {
  $scope.init = function(){

  }
  $scope.go = function(){
    $state.go('app.blog');
  }

  //This method is executed when the user press the "Login with Google" button
  $scope.googleSignIn = function() {
    $ionicLoading.show({
      template: 'Logging in...'
    });

    window.plugins.googleplus.login(
      {
        'scopes': 'https://www.googleapis.com/auth/plus.stream.read https://www.googleapis.com/auth/plus.me', // optional - space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': '', // optional - clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true,
      },
      function (user_data) {
        //alert(JSON.stringify(user_data));

        //for the purpose of this example I will store user data on local storage
        UserService.setUser({
          userID: user_data.userId,
          name: user_data.displayName,
          email: user_data.email,
          picture: user_data.imageUrl,
          accessToken: user_data.accessToken,
          idToken: user_data.idToken
        });
        $ionicLoading.hide();
        $scope.logged=true;
        console.log('hola');
        $state.go('app.blog');
      },
      function (msg) {
        $ionicLoading.hide();
        console.log(msg);
      }
    );
  };
})

  .controller('AppCtrl', function($scope,$state, UserService, $ionicPlatform){
  $ionicPlatform.ready(function() {
    window.plugins.googleplus.trySilentLogin(
      {
        'scopes': 'https://www.googleapis.com/auth/plus.stream.read https://www.googleapis.com/auth/plus.me', // optional - space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': '', // optional - clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true,
      },
      function (user_data) {
        UserService.setUser({
          userID: user_data.userId,
          name: user_data.displayName,
          email: user_data.email,
          picture: user_data.imageUrl,
          accessToken: user_data.accessToken,
          idToken: user_data.idToken
        });
        $scope.logged=true;
        $state.go('app.blog');
      },
      function (msg) {
        $state.go('welcome');
      }
    );
  });
  if (!$scope.logged) {
    $state.go('welcome');
  }
})

  .controller('BlogCtrl', function($scope, $http, ionicToast, $cordovaCalendar, $ionicPopup){
  $scope.refresh = function() {
    $http({
      method: 'GET',
      url: 'https://www.googleapis.com/blogger/v3/blogs/7074297513106422012/posts/?key='
    }).then(function successCallback(response) {
      /*      alert(JSON.stringify(response));*/
      $scope.blogs=response.data.items;
      window.localStorage["posts"] = JSON.stringify(response.data.items);
      console.log(window.localStorage["posts"]);
    }, function errorCallback(response) {
      if(window.localStorage["posts"] !== undefined) {
        $scope.entries = JSON.parse(window.localStorage["posts"]);
        ionicToast.show('No es posible cargar', 'bottom', false, 2500);
        console.log('no carga');
      }
    }).finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.cutEvent = function(string, nb, ct) {
    array = string.split(ct);
    return array[nb];
  }

  $scope.eventMe = function(has){
    if (cutEvent(has,1,'event-data=') !== ''){
      return true;
    }
    return false;
  }

  $scope.showConfirm = function(blog) {
    //titulo,lugar,notas,año,mes,dia,hora,min
    $scope.cutEvent;
    var cont = $scope.cutEvent(blog.content,1,'event-data=');
    $scope.año = $scope.cutEvent(cont,2,'-');
    $scope.mes = $scope.cutEvent(cont,1,'-');
    $scope.dia = $scope.cutEvent(cont,0,'-');
    $scope.hora = $scope.cutEvent($scope.cutEvent(cont,3,'-'),0,':') ;
    $scope.min = $scope.cutEvent($scope.cutEvent(cont,3,'-'),1,':') ;
    $scope.lugar = 'aca';
    $scope.notas = 'nada';
    $scope.titulo = blog.title;
    $scope.createEvent;
    var confirmPopup = $ionicPopup.confirm({
      title: 'Recordarme '+ $scope.titulo,
      template: '¿Desea que le recordemos del evento del día '+ $scope.dia +'/'+ $scope.mes +'/'+ $scope.año +'?',
      cancelText: 'Cancelar',
      okText: 'Aceptar',
    });

    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure '+ $scope.titulo);
        $scope.createEvent($scope.titulo,$scope.lugar,$scope.notas,$scope.año,$scope.mes,$scope.dia,$scope.hora,$scope.min);
      } else {
        console.log('You are not sure');
      }
    });
  };

  $scope.createEvent = function(titulo,lugar,notas,año,mes,dia,hora,min) {
    $cordovaCalendar.createEvent({
      title: titulo,
      location: lugar,
      notes: notas,
      startDate: new Date('20'+año, mes-1, dia, hora, min, 0, 0, 0),//año, mes(desde 0),dia,hora,min
      endDate: new Date('20'+año, mes-1, dia+1, 0, 0, 0, 0, 0)
    }).then(function (result) {
      console.log("Event created successfully");
      ionicToast.show('Evento creado', 'bottom', false, 2500);
    }, function (err) {
      console.error("There was an error: " + err);
      ionicToast.show('No se pudo crear el evento', 'bottom', false, 2500);
    });
  }
})

/*  .controller('NewsCtrl', function($scope, $http, $sce){

  $scope.init = function() {
    $http({
      method: 'GET',
      url: 'https://www.googleapis.com/plus/v1/people/106759890059555319461/activities/public?key='
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.news=response.data.items;
      console.log('hola ',$scope.news);
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      console.log('c');
    });
  }
  $scope.vid=function(s){
    if(s=='video'){
      return true;
    }
    return false;
  }
  $scope.trustSrc = function(src) {
    url = src.split('https://www.youtube.com/v/')[1];
    console.log(url);
    url = url.split('?version')[0];
    console.log(url);
    src = 'https://www.youtube.com/embed/'+url;
    return $sce.trustAsResourceUrl(src);
  }
})*/

  .controller('HomeCtrl', function($scope, UserService, $ionicActionSheet, $state, $ionicLoading){

  $scope.user = UserService.getUser();

  $scope.showLogOutMenu = function() {
    var hideSheet = $ionicActionSheet.show({
      destructiveText: 'Logout',
      titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
      cancelText: 'Cancel',
      cancel: function() {},
      buttonClicked: function(index) {
        return true;
      },
      destructiveButtonClicked: function(){
        $ionicLoading.show({
          template: 'Logging out...'
        });
        // Google logout
        window.plugins.googleplus.logout(
          function (msg) {
            console.log(msg);
            $ionicLoading.hide();
            $state.go('welcome');
          },
          function(fail){
            console.log(fail);
          }
        );
      }
    });
  };
})

;
