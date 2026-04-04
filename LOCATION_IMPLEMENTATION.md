# Location-Based Distance Calculation Implementation Guide

## Overview
This document explains the location-based distance calculation feature implemented in the Food Loss Mitigation app.

## Architecture

### **Components**

1. **Frontend (Add Food Page)**
   - Uses HTML5 Geolocation API to get user's current coordinates
   - Uses Google Maps Geocoding API to convert coordinates to human-readable addresses
   - Stores coordinates in donation object before saving

2. **Backend (Database)**
   - Stores coordinates (latitude, longitude) with each donation
   - Donation model includes optional `coordinates` field

3. **Frontend (Browse Food Page)**
   - Gets user's current location on page load
   - Calculates real-time distance using Haversine formula
   - Displays distance in km on each food card

4. **Distance Calculator Utility**
   - Server-side utility for distance calculations (optional for future use)
   - Haversine formula implementation for accurate earth-surface distance

---

## Implementation Details

### **Step 1: Get Current Location (Add Food)**

**File:** `addfood.html`

```javascript
// When user clicks "Add current location" button
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  
  // Save coordinates globally
  window.currentCoordinates = { latitude, longitude };
  
  // Convert to address using Google Maps Geocoding API
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=API_KEY`
  );
  
  // Display address in location input
  locationInput.value = address;
});
```

**Features:**
- User's browser requests permission to access location
- Coordinates are stored as: `{ latitude, longitude }`
- Address is converted using Google Maps Geocoding API
- User can see human-readable address (e.g., "123 Main St, Delhi")

---

### **Step 2: Save Coordinates to Database**

**File:** `addfood.html` (Form Submission)

```javascript
const donation = {
  food: foodName,
  location: "123 Main St, Delhi",
  coordinates: { latitude: 28.7041, longitude: 77.1025 },
  // ... other fields
};
```

**Database Model:** `donation.js`

```javascript
coordinates: {
  latitude: Number,
  longitude: Number
}
```

---

### **Step 3: Calculate Distance (Browse Food)**

**File:** `browse.js`

```javascript
// Get user's location when page loads
navigator.geolocation.getCurrentPosition((position) => {
  userCoordinates = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };
});

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Display on card
<span>🗺️ 2.3 km away</span>
```

---

## API Keys Required

### **Google Maps Geocoding API**
- **Purpose:** Convert coordinates to addresses
- **Cost:** $0.005 per request (first 1000 free)
- **Setup:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Enable "Geocoding API"
  3. Create an API key
  4. Add to `addfood.html`: `const googleMapsApiKey = 'YOUR_KEY'`

### **Alternative (Free): OpenStreetMap**
Replace Google Maps with Nominatim (free):

```javascript
const response = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
);
```

---

## How It Works - User Flow

### **For Food Donor:**
1. Click "Add current location" button on Add Food page
2. Browser asks for permission (user clicks "Allow")
3. Address appears automatically (e.g., "Delhi, India")
4. Coordinates saved when food is donated

### **For Food Receiver:**
1. Browse Food page loads
2. Browser asks for permission (user clicks "Allow")
3. For each food item, distance is calculated:
   - `Distance = Haversine(User's Location, Food Donor's Location)`
4. Distance displayed as: **"2.3 km away"**

---

## Technical Specifications

### **Haversine Formula**
- Calculates shortest distance between two points on Earth
- Accounts for Earth's curvature
- Accuracy: ±0.5% for distances up to 20,000 km
- Formula: `d = 2R × arcsin(√[sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)])`

### **Geolocation API Browser Support**
- ✅ Chrome, Firefox, Safari, Edge (modern versions)
- ❌ Requires HTTPS (except localhost for testing)
- ❌ User must grant permission

### **Google Maps Geocoding API Accuracy**
- Street-level accuracy for most addresses
- Accuracy varies by region (95%+ in developed countries)

---

## Cost Analysis

| Method | Cost | Accuracy | Speed |
|--------|------|----------|-------|
| **Google Maps** | $0.005/req | 95%+ | 100-200ms |
| **OpenStreetMap** | Free | 90%+ | 300-500ms |
| **Haversine Only** | Free | 99.9% | 1-5ms |

**Recommendation:** Use Haversine for distance (free) + OpenStreetMap for addresses (free)

---

## Future Enhancements

### **1. Real-Time Distance Sorting**
```javascript
availableDonations.sort((a, b) => {
  const distA = calculateDistance(userLat, userLon, a.coordinates.latitude, a.coordinates.longitude);
  const distB = calculateDistance(userLat, userLon, b.coordinates.latitude, b.coordinates.longitude);
  return distA - distB;
});
```

### **2. Distance-Based Filtering**
```javascript
// Show only food within 5 km
const nearbyFood = availableDonations.filter(donation => {
  const distance = calculateDistance(...);
  return distance <= 5;
});
```

### **3. Google Maps Integration**
```javascript
// Show food locations on map
const map = new google.maps.Map(element, options);
availableDonations.forEach(donation => {
  new google.maps.Marker({
    position: { lat: donation.coordinates.latitude, lng: donation.coordinates.longitude },
    map: map,
    title: donation.food
  });
});
```

### **4. Distance-Based Notifications**
```javascript
// Notify user when food within 2 km becomes available
if (distance <= 2) {
  showNotification(`Food available: ${donation.food} - ${distance.toFixed(1)} km away`);
}
```

---

## Testing

### **Test Case 1: Add Food with Location**
```
1. Go to "Add Food" page
2. Click "Add current location"
3. Browser shows location request
4. Click "Allow"
5. Address should appear in location field
6. Submit form
7. Check database for coordinates saved
```

### **Test Case 2: View Distance in Browse**
```
1. Go to "Browse Food" page
2. Browser shows location request
3. Click "Allow"
4. Each food card should show "X.X km away"
5. Distance should update based on your location
```

---

## Troubleshooting

### **Issue: "Distance N/A" showing**
- **Cause:** User hasn't granted location permission
- **Solution:** User needs to click "Allow" on browser permission dialog

### **Issue: Address not appearing**
- **Cause:** Google Maps API key missing or invalid
- **Solution:** Add valid API key to `addfood.html`

### **Issue: Inaccurate distances**
- **Cause:** GPS accuracy is low (typically ±5-30 meters)
- **Solution:** Use Google Maps Distance Matrix API for street-based routing

### **Issue: HTTPS required warning**
- **Cause:** Geolocation requires secure connection
- **Solution:** Only issue on localhost; deploy to HTTPS in production

---

## Summary

✅ **Implemented:**
- HTML5 Geolocation for current location
- Google Maps Geocoding for address conversion
- Haversine formula for accurate distance calculation
- Real-time distance display on food cards
- Database storage of coordinates

✅ **Benefits:**
- Users can find food near them
- Transparent distance information
- No manual location entry needed
- Secure and private

✅ **Next Steps:**
- Test with multiple users
- Add distance-based filtering
- Integrate with notifications
- Add map view
