# Itinerary List Debug Guide

## Issues Fixed:

### 1. **Zustand Infinite Loop Error**
**Problem**: `getSnapshot should be cached` error causing infinite re-renders
**Solution**: Replaced destructuring with proper Zustand selectors
```tsx
// Before (causing infinite loop)
const { itineraries, isItineraryLoading, getUserItineraries, deleteItinerary } = useAppStore();

// After (using selectors)
const itineraries = useAppStore(state => state.itineraries || []);
const isItineraryLoading = useAppStore(state => state.isItineraryLoading || false);
const getUserItineraries = useAppStore(state => state.getUserItineraries);
const getItineraryById = useAppStore(state => state.getItineraryById);
const deleteItinerary = useAppStore(state => state.deleteItinerary);
```

### 2. **Fetch Full Itinerary Details on Card Click**
**Problem**: Only partial itinerary data available in list view
**Solution**: Added `handleItineraryPress` function that calls `getItineraryById` before displaying

### 3. **Field Name Inconsistency**
**Problem**: Using `id` vs `_id` inconsistently
**Solution**: Updated slice functions to use `_id` consistently (MongoDB standard)

### 4. **Loading States**
**Added**: Loading indicator when fetching individual itinerary details
**Added**: Proper error handling for API calls

## Testing Steps:

1. **Open the app and navigate to Explore tab**
2. **Click on the menu button and select "My Itineraries"**
3. **Verify that the itinerary list loads without infinite loop error**
4. **Click on any itinerary card**
5. **Verify that it shows "Loading..." briefly**
6. **Verify that the full itinerary details display properly**
7. **Check that all sections (Overview, Itinerary, Tips, Budget) work**

## Expected Behavior:

- ✅ No infinite loop errors
- ✅ Itinerary list loads properly
- ✅ Clicking on card fetches full details via `getItineraryById`
- ✅ Loading states work properly
- ✅ Full itinerary displays with all details
- ✅ Delete functionality works with correct field names

## Common Issues to Watch For:

1. **Network Issues**: Check if backend API is running
2. **Authentication**: Ensure user is logged in
3. **Data Structure**: Check if backend returns expected fields
4. **Field Names**: Ensure consistency between `_id` and `id` usage