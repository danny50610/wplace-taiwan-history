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

    // https://github.com/domoritz/leaflet-locatecontrol
    var lc = L.control.locate({
        position: 'bottomright',
        showPopup: false,
        clickBehavior: {
            inView: 'setView',
            outOfView: 'setView',
            inViewNotFollowing: 'inView'
        },
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