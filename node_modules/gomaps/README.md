GoMaps JS
================================

A JavaScript plugin which allow you to use Google Maps directly in your HTML using data attributes after initialization.
The plugin uses Google Maps JavaScript API for Web to display maps in all elements with the class "gomap".

## Installation and initialization

### Package managers

```shell
# npm
npm install gomaps

# Bower
bower install --save gomaps
```

### Vanilla JavaScript

```html
<script src="path/to/gomaps.min.js"></script>
```

```javascript
GoMaps.init({
	options: value,
	...
});
```

### jQuery

```html
<script src="path/to/gomaps.min.js"></script>
```

```javascript
$(document).ready(function() {
	GoMaps.init({
		options: value,
		...
	});
});
```

### RequireJS

```javascript
requirejs(['gomaps'],
function   (GoMaps) {
	GoMaps.init({
		options: value,
		...
	});
});
```

### Browserify

```javascript
var GoMaps = require("gomaps");

GoMaps.init({
	options: value,
	...
});
```

## Usage

Initialize the plugin, maps will be created in all elements with the class "gomap".

```javascript
GoMaps.init({
	options: value,
	...
});
```

```html
<div class="gomap" data-lat="41.987359" data-lng="12.554645" zoom="8"></div>
```

You can define your settings in the object passed to the plugin or via HTML data attributes.
Settings passed during initialization will be applied to all maps, but can be overridden by settings passed to specific maps via HTML data attributes.

Required options are:
"key" : must be passed to the plugin during initialization (you can create your API key here: [https://developers.google.com/maps/documentation/javascript/get-api-key])
"data-lat" - "data-lng" : you must set them for each map

## Example

### Basic example

Call the plugin passing it a valid Goole Maps API key.

```javascript
GoMaps.init({
	key: 'AIzaSyAjM5RyImzPiqQvpVeNzFOTRXLWy7tAgrs'
});
```

Place a div with class "gomaps" in your HTML defining Lat, Lng and Zoom level.

```html
<div class="gomap" data-lat="41.987359" data-lng="12.554645" zoom="8"></div>
```

You can have all the maps you want, each one with different settings.

```html
<div class="gomap" data-lat="48.209177" data-lng="16.372882" zoom="8"></div>
<div class="gomap" data-lat="55.948769" data-lng="-3.199956" zoom="8"></div>
<div class="gomap" data-lat="41.899244" data-lng="12.472875" zoom="8"></div>
```

### Advanced example with multiple markers

Call the plugin passing it some options, which will be valid for all the maps in you HTML.

```javascript
GoMaps.init({
	key: 'AIzaSyAjM5RyImzPiqQvpVeNzFOTRXLWy7tAgrs'
	markerIconUrl : 'path/to/my-marker.png',
	mapTypeId : 'satellite',
	disableDefaultUI : true,
	zoom: 8
});
```

Place your divs with class "gomaps" in your HTML overriding settings via data attributes.

```html
<div class="gomap" data-lat="55.948769" data-lng="-3.199956" data-markers="55.950082, -3.154573; 55.940084, -3.178262; 55.964304, -3.220834" data-map-type-control="false" data-clickable-icons="false" data-street-view-control="false" data-map-type-id="terrain" data-zoom-control="false" data-min-zoom="12"></div>
```

## Options

```javascript
key : your Google Maps API key // required
clickableIcons : true,
disableDefaultUI	: false
disableDoubleClickZoom	: false
draggable	: true,
fullscreenControl : true,
keyboardShortcuts	: true,
mapTypeControl : true,
MapTypeId : 'ROADMAP' // other options are 'HYBRID', 'SATELLITE', 'TERRAIN',
maxZoom : number
minZoom : number
rotateControl : true,
scaleControl : false,
scrollwheel : true,
streetViewControl : true,
zoom : 14,
zoomControl : true,
showMarker : true // set to false to hide markers
markerIconUrl : false // path/to/your/marker
```

```html
data-lat
data-lng
data-clickable-icons
data-disable-default-ui
data-disable-double-click-zoom
data-draggable
data-fullscreen-control
data-keyboard-shortcuts
data-map-type-control
data-map-type-id
data-max-zoom
data-min-zoom
data-rotate-control
data-scale-control
data-scrollwheel
data-street-view-control
data-zoom
data-zoom-control
data-show-marker
data-markers (use it to display multiple markers, must be a list of valid lat, lng pairs - eg: "55.950082, -3.154573; 55.940084, -3.178262; 55.964304, -3.220834")
data-marker-icon-url
```

You can learn more about Google Maps options here: [https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapOptions]
