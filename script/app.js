document.addEventListener('DOMContentLoaded', function () {
    //add basemap in leaflet
    const map = L.map('map', {
        zoomControl: false
    }).setView([51.5, -0.09], 13)

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    //membuat layergroup untuk basemap
    const baseLayers = {
        "osm": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map),
        "topo": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a>',
            maxZoom: 17
        }),
        "dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://carto.com/attributions">Carto</a>',
            maxZoom: 19
        })
    };

    // Fungsi untuk mengubah layer dasar
    function switchBaseLayer(layerId) {
        Object.values(baseLayers).forEach(layer => map.removeLayer(layer));
        baseLayers[layerId].addTo(map);
    }

    // Fungsi untuk mengaktifkan/menonaktifkan overlay layer
    function toggleOverlayLayer(layerId, checked) {
        if (layerId === "geojsonLayer") {
            if (checked) {
                geojsonLayer.addTo(map);
            } else {
                map.removeLayer(geojsonLayer);
            }
        }
    }

    // Event listener untuk radio button layer dasar
    document.querySelectorAll('input[name="baseLayer"]').forEach(radio => {
        radio.addEventListener('change', function () {
            switchBaseLayer(this.value);
        });
    });

    // Event listener untuk checkbox overlay layer
    document.querySelectorAll('input[name="overlayLayer"]').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            toggleOverlayLayer(this.value, this.checked);
        });
    });

    //fungsi untuk mengadd data geojson ke peta
    function displayGeoJSON(geojson) {
        const geojsonLayer = L.geoJSON(geojson).addTo(map)
        // Zoom peta untuk menampilkan keseluruhan GeoJSON
        map.fitBounds(geojsonLayer.getBounds());
    }

    const unggahDataGeoJSON = document.getElementById('unggah-geojson')
    unggahDataGeoJSON.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const geojson = JSON.parse(e.target.result);
                    displayGeoJSON(geojson);
                } catch (error) {
                    alert("File yang diunggah bukan file GeoJSON yang valid.");
                }
            };
            reader.readAsText(file);
        }
    });

    // Code untuk melakukan seacrh engine
    const searchInputForm = document.getElementById('search-input-form')
    searchInputForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const searchText = document.getElementById('simple-search').value;

        //API OpenstreaMap
        const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0){
                    const location = data[0];
                    const lon = parseFloat(location.lon);
                    const lat = parseFloat(location.lat);

                    map.setView([lat,lon],12)
                    L.marker([lat, lon]).addTo(map)
                        .bindPopup(`<b>${location.display_name}</b>`).openPopup();
                }else {
                    alert('tidak ditemukan lokasi');
                }
            }).catch(err=>{
                console.error('Error',err);
                alert('Terjadi kesalahan saat mencari lokasi')
        })
    })

})


