(function(){
    f360.factory("SunMoonService", SunMoonService);
    function SunMoonService ($http) {
        var model = {
            findSunMoonPhase: findSunMoonPhase
        };
        return model;

        function findSunMoonPhase (fish,spot,callback) {
            $http.get("/api/sunmoonphase/"+fish.caught+"/latitude/"+spot.latitude+"/longitude/"+spot.longitude)
            .success(function(response){
                callback(response);
            });
         }
    }
})();