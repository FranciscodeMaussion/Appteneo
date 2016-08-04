angular.module('controllers', [])

  .controller('WelcomeCtrl', function($scope, $state, UserService, $ionicLoading, $ionicPlatform) {
    $ionicPlatform.ready(function() {
      window.plugins.googleplus.trySilentLogin(
        {
          'scopes': 'https://www.googleapis.com/auth/blogger', // optional - space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
          'webClientId': '861143147907-6hs58aam2m6tehf2eo8sh0ji0hh9t1td.apps.googleusercontent.com', // optional - clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
          'offline': false,
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
        'scopes': 'https://www.googleapis.com/auth/blogger', // optional - space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': '861143147907-6hs58aam2m6tehf2eo8sh0ji0hh9t1td.apps.googleusercontent.com', // optional - clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': false,
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

  .controller('AppCtrl', function($scope,$state){
})

  .controller('BlogCtrl', function($scope, $http, ionicToast, $ionicPopup, $cordovaCalendar){
  $scope.refresh = function() {
    $http({
      method: 'GET',
      url: 'https://www.googleapis.com/blogger/v3/blogs/7074297513106422012/posts/?key=AIzaSyBgvuxIG-r_45kie9fdcgokeiilTLVIa7s'
    }).then(function successCallback(response) {
      /*      alert(JSON.stringify(response));*/
      var helper = response.data.items;
      $scope.blogs = [];
      $scope.cutEvent;
      helper.forEach(function(aux){
          $scope.blogs.push({
          "title":aux.title,
          "desc":$scope.cutEvent(aux.content,0,'event-date='),
          "date":$scope.cutEvent($scope.cutEvent(aux.content,1,'event-date='),0,'event-place='),
          "place":$scope.cutEvent($scope.cutEvent(aux.content,1,'event-place='),0,'event-notes='),
          "notes":$scope.cutEvent($scope.cutEvent(aux.content,1,'event-notes='),0,'event-img='),
          "img":$scope.cutEvent($scope.cutEvent(aux.content,1,'event-img='),0,'event-cat='),
          "cat":$scope.cutEvent(aux.content,1,'event-cat='),
        })
      });
      console.log($scope.blogs);
      window.localStorage["posts"] = JSON.stringify($scope.blogs);
      console.log(window.localStorage["posts"]);
    }, function errorCallback(response) {
      if(window.localStorage["posts"] !== undefined) {
        $scope.blogs = JSON.parse(window.localStorage["posts"]);
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
    /*if (array.length == 1 && ct=='event-data=' && nb==1){
      return false;
    }*/
    console.log(array[nb]);
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
    var cont = blog.date;
    año = $scope.cutEvent(cont,2,'-');
    mes = $scope.cutEvent(cont,1,'-');
    dia = $scope.cutEvent(cont,0,'-');
    hora = $scope.cutEvent($scope.cutEvent(cont,3,'-'),0,':') ;
    min = $scope.cutEvent($scope.cutEvent(cont,3,'-'),1,':') ;
    lugar = blog.place;
    notas = blog.notes;
    titulo = blog.title;
    console.log(titulo);
    console.log(lugar);
    console.log(notas);
    console.log(año);
    console.log( mes);
    console.log(dia);
    console.log(hora);
    console.log( min);
    var confirmPopup = $ionicPopup.confirm({
      title: 'Recordarme '+ titulo,
      template: '¿Desea que le recordemos del evento del día '+ dia +'/'+ mes +'/'+ año +'?',
      cancelText: 'Cancelar',
      okText: 'Aceptar',
    });

    confirmPopup.then(function(res) {
      $scope.createEvent;
      if(res) {
        $scope.createEvent(titulo, lugar, notas, año, mes, dia, hora, min);
      } else {
        console.log('You are not sure');
      }
    });
  };

  $scope.createEvent = function(titulo,lugar,notas,año,mes,dia,hora,min) {
    $cordovaCalendar.createEventInteractively({
        title: titulo,
        notes: notas,
        location: lugar,
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
  .controller('CreateCtrl', function($scope, $http){
    $scope.createPost = function(){
    window.plugins.googleplus.trySilentLogin(
      {
        'scopes': 'https://www.googleapis.com/auth/blogger', // optional - space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': '861143147907-6hs58aam2m6tehf2eo8sh0ji0hh9t1td.apps.googleusercontent.com', // optional - clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': false,
      },
      function (obj) {
        alert(JSON.stringify(obj)); // do something useful instead of alerting
        console.log(obj.idToken);
        $http({
          method:'POST',
          url: 'https://www.googleapis.com/blogger/v3/blogs/7074297513106422012/posts/',
          data:{"kind": "blogger#post","blog": {"id": "7074297513106422012"},"title": "A new post","content": "With <b>exciting</b> content..."},
          headers: {
            'Authorization': ''+obj.idToken,
            'Content-Type': 'application/json'
          }
        }).then(function successCallback(response) {
          alert(JSON.stringify(response));
        }, function errorCallback(response) {
          alert(JSON.stringify(response));
          console.log(JSON.stringify(response));
        });
      },
      function (msg) {
        alert('error: ' + msg);
      });
    }

})
  .controller('EventsCtrl', function($scope){

  $scope.refresh = function(){
    $scope.events ;
    if(window.localStorage["events"] !== undefined) {
      $scope.events = JSON.parse(window.localStorage["events"]);
    }
  }

})

/*  .controller('NewsCtrl', function($scope, $http, $sce){

  $scope.init = function() {
    $http({
      method: 'GET',
      url: 'https://www.googleapis.com/plus/v1/people/106759890059555319461/activities/public?key=AIzaSyBgvuxIG-r_45kie9fdcgokeiilTLVIa7s'
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
