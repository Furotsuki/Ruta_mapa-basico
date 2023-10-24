var map = L.map("map").setView([4.5793, -74.1579], 14);
map.scrollWheelZoom.disable();

// Define el mapa base
L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Grupo de marcadores
var markersGroup = L.layerGroup().addTo(map);
var routingControls = [];  // Lista para mantener un registro de todos los controles de enrutamiento
var userLocation = null;

// Intenta obtener la ubicación del usuario
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        userLocation = [position.coords.latitude, position.coords.longitude];
        L.marker(userLocation).addTo(markersGroup).bindPopup("Tu ubicación actual").openPopup();
        map.setView(userLocation, 14);
    }, showError);
} else {
    alert("La geolocalización no es soportada por este navegador.");
}

// Agregar un geocoder para buscar direcciones
var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false,
    collapsed: false
})
    .addTo(map)
    .on('markgeocode', function (e) {
        var destination = e.geocode.center;
        L.marker(destination).addTo(markersGroup).bindPopup(e.geocode.name).on('click', function (e) {
            markersGroup.removeLayer(e.target);
        });

        if (userLocation) {
            var newRoutingControl = L.Routing.control({
                waypoints: [
                    L.latLng(userLocation[0], userLocation[1]),  // Ubicación del usuario
                    L.latLng(destination.lat, destination.lng)   // Dirección encontrada
                ],
                lineOptions: {
                    styles: [{
                        color: 'blue',
                        opacity: 0.6,
                        weight: 6
                    }]
                }
            }).addTo(map);

            routingControls.push(newRoutingControl);  // Guardamos el control en la lista
        } else {
            alert("No se pudo obtener tu ubicación actual. Por favor asegúrate de haberla compartido.");
        }
    });

// Ajusta la posición del geocoder
map.on('resize', function () {
    var geocoderContainer = geocoder.getContainer();
    var size = map.getSize();
    geocoderContainer.style.left = size.x / 2 - geocoderContainer.clientWidth / 2 + 'px';
    geocoderContainer.style.bottom = '10px';
});
map.fire('resize');

// Función que se ejecuta si hay un error al obtener la posición
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("El usuario no permitió el acceso a su ubicación.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("La información de ubicación no está disponible.");
            break;
        case error.TIMEOUT:
            alert("La solicitud para obtener la ubicación del usuario ha excedido el tiempo permitido.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Ocurrió un error desconocido.");
            break;
    }
}
