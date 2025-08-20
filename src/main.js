import './style.css'

document.addEventListener("DOMContentLoaded", (event) => {
    const container = document.getElementById('app');

    const map = L.map(container, {
        center: L.latLng(25.038227, 121.532079),
        zoom: 11,
    });

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

    // https://github.com/domoritz/leaflet-locatecontrol
    var lc = L.control.locate({
        position: 'bottomright',
        showPopup: false,
        clickBehavior: {
            inView: 'setView',
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
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
            lc.start();
        }
    });
});