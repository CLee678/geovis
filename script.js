var map = L.map('map', {center: [39.981192, -75.155399], zoom: 10});
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);
map.doubleClickZoom.disable();

        var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2w2NzgiLCJhIjoiY2xvN3J2ZjEwMDd0MDJzbDQ2aXduZDJ2ciJ9.4pZIijWcn6wRXer9fWs0bA';
            
        var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
            streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
        
        var temple = L.marker([39.981192, -75.155399]);
        var drexel = L.marker([39.957352834066796, -75.18939693143933]);
        var penn = L.marker([39.95285548473699, -75.19309508637147]);
        
        var universities = L.layerGroup([temple, drexel, penn]);
        var universityLayer = {
            "Phily University": universities
        };        
    var baseMaps = {
        "grayscale": grayscale,
        "streets": streets
    };


// load GeoJSON from an external file
var neighborhoodsLayer = null;
$.getJSON("lead.geojson",function(data){
    neighborhoodsLayer = L.geoJson(data, {
        style: styleFunc,
        onEachFeature: function onEachFeatureFunc(feature, layer){
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomFeature
        });
        layer.bindPopup('Blood lead level: '+feature.properties.num_bll_5p);
    }
    }).addTo(map);

    var overlayLayer = {
        "blood_lead_level": neighborhoodsLayer,
        "Phily University": universities
    };
    
    L.control.layers(baseMaps, overlayLayer).addTo(map);



});

function highlightFeature(e){
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    // for different web browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Define what happens on mouseout:
function resetHighlight(e) {
    neighborhoodsLayer.resetStyle(e.target);
}  

// As an additional touch, let’s define a click listener that zooms to the state: 
function zoomFeature(e){
    console.log(e.target.getBounds());
    map.fitBounds(e.target.getBounds().pad(1.5));
}


// Set style function that sets fill color property equal to blood lead
function styleFunc(feature) {
    return {
        fillColor: setColorFunc(feature.properties.num_bll_5p),
        fillOpacity: 0.9,
        weight: 1,
        opacity: 1,
        color: '#ffffff',
        dashArray: '3'
    };
}

// Set function for color ramp, you can use a better palette
function setColorFunc(density){
    return density > 90 ? '#002d80' :
        density > 60 ? '#006080' :
        density > 30 ? '#00805c' :
        density > 0 ? '#5c8000' :
                        '#b59e05';
};

// Add Scale Bar to Map
L.control.scale({position: 'bottomleft'}).addTo(map);

// Create Leaflet Control Object for Legend
var legend = L.control({position: 'bottomright'});

// Function that runs when legend is added to map
legend.onAdd = function (map) {
    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');            
    div.innerHTML += '<b>Blood lead level</b><br />';
    div.innerHTML += 'by census tract<br />';
    div.innerHTML += '<br>';
    div.innerHTML += '<i style="background: #002d80"></i><p>90+</p>';
    div.innerHTML += '<i style="background: #006080"></i><p>60-90</p>';
    div.innerHTML += '<i style="background: #00805c"></i><p>30-60</p>';
    div.innerHTML += '<i style="background: #5c8000"></i><p>0-30</p>';
    div.innerHTML += '<hr>';
    div.innerHTML += '<i style="background: #b59e05"></i><p>No Data</p>';
    
    // Return the Legend div containing the HTML content
    return div;
};



// Add Legend to Map
legend.addTo(map);
