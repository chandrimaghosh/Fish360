f360.controller("SpotHomeListController", function($scope, $routeParams, $http, SpotService)
{
	console.log("SpotHomeListController " + SpotService);
	/*
	$scope.username = $routeParams.username;
	$scope.tripId = $routeParams.username;
	$http.get("api/allFish/"+$scope.username)
		.success(function(fish)
		{
			$scope.fish = fish;
		});
	*/
});

f360.controller("SpotListController", function($scope, $routeParams, $http, SpotService)
{
	console.log("SpotListController" + SpotService);
	$scope.username = $routeParams.username;
	/*
	$scope.tripId = $routeParams.tripId
	$http.get("api/user/"+$scope.username+"/trip/"+$routeParams.tripId+"/fish")
	.success(function(fish)
	{
		$scope.fish = fish;
	});
	*/
});

f360.controller("NewSpotController", function($scope, $routeParams, $http, $location, SpotService)
{
//	console.log(SpotService);
	$scope.username = $routeParams.username;
//	console.log($scope.username);
	$scope.create = function()
	{
//		console.log($scope.newSpot);
		if(typeof $scope.newSpot != "undefined") {
			$scope.newSpot.username = $scope.username;
			SpotService.create($scope.newSpot,function(){
				console.log("rew");
				history.back();
			});
		}
	}
	/*
	$scope.speciess = species;
	$scope.tripId = $routeParams.tripId;
	$scope.create = function()
	{
		var url = "api/user/"+$scope.username+"/trip/"+$scope.tripId+"/fish";
		console.log(url);
		$scope.newFish["lastUpdated"] = new Date();
		
		for(var i=0; i<species.length; i++)
			if(species[i].scientific == $scope.newFish.species)
				$scope.newFish["commonName"] = species[i].common;
		
		$http.post(url, $scope.newFish)
			.success(function(trips)
			{
				var preferences = {
					species : $scope.newFish.species
				};

				var user = localStorage.getItem("user");
				if(user != null && user != "") {
					user = JSON.parse(user);
					user.preferences = preferences;
				}
				localStorage.setItem("user", JSON.stringify(user));
				url = "api/user/"+$scope.username+"/preferences";
				$http.post(url, preferences);
//				$location.path( $scope.username+"/trip/"+$scope.tripId+"/fish/list" );
				
//				$location.replace(); // <----
				
				window.history.go(-2);
//				history.back();
			});
	}

	$scope.newFish = {};
	$scope.newFish.species = "";
	var user = localStorage.getItem("user");
	if(user != null && user != "") {
		user = JSON.parse(user);
//		$scope.newFish.species = user.preferences.species;
	}
	*/
});

f360.controller("EditSpotController", function($scope, $routeParams, $http, $location, SpotService)
{
	console.log("EditSpotController" + SpotService);
	/*
	$scope.speciess = species;

	$scope.username = $routeParams.username;
	$scope.tripId = $routeParams.tripId;
	$scope.fishId = $routeParams.fishId;
	*/
/*
	$scope.editFish = {};
	$scope.editFish.species = "";
	var user = localStorage.getItem("user");
	if(user != null && user != "") {
		user = JSON.parse(user);
		$scope.editFish.species = user.preferences.species;
	}
*/
	/*
	$http.get("api/user/"+$scope.username+"/trip/"+$scope.tripId+"/fish/"+$scope.fishId)
		.success(function(fish)
		{
			$scope.editFish = fish;
//			$scope.editFish.species = {name: fish.species};
		});
	
	$scope.update = function()
	{
		for(var i=0; i<species.length; i++)
			if(species[i].scientific == $scope.editFish.species)
				$scope.editFish["commonName"] = species[i].common;

//		$scope.editFish.commonName = "Test Common Name";
		
		$scope.editFish["lastUpdated"] = new Date();
		$http.put("api/user/"+$scope.username+"/trip/"+$scope.tripId+"/fish/"+$scope.fishId, $scope.editFish)
			.success(function(fish){
				var preferences = {
					species : $scope.editFish.species
				};

				var user = localStorage.getItem("user");
				if(user != null && user != "") {
					user = JSON.parse(user);
					user.preferences = preferences;
				}
				localStorage.setItem("user", JSON.stringify(user));

				url = "api/user/"+$scope.username+"/preferences";
				$http.post(url, preferences);

//				$location.path( $scope.username+"/trip/"+$scope.tripId+"/fish/list" );
				
				window.history.go(-2);

			});
	}
	
	$scope.remove = function()
	{
		$http.delete("api/user/"+$scope.username+"/trip/"+$scope.tripId+"/fish/"+$scope.fishId)
			.success(function(fish){
//				window.history.back();
//				$location.path( $scope.username+"/trip/"+$scope.tripId+"/fish/list" );
				window.history.go(-2);
			});
	}
	*/
});
