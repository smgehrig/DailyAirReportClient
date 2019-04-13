var geocoder;
var mapProp;
var map;
var defaultLatitude = 36.8688;
var defaultLongitude = -100.2195;
var currentMarker;
var savedLocationList = [];

function messageCheckClicked(){
	var element = document.getElementById('details-messaging');
	var checkbox = document.getElementById('messageCheck');
	if(checkbox.checked === true) {
		element.style.display = "block";
	} else {
		element.style.display = "none";
	}
}

function initMap() {
	mapProp = {
	  center:new google.maps.LatLng(defaultLatitude,defaultLongitude),
      zoom: 4,
      mapTypeId: 'roadmap'
	};
	geocoder = new google.maps.Geocoder();
	var locationInput = document.getElementById('location_input');
	var addButton = document.getElementById('add_button');
	
	map = new google.maps.Map(document.getElementById("map"),mapProp);
	
	var input = document.getElementById('location_input');
	var searchBox = new google.maps.places.SearchBox(input);

	map.addListener('bounds_changed', function() {
	  searchBox.setBounds(map.getBounds());
	});

	/* ======== Listener for textbox place change ======== */
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();
        if(places.length == 0) return;
		
		var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
			if(!savedLocationList.includes(place))
			{
				createMarker(place);
				enableButton('add_button');
			}
			
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
	/* ======== Listener for map click ======== */
	map.addListener('click', function(event) {
        addMapClickToList(event.latLng);
    });
}

function getUserLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(setMapLocationToUser);
		return;
	} else { 
		alert("Geolocation is not supported by this browser.");
	}
}

/**
 * input: position : {lat, long}
 *
*/
function addMapClickToList(position) {
	geocoder.geocode({'location': position}, function(results, status) {
		if (status === 'OK') {
			if(results[0]){
					if(map.getZoom() < 7) map.setZoom(7);
					map.setCenter(position);
					createMarker(results[0]);
					var locationInput = document.getElementById('location_input');
					locationInput.value = results[0].formatted_address;
					enableButton('add_button');
			}
		}
	});
}
	  
function setMapLocationToUser(position){
	var latitude = (position != null) ? position.coords.latitude : defaultLatitude;
	var longitude = (position != null) ? position.coords.longitude : defaultLongitude;
	var position = ({lat: latitude, lng: longitude});
	geocoder.geocode({'location': position}, function(results, status) {
		if (status === 'OK') {
			if(results[0]){
					map.setZoom(7);
					map.setCenter(position);
					createMarker(results[0]);
					var locationInput = document.getElementById('location_input');
					locationInput.value = results[0].formatted_address;
					enableButton('add_button');
			}
		}
	});
}

function createMarker(place){
	if(currentMarker != null) currentMarker.setMap(null);
	currentMarker = new google.maps.Marker({
		map: map,
		title: place.formatted_address,
		position: place.geometry.location,
		icon: {"url": "http://maps.google.com/mapfiles/ms/icons/red.png"}
	});
}

function enableButton(button){
	var addButton = document.getElementById(button);
	addButton.disabled = false;
}

function disableButton(button){
	var addButton = document.getElementById(button);
	addButton.disabled = true;
}

//adds the current marker to the saved list of places to track
//the global marker variable can be set from many places
function addLocationToList(){
	currentMarker.setIcon("http://maps.google.com/mapfiles/ms/icons/green.png");
	savedLocationList.push(currentMarker);
	updateLocationSelect();
	disableButton('add_button');
	currentMarker = null;
}

function updateLocationSelect() {
	var select = document.getElementById("location_select");
	select.options.length = 0;
	savedLocationList.forEach(function(location) {
		var option = document.createElement("option");
		option.text = location.title;
		select.add(option);	
	});
}

function createLocationList(){
	var locationListDiv = document.getElementById("location_list_div");
	var select = document.createElement("select");
	select.addEventListener("change", enableRemoveButton);
	select.id = "location_select";
	select.size = "15";
	select.style.width = "325px";
	select.style.minWidth = "200px";
	locationListDiv.appendChild(select);
}

function enableRemoveButton() {
	var removeButton = document.getElementById("remove_button");
	removeButton.disabled = false;
}

function removeClicked() {
	var locationList = document.getElementById("location_select");
	var marker = savedLocationList[locationList.selectedIndex];
	savedLocationList.splice(locationList.selectedIndex, 1);
	updateLocationSelect();
	marker.setMap(null);
	enableButton('add_button');
	disableButton('remove_button');
}

window.onload = createLocationList;
