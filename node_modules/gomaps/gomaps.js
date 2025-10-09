/*!
 * gomaps v1.0.9 (https://github.com/danieledesantis/gomaps)
 * Daniele De Santis (http://www.danieledesantis.net)
 * Copyright 2017-2017 Daniele De Santis
 * Licensed under MIT license
 */
;(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory(root));
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.GoMaps = factory(root);
	}
}(typeof global !== "undefined" ? global : this.window || this.global, function (root) {

	'use strict';
	
	var GoMaps = {};

	// settings
	var _settings;

	// default settings
	var _defaults = {
		zoom : 14
	};

	function _extend() {
		var extended = {};
		for (var i=0; i < arguments.length; i++) {
			// console.log(arguments[i]) DEBUG
			var properties = arguments[i];
			for (var key in properties) {
				extended[key] = properties[key];
			}
		}
		return extended;
	}

	function _hasDatasetSupport() {
		var elem = document.createElement('div');
		return !!elem.dataset;
		// In an unsupporting browser elem.dataset = undefined. !undefined = true. !true = false - Thanks to Rich Bradshaw (http://stackoverflow.com/questions/6226913/detecting-html5-data-attribute-in-modernizr)
	}

  // global method
  window.initMaps = function() {
		// console.log(_settings); DEBUG
		var isIE = !_hasDatasetSupport();
		// in IE < 11, !_hasDatasetSupport() = true
		//console.log(isIE); DEBUG

		var maps = document.getElementsByClassName('gomap');

		var i;
		for (i = 0; i < maps.length; i++) {

			var mapLat = isIE ? maps[i].getAttribute('data-lat') : maps[i].dataset.lat;
			var mapLng = isIE ? maps[i].getAttribute('data-lng') : maps[i].dataset.lng;

			if (!mapLat || !mapLng) continue;

			var mapOptions = {};

			var mapLatLng = {
				lat: Number(mapLat),
				lng: Number(mapLng)
			};

			mapOptions.center = mapLatLng;

			var clickableIcons = isIE ? maps[i].getAttribute('data-clickable-icons') : maps[i].dataset.clickableIcons;
			// IF setting is defined and "false" or false THEN set to false (if data-.. === "true" setting is overridden)
			if (_settings.clickableIcons !== undefined && _settings.clickableIcons !== 'true' && clickableIcons !== 'true') mapOptions.clickableIcons = false;
			// IF data-.. = "false" THEN set to false anyway
			if ( clickableIcons === 'false' ) mapOptions.clickableIcons = false;
			
			var disableDefaultUI = isIE ? maps[i].getAttribute('data-disable-default-ui') : maps[i].dataset.disableDefaultUi;
			// IF setting is 'true' or true THEN set to true (if data-... === "false" setting is overridden)
			if ((_settings.disableDefaultUI === true || _settings.disableDefaultUI === 'true') && disableDefaultUI !== 'false') mapOptions.disableDefaultUI = true;
			// IF data-.. = "true" THEN set to true anyway
			if ( disableDefaultUI === 'true' ) mapOptions.disableDefaultUI = true;
			
			var disableDoubleClickZoom = isIE ? maps[i].getAttribute('data-disable-double-click-zoom') : maps[i].dataset.disableDoubleClickZoom;
			if ((_settings.disableDoubleClickZoom === true || _settings.disableDoubleClickZoom === 'true') && disableDoubleClickZoom !== 'false') mapOptions.disableDoubleClickZoom = true;
			if ( disableDoubleClickZoom === 'true' ) mapOptions.disableDoubleClickZoom = true;
			
			var draggable = isIE ? maps[i].getAttribute('data-draggable') : maps[i].dataset.draggable;
			if (_settings.draggable !== undefined && _settings.draggable !== 'true' && draggable !== 'true') mapOptions.draggable = false;
			if ( draggable === 'false' ) mapOptions.draggable = false;
			
			var fullscreenControl = isIE ? maps[i].getAttribute('data-fullscreen-control') : maps[i].dataset.fullscreenControl;
			if ((_settings.fullscreenControl === true || _settings.fullscreenControl === 'true') && fullscreenControl !== 'false') mapOptions.fullscreenControl = true;
			if ( fullscreenControl === 'true' ) mapOptions.fullscreenControl = true;
			
			var keyboardShortcuts = isIE ? maps[i].getAttribute('data-keyboard-shortcuts') : maps[i].dataset.keyboardShortcuts;
			if (_settings.keyboardShortcuts !== undefined && _settings.keyboardShortcuts !== 'true' && keyboardShortcuts !== 'true') mapOptions.keyboardShortcuts = false;
			if ( keyboardShortcuts === 'false' ) mapOptions.keyboardShortcuts = false;
			
			var mapTypeControl = isIE ? maps[i].getAttribute('data-map-type-control') : maps[i].dataset.mapTypeControl;
			if (_settings.mapTypeControl !== undefined && _settings.mapTypeControl !== 'true' && mapTypeControl !== 'true') mapOptions.mapTypeControl = false;
			if ( mapTypeControl === 'false' ) mapOptions.mapTypeControl = false;
			
			var mapTypeId = isIE ? maps[i].getAttribute('data-map-type-id') : maps[i].dataset.mapTypeId;
			// data-... overriddes settings
			if ( _settings.mapTypeId !== undefined && ['hybrid', 'roadmap', 'satellite', 'terrain'].indexOf(_settings.mapTypeId.toLowerCase()) > -1) mapOptions.mapTypeId = _settings.mapTypeId;
			// check !== null for IE (in IE a data-attribute not set returns a null object, while typeof undefined returns an object, but value is null)
			if ( mapTypeId !== undefined && mapTypeId !== null && ['hybrid', 'roadmap', 'satellite', 'terrain'].indexOf(mapTypeId.toLowerCase()) > -1) mapOptions.mapTypeId = mapTypeId;
			
			var maxZoom = isIE ? maps[i].getAttribute('data-max-zoom') : maps[i].dataset.maxZoom;
			if ( _settings.maxZoom !== undefined && ! isNaN(Number(_settings.maxZoom))) mapOptions.maxZoom = Number(_settings.maxZoom);
			if ( maxZoom !== undefined && maxZoom !== null && ! isNaN(Number(maxZoom)) ) mapOptions.maxZoom = Number(maxZoom);
			
			var minZoom = isIE ? maps[i].getAttribute('data-min-zoom') : maps[i].dataset.minZoom;
			if ( _settings.minZoom !== undefined && ! isNaN(Number(_settings.minZoom)) ) mapOptions.minZoom = Number(_settings.minZoom);
			if ( minZoom !== undefined && minZoom !== null && ! isNaN(Number(minZoom)) ) mapOptions.minZoom = Number(minZoom);
			
			var rotateControl = isIE ? maps[i].getAttribute('data-rotate-control') : maps[i].dataset.rotateControl;
			if (_settings.rotateControl !== undefined && _settings.rotateControl !== 'true' && rotateControl !== 'true') mapOptions.rotateControl = false;
			if ( rotateControl === 'false' ) mapOptions.rotateControl = false;
			
			var scaleControl = isIE ? maps[i].getAttribute('data-scale-control') : maps[i].dataset.scaleControl;
			if ((_settings.scaleControl === true || _settings.scaleControl === 'true') && scaleControl !== 'false') mapOptions.scaleControl = true;
			if ( scaleControl === 'true' ) mapOptions.scaleControl = true;
			
			var scrollwheel = isIE ? maps[i].getAttribute('data-scrollwheel') : maps[i].dataset.scrollwheel;
			if (_settings.scrollwheel !== undefined && _settings.scrollwheel !== 'true' && clickableIcons !== 'true') mapOptions.scrollwheel = false;
			if ( scrollwheel === 'false' ) mapOptions.scrollwheel = false;
			
			var streetViewControl = isIE ? maps[i].getAttribute('data-street-view-control') : maps[i].dataset.streetViewControl;
			if (_settings.streetViewControl !== undefined && _settings.streetViewControl !== 'true' && streetViewControl !== 'true') mapOptions.streetViewControl = false;
			if ( streetViewControl === 'false' ) mapOptions.streetViewControl = false;
			
			var zoom = isIE ? maps[i].getAttribute('data-zoom') : maps[i].dataset.zoom;
			// zoom must be a number
			mapOptions.zoom = ( zoom !== undefined && zoom !== null && ! isNaN(Number(zoom)) ) ? Number(zoom) : _settings.zoom;
			
			var zoomControl = isIE ? maps[i].getAttribute('data-zoom-control') : maps[i].dataset.zoomControl;
			if (_settings.zoomControl !== undefined && _settings.zoomControl !== 'true' && zoomControl !== 'true') mapOptions.zoomControl = false;
			if ( zoomControl === 'false' ) mapOptions.zoomControl = false;

			// create the map
			var map = new google.maps.Map( maps[i], mapOptions);
			
			// MARKERS
			var markers = isIE ? maps[i].getAttribute('data-markers') : maps[i].dataset.markers;
			
			var showMarker = isIE ? maps[i].getAttribute('data-show-marker') : maps[i].dataset.showMarker; // no marker
			// show marker
			if ( showMarker !== 'false' ) {
				var markerOptions = {};
				markerOptions.map = map;
				
				if ( _settings.markerIconUrl !== undefined ) markerOptions.icon = { url: _settings.markerIconUrl };
				var markerIconUrl = isIE ? maps[i].getAttribute('data-marker-icon-url') : maps[i].dataset.markerIconUrl;
				if ( markerIconUrl !== undefined && markerIconUrl !== null ) markerOptions.icon = { url: markerIconUrl };
				// (if settings contain a marker icon, set data-marker-icon = false to use default marker icon)
				if ( markerIconUrl === 'false' ) markerOptions.icon = null;
				
				// multiple markers
				if (markers) {
					markers = markers.split(';');
				
					// loop through markers
					var k;
					for (k = 0; k < markers.length; k++) {
						var markerCenter = markers[k].split(',');
						var markerLat = markerCenter[0].trim();
						var markerLng = markerCenter[1].trim();
				
						if (!markerLat || !markerLng) continue;
				
						var markerLatLng = {
							lat: Number(markerLat),
							lng: Number(markerLng)
						};
						markerOptions.position = markerLatLng;
				
						var marker = new google.maps.Marker(markerOptions);
					}
				// single marker
				} else {
					markerOptions.position = mapLatLng;
					var marker = new google.maps.Marker(markerOptions);
				}
			}

		}
	}

	GoMaps.destroy = function() {
		if (! _settings) return;
		_settings = null;
	}

	GoMaps.init = function(options) {

		GoMaps.destroy();
		_settings = _extend( _defaults, options || {} );
		
		if (! _settings.key) return console.log('No API key provided.');
		
		var googleMapsScript = document.createElement('script');
		googleMapsScript.src = 'https://maps.googleapis.com/maps/api/js?key=' + _settings.key + '&callback=initMaps';
		googleMapsScript.setAttribute('async', '');
		googleMapsScript.setAttribute('defer', '');
		document.body.appendChild(googleMapsScript);
	}

	return GoMaps;
}));
