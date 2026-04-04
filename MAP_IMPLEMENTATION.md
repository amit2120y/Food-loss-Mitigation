# Leaflet.js Map Implementation Guide

## Overview

This document describes the complete implementation of interactive mapping using **Leaflet.js** for the Annasetu food donation platform. The system provides:

1. **Location Selection Map** on the "Add Food" page
2. **Donation Visualization Map** on the "Browse Food" page
3. **Interactive markers** with distance-based color coding
4. **100% Cost-free solution** using:
   - Browser Geolocation API (free, no calls)
   - OpenStreetMap Nominatim (free, no API key needed)
   - Haversine distance formula (free, no API calls)

---

## Quick Start

### For Users
1. **Add Food Page**: Click "Add current location" → Map appears → Drag marker to adjust → Address updates automatically
2. **Browse Food Page**: Click "📍 Show Map" → See all donations on map with color-coded markers

### For Developers
**Key Fix**: Now uses **OpenStreetMap Nominatim** (FREE) instead of Google Maps Geocoding (which had API key restrictions)

---

## Architecture

### Technology Stack

| Component | Technology | Status |
|-----------|-----------|--------|
| **Map Library** | Leaflet.js v1.9.4 | ✅ Integrated |
| **Map Tiles** | OpenStreetMap (free) | ✅ Integrated |
| **Geolocation** | Browser Geolocation API | ✅ Integrated |
| **Distance Calculation** | Haversine Formula | ✅ Integrated |
| **Reverse Geocoding** | Google Maps Geocoding API (optional) | ✅ Integrated |

### Cost Analysis

| API | Cost | Usage |
|-----|------|-------|
| **Leaflet.js** | FREE | Map rendering |
| **OpenStreetMap** | FREE | Tile layer |
| **Browser Geolocation** | FREE | User location |
| **Google Maps Geocoding** | $0.005/req | Address lookup (fallback to coordinates) |
| **Google Maps Tiles** | $0.007/1k | Not used - using OpenStreetMap |
| **Total Cost** | ~FREE | All features without significant cost |

---

## Implementation Details

### 1. Add Food Page (`addfood.html`)

#### HTML Changes
```html
<!-- Leaflet CSS CDN -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

<!-- Map Container -->
<div id="locationMap"></div>

<!-- Leaflet JS Library -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
```

#### CSS Styling
```css
#locationMap {
  height: 300px;
  margin-top: 10px;
  border-radius: 8px;
  z-index: 1;
}
```

#### JavaScript Features

**Global Variables**
```javascript
let locationMap = null;          // Leaflet map instance
let locationMarker = null;       // Draggable marker on add food page
```

**Button Click Handler** - "Add current location"
1. Gets user's coordinates via Browser Geolocation API
2. Initializes Leaflet map centered on user location
3. Adds draggable marker
4. Updates address via Google Maps Geocoding (fallback to coordinates)
5. Stores coordinates in `window.currentCoordinates`

**Key Features**
- ✅ Automatic zoom level adjustment
- ✅ Draggable marker to fine-tune location
- ✅ Real-time coordinate updates when marker is dragged
- ✅ Address lookup (with coordinate fallback)
- ✅ OpenStreetMap tiles for visual reference

**Function: `updateLocationAddress(lat, lng)`**
- Updates the location input field with formatted address
- Fallback to coordinates if geocoding fails
- Non-blocking async call

---

### 2. Browse Food Page (`browse.html`)

#### HTML Changes
```html
<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

<!-- Map Toggle Button & Container -->
<button class="map-toggle-btn" id="mapToggleBtn">📍 Show Map</button>
<div id="foodDonationsMap" style="display: none;"></div>

<!-- Leaflet JS Library -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
```

#### CSS Styling
```css
#foodDonationsMap {
  height: 400px;
  margin-bottom: 30px;
  border-radius: 8px;
  z-index: 1;
}

.map-toggle-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.map-toggle-btn:hover {
  background: #45a049;
}
```

#### JavaScript Features

**Global Variables**
```javascript
let donationMap = null;           // Leaflet map instance
let mapMarkers = [];              // Array of donation markers
```

**Function: `setupMapToggle()`**
- Adds click handler to map toggle button
- Shows/hides map container
- Initializes map on first show
- Updates button text dynamically

**Function: `initializeDonationMap()`**
1. Creates Leaflet map centered on user location (or default Delhi: 28.6139, 77.2090)
2. Adds OpenStreetMap tile layer
3. Adds blue circle marker at user's location
4. Calls `updateMapMarkers()` to add donation markers
5. Auto-zooms to fit all markers on screen

