app = angular.module('starter.controllers', [])

app.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

app.controller('CreateCtrl', function($scope,ionicTimePicker, ionicDatePicker, ionicToast) {
  $scope.fyh="Fecha y Hora";
  var t;
  var d;
  function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  var tp = {
    callback: function (val) {      //Mandatory
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        var selectedTime = new Date(val * 1000);
        console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
        t =  addZero(selectedTime.getUTCHours())+":"+ addZero(selectedTime.getUTCMinutes());
        $scope.fyh=d+"-"+t;
        ionicToast.show($scope.fyh, 'bottom', false, 2500);
      }
    },
  };
  var dt = {
    callback: function (val) {  //Mandatory
      console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      d = new Date(val);
      m = d.getMonth()+1
      d = d.getDate()+"-"+m+"-"+d.getFullYear();
      ionicTimePicker.openTimePicker(tp);
    },
  };

  $scope.date = function(){
    ionicDatePicker.openDatePicker(dt);
  }
  $scope.sendNew= function() {
    ionicToast.show($scope.eTitulo, 'bottom', false, 2500);
    if(window.plugins && window.plugins.emailComposer) {
      window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
        console.log("Response -> " + result);
      },
     $scope.eTitulo, // Subject
     $scope.eContent+" event-data="+$scope.fyh,                      // Body
     [""],    // To
     null,                    // CC
     null,                    // BCC
     false,                   // isHTML
     null,                    // Attachments
     null);                   // Attachment Data
    }
  };
});

app.controller("noticiasCtrl", function($http, $scope, ionicToast, $ionicPopup, $cordovaCalendar) {

  $scope.init = function() {
    $http.get("http://ajax.googleapis.com/ajax/services/feed/load", { params: { "v": "1.0", "q": "https://feeds.feedburner.com/Appteneo" } })
      .success(function(data) {
      $scope.rssTitle = data.responseData.feed.title;
      $scope.rssUrl = data.responseData.feed.feedUrl;
      $scope.rssSiteUrl = data.responseData.feed.link;
      $scope.entries = data.responseData.feed.entries;
      window.localStorage["entries"] = JSON.stringify(data.responseData.feed.entries);
    })
      .error(function(data) {
      console.log("ERROR: " + data);
      if(window.localStorage["entries"] !== undefined) {
        $scope.entries = JSON.parse(window.localStorage["entries"]);
        ionicToast.show('No es posible cargar', 'bottom', false, 2500);
      }
    });
  }

  $scope.refresh=function(){
    $http.get("http://ajax.googleapis.com/ajax/services/feed/load", { params: { "v": "1.0", "q": "https://feeds.feedburner.com/Appteneo" } })
      .success(function(data) {
      $scope.rssTitle = data.responseData.feed.title;
      $scope.rssUrl = data.responseData.feed.feedUrl;
      $scope.rssSiteUrl = data.responseData.feed.link;
      $scope.entries = data.responseData.feed.entries;
      window.localStorage["entries"] = JSON.stringify(data.responseData.feed.entries);
    })
      .error(function(data) {
      console.log("ERROR: " + data);
      if(window.localStorage["entries"] !== undefined) {
        $scope.entries = JSON.parse(window.localStorage["entries"]);
        ionicToast.show('No es posible cargar', 'bottom', false, 2500);
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

  $scope.showConfirm = function(titulo,lugar,notas,año,mes,dia,hora,min) {
    $scope.createEvent;
    var confirmPopup = $ionicPopup.confirm({
      title: 'Recordarme '+ titulo,
      template: '¿Desea que le recordemos del evento?',
      cancelText: 'Cancelar',
      okText: 'Aceptar',
    });

    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');
        $scope.createEvent(titulo,lugar,notas,año,mes,dia,hora,min);
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
      endDate: new Date('20'+año, mes-1, dia, hora, min, 0, 0, 0)
    }).then(function (result) {
      console.log("Event created successfully");
      ionicToast.show('Evento creado', 'bottom', false, 2500);
    }, function (err) {
      console.error("There was an error: " + err);
      ionicToast.show('No se pudo crear el evento', 'bottom', false, 2500);
    });
  }


});
