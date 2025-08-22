import './style.css'
import { initializeData, isInvalidDate, getDateTimestamp } from './data.js';

document.addEventListener("DOMContentLoaded", async (event) => {
    let baseUrl = import.meta.env.VITE_WPLACE_TILE_URL;
    const result =  await initializeData(baseUrl);
    let selectedDateString = result.lastDateString;
    let selectedDate = result.lastDate;

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

    if (params.has('date')) {
        const dateParam = params.get('date');
        if (!isInvalidDate(dateParam)) {
            selectedDateString = dateParam;
            selectedDate = getDateTimestamp(dateParam);
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

    L.TileLayer.Wplace = L.TileLayer.extend({
        getTileUrl: function(coords) {
            return baseUrl + '/' + selectedDate + `/${coords.x}/${coords.y}.webp`;
        },
    });
    
    L.tileLayer.wplace = function() {
        return new L.TileLayer.Wplace('', {
            minZoom: 11,
            maxNativeZoom: 11,
            keepBuffer: 1,
            attribution: '<a href="https://wplace.live/">wplace</a>',
            className: 'wplace-tile',
        });
    }
    
    let wplaceTileLayer = L.tileLayer.wplace();
    wplaceTileLayer.addTo(map);

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

    function addDatePicker() {
        const DatePickerControl = L.Control.extend({
            onAdd: function(map) {
                let div = L.DomUtil.create('div', "leaflet-bar leaflet-control");
                let link = L.DomUtil.create('a', "leaflet-bar-part leaflet-bar-part-single", div);
                link.id = "date-picker-button";
                link.href = "#";
                link.setAttribute("role", "button");
                link.innerHTML = '<i class="fa-solid fa-calendar-days"></i>';

                let isInit = false;
                let isOpen = false;
                L.DomEvent.on(link, "click", function (e) {
                    L.DomEvent.stopPropagation(e);
                    L.DomEvent.preventDefault(e);

                    let $datePickerButton = $('#date-picker-button');
                    if (!isInit) {
                        $datePickerButton.daterangepicker({
                            startDate: selectedDateString,
                            singleDatePicker: true,
                            opens: 'left',
                            autoUpdateInput: false, // 不自動填值
                            isInvalidDate: isInvalidDate,
                            locale: {
                                format: 'YYYY-MM-DD',
                                applyLabel: '套用',
                                cancelLabel: '取消',
                                "daysOfWeek": [
                                    "日",
                                    "一",
                                    "二",
                                    "三",
                                    "四",
                                    "五",
                                    "六",
                                ],
                                "monthNames": [
                                    "1月",
                                    "2月",
                                    "3月",
                                    "4月",
                                    "5月",
                                    "6月",
                                    "7月",
                                    "8月",
                                    "9月",
                                    "10月",
                                    "11月",
                                    "12月",
                                ],
                            }
                        });

                        $datePickerButton.on('apply.daterangepicker', function(ev, picker) {
                            selectedDateString = picker.startDate.format('YYYY-MM-DD');
                            selectedDate = getDateTimestamp(picker.startDate);
                            wplaceTileLayer.remove();
                            wplaceTileLayer.addTo(map);
                            isOpen = false;
                        });

                        $datePickerButton.on('cancel.daterangepicker', function(ev, picker) {
                            isOpen = false;
                        });
                    }

                    if (isOpen) {
                        $datePickerButton.data('daterangepicker').hide();
                        isOpen = false;
                    } else {
                        $datePickerButton.data('daterangepicker').show();
                        isOpen = true;
                    }
                });

                return div;
            },

            onRemove: function(map) {
                // Nothing to do here
            }
        });
        L.control.datePicker = function(opts) { return new DatePickerControl(opts);}
        L.control.datePicker({ position: 'topright' }).addTo(map);
    }
    addDatePicker();
});