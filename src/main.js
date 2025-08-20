import './style.css'

document.addEventListener("DOMContentLoaded", (event) => {
    function setUrl(lat, lng, zoom) {
        const url = new URL(window.location);
        url.searchParams.set('lat', lat);
        url.searchParams.set('lng', lng);
        url.searchParams.set('z', zoom);
        window.history.replaceState({}, '', url);
    }

    function registerSave(map) {
        map.on('moveend', function(e) {
            const lat = e.target.getCenter().lat;
            const lng = e.target.getCenter().lng;
            const zoom = e.target.getZoom();

            localStorage.setItem('last-viewer-lat', lat);
            localStorage.setItem('last-viewer-lng', lng);

            setUrl(lat, lng, zoom);
        });

        map.on('zoomend', function(e){
            const lat = e.target.getCenter().lat;
            const lng = e.target.getCenter().lng;
            const zoom = e.target.getZoom();

            localStorage.setItem('last-viewer-zoom', zoom);

            setUrl(lat, lng, zoom);
        });
    }

    let lastLat = null;
    let lastLng = null;
    let lastZoom = null;
    const params = new URLSearchParams(window.location.search);
    if (params.has('lat') && params.has('lng')) {
        const lat = parseFloat(params.get('lat'));
        const lng = parseFloat(params.get('lng'));
        if (!isNaN(lat) && !isNaN(lng) && -90 <= lat && lat <= 90 && -180 <= lng && lng <= 180) {
            lastLat = lat;
            lastLng = lng;
        }

        const zoom = parseInt(params.get('z'));
        if (!isNaN(zoom) && 0 <= zoom && zoom <= 18) {
            lastZoom = zoom;
        }
    }

    if (lastLat == null) {
        lastLat = localStorage.getItem('last-viewer-lat');
        if (lastLat == null) {
            lastLat = 25.038227;
        }
    }

    if (lastLng == null) {
        lastLng = localStorage.getItem('last-viewer-lng');
        if (lastLng == null) {
            lastLng = 121.532079;
        }
    }

    if (lastZoom == null) {
        lastZoom = localStorage.getItem('last-viewer-zoom');
        if (lastZoom == null) {
            lastZoom = 11;
        }
    }

    setUrl(lastLat, lastLng, lastZoom);

    const map = L.map('app').setView([lastLat, lastLng], lastZoom);

    L.tileLayer('https://wmts.nlsc.gov.tw/wmts/EMAP/default/EPSG:3857/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'TGOS © <a href="https://www.tgos.tw/">內政部</a>'
    }).addTo(map);

    const baseUrl = import.meta.env.VITE_WPLACE_TILE_URL;
    L.tileLayer(baseUrl + '/1755619201/{x}/{y}.webp', {
        minZoom: 11,
        maxNativeZoom: 11,
        keepBuffer: 1,
        attribution: '<a href="https://wplace.live/">wplace</a>',
        className: 'wplace-tile',
    }).addTo(map);

    map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        const zoom = map.getZoom();
        const url = `https://wplace.live/?lat=${lat}&lng=${lng}&zoom=${zoom}`;
        L.popup()
            .setLatLng(e.latlng)
            .setContent(`<a href="${url}" target="_blank">Go to wplace</a>`)
            .openOn(map);
    });

    // https://github.com/domoritz/leaflet-locatecontrol
    let lc = L.control.locate({
        position: 'bottomright',
        showPopup: false,
        clickBehavior: {
            inView: 'stop',
            outOfView: 'setView',
            inViewNotFollowing: 'inView'
        },
        drawCircle: false,
        initialZoomLevel: 11,
        onLocationError: function () {
            alert('無法定位，請確認有給予定位權限')
        },
        strings: {
            title: '',
        }
    }).addTo(map);

    registerSave(map);
});