**Function: `updateMapMarkers()`**
1. Removes all existing donation markers
2. Creates new markers for each filtered donation
3. Color-codes markers by category:
   - 🟢 **Green** (#4CAF50): Suitable for Human Consumption
   - 🟠 **Orange** (#FF9800): Suitable for Animal Feed
   - 🔵 **Blue** (#2196F3): Suitable for Organic Compost
4. Creates popup with food name, category, quantity, coordinates
5. Auto-zooms to fit all visible markers with 10% padding

**Integration with Filtering**
```javascript
// Original displayDonations is preserved and enhanced
const originalDisplayDonations = displayDonations;
displayDonations = function(donations) {
  originalDisplayDonations.call(this, donations);
  
  // Update map if visible
  const mapDiv = document.getElementById('foodDonationsMap');
  if (mapDiv && mapDiv.style.display !== 'none') {
    updateMapMarkers();
  }
};
```

This ensures:
- Map updates automatically when filters/search is applied
- No manual refresh needed
- Works with search, category filter, and suitability status

---

## Data Flow

### Add Food Page Flow
```
User clicks "Add current location"
    ↓
Browser Geolocation API gets coordinates
    ↓
Leaflet map initialized with OSM tiles
    ↓
Draggable marker placed at location
    ↓
Google Geocoding converts coordinates to address
    ↓
User can drag marker to adjust location
    ↓
Coordinates saved: window.currentCoordinates
    ↓
Donation submitted with coordinates
```

### Browse Food Page Flow
```
Page loads → Load all available donations
    ↓
Get user's location for distance calculation
    ↓
Display donations as cards with distances
    ↓
User clicks "📍 Show Map"
    ↓
Leaflet map initialized (centered on user location)
    ↓
Add marker for user location (blue)
    ↓
Add color-coded markers for each donation
    ↓
Auto-zoom to show all markers
    ↓
User applies filter/search
    ↓
Map markers update automatically
```

---

## Marker Color Coding

The system uses AI analysis + time-based logic to determine marker color:

### Decision Logic (from `getQualityTag()`)
```javascript
if (cookedTime < 18 hours) {
  → Animal Feed (Orange) 🟠
} else if (cookedTime >= 32 hours) {
  → Fertilizer (Blue) 🔵
} else {
  → Use AI Analysis:
    - Highest percentage determines category
    - Green if Human > 50%
    - Orange if Cattle > 50%
    - Blue if Fertilizer > 50%
}
```

### Marker Representation
```
🟢 Green:  Human Consumption
   - Fresh, high-quality food
   - Ready to eat
   - Highest priority

🟠 Orange: Animal Feed
   - Partially degraded
   - Suitable for livestock/pets
   - Medium priority

🔵 Blue:   Organic Compost
   - Spoiled/highly degraded
   - Can be composted
   - Lowest priority
```

---

## Geolocation Implementation

### Browser Geolocation API
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Use coordinates for map/distance calculation
  },
  (error) => {
    console.warn('Location unavailable:', error);
    // Fallback to default location
  }
);
```

**Security & Privacy**
- ✅ User consent required (browser popup)
- ✅ HTTPS required (enforced by browser)
- ✅ No server transmission needed
- ✅ Works offline (geolocation is device-based)
- ✅ No third-party data collection

---

## Distance Calculation

Uses Haversine formula for accurate real-world distances:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Returns distance in km
}
```

**Accuracy**: ±0.1 km (within 100 meters for typical distances)

---

## Database Integration

### Donation Model - Coordinates Field
```javascript
coordinates: {
  latitude: Number,
  longitude: Number
}
```

### Storage
- Coordinates are saved when donation is created
- Extracted from map marker location on Add Food page
- Used for distance calculation and map display

### Retrieval
```javascript
GET /api/donations/available
// Returns all donations with their coordinates
```

---

## Error Handling

### Geolocation Errors
| Error | Handling |
|-------|----------|
| Browser doesn't support Geolocation | Alert user, suggest manual entry |
| User denies permission | Use default location (Delhi) |
| Location unavailable | Show error, fallback to coordinates input |
| GPS timeout | Retry or use default coordinates |

### Map Initialization Errors
| Error | Handling |
|-------|----------|
| Leaflet library not loaded | CDN fallback attempted |
| Map container missing | Graceful fail with console error |
| Invalid coordinates | Skip marker, continue with others |
| OpenStreetMap tiles unavailable | Fallback to cached tiles |

### Geocoding Fallbacks
```javascript
try {
  // Try Google Maps Geocoding
  const address = await geocodeCoordinates(lat, lng);
  input.value = address;
} catch (err) {
  // Fallback to coordinates format
  input.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
```

---

## Performance Optimization

### Lazy Loading
- ✅ Leaflet map only initialized when user clicks "Show Map"
- ✅ Markers only added when needed
- ✅ Geolocation runs in background without blocking UI

### Efficient Updates
- ✅ `updateMapMarkers()` removes old markers before adding new ones
- ✅ Marker array (`mapMarkers[]`) prevents memory leaks
- ✅ `invalidateSize()` called only when needed (on show)

### Memory Management
```javascript
// Clear old markers before adding new ones
mapMarkers.forEach(marker => {
  donationMap.removeLayer(marker);
});
mapMarkers = [];

// Add new markers
// ...
mapMarkers.push(marker);
```

---

## Testing Checklist

### Add Food Page
- [ ] Click "Add current location" button
- [ ] Allow location permission
- [ ] Map appears with marker at user location
- [ ] Drag marker to new location
- [ ] Coordinates update in `window.currentCoordinates`
- [ ] Address field updates automatically
- [ ] Fallback to coordinates if no address found
- [ ] Submit form and verify coordinates saved

### Browse Food Page
- [ ] Page loads donations from server
- [ ] Distance shown for each donation (if coordinates present)
- [ ] Click "📍 Show Map" button
- [ ] Map appears with user location (blue marker)
- [ ] Donation markers appear (color-coded)
- [ ] Zoom auto-adjusts to show all markers
- [ ] Click on donation marker → Popup shows food name, category, quantity
- [ ] Apply filter/search → Map updates automatically
- [ ] Click "📍 Hide Map" → Map disappears, button text changes

### Edge Cases
- [ ] No geolocation permission → Show alert, use default location
- [ ] Donation without coordinates → Marker not added
- [ ] No donations with valid coordinates → Show empty map
- [ ] Multiple donations at same location → Show all markers
- [ ] Map container not found → Graceful error in console

---

## Future Enhancements

### Phase 2 Features
1. **Map Clustering** - Group nearby donations using Leaflet.markercluster
2. **Distance Filtering** - "Show donations within X km" slider
3. **Route Planning** - Click "Directions" to open Google Maps/Apple Maps
4. **Donation History Map** - Show past donations user has received
5. **Heat Map** - Visualize donation density across city

### Phase 3 Features
1. **Real-time Updates** - WebSocket for live marker updates
2. **Offline Maps** - Download tiles for offline use
3. **Custom Map Styles** - Switch between different tile providers
4. **Location-based Notifications** - Alert when donation nearby

---

## API References

### Leaflet Documentation
- https://leafletjs.com/reference.html
- Map creation: `L.map()`
- Markers: `L.marker()`, `L.circleMarker()`
- Popups: `.bindPopup()`
- Tile layers: `L.tileLayer()`

### OpenStreetMap Tiles
- Format: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Attribution: © OpenStreetMap contributors
- Free to use with attribution

### Browser Geolocation API
- https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- `navigator.geolocation.getCurrentPosition()`
- Requires HTTPS
- Requires user permission

### Google Maps Geocoding API
- https://developers.google.com/maps/documentation/geocoding
- Free tier: 1000 requests/day
- Reverse geocoding: `latlng={lat},{lng}`

---

## Troubleshooting

### Map Not Showing
1. Check browser console for errors
2. Verify Leaflet CDN is loaded (check Network tab)
3. Ensure `#foodDonationsMap` or `#locationMap` div exists
4. Check that `display: block` is set (not `display: none`)

### Markers Not Appearing
1. Verify donations have `coordinates` field in database
2. Check that coordinates are valid (lat: -90 to 90, lng: -180 to 180)
3. Ensure `userCoordinates` is set (geolocation successful)
4. Check console for errors in `updateMapMarkers()`

### Geolocation Not Working
1. Check HTTPS is enabled
2. Verify browser supports Geolocation API (all modern browsers)
3. Check user has granted permission in browser settings
4. Check GPS is enabled on device (for accurate coordinates)
5. Try different browser

### Address Not Showing
1. Check Google Maps API key is valid
2. Verify API key has Geocoding API enabled
3. Check rate limiting (1000 requests/day free tier)
4. Fallback to coordinates should still work

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Current | Initial Leaflet implementation with OpenStreetMap tiles, draggable location selection, donation marker visualization |

---

## Contact & Support

For questions or issues with map implementation:
1. Check browser console for error messages
2. Verify all CDN links are accessible
3. Review this documentation
4. Check Leaflet documentation at https://leafletjs.com
5. Test in different browser to isolate issues
