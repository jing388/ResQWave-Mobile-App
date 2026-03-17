# Refresh (RESQW-328)

## PR Title
Refresh (RESQW-328): Profile backend connection improvements, map performance updates, Google Maps integration enhancements, navigation logic fixes, and general bug fixes

## Ticket
- RESQW-328

## Overview
This refresh focuses on stability, performance, and UX quality across the mobile app, with emphasis on profile data connectivity, map behavior, and navigation reliability.

## Summary of Changes
- Improved backend connection on the Profile page through dedicated services/endpoints/API integration.
- Improved Map page performance and behavior consistency.
- Added deeper Google Maps integration, including:
  - Coordinate links that can open in Google Maps
  - Keyboard-aware dynamic dropdown sizing for location search
  - Improved visual distinction for assigned neighborhood pins and related UI (green accent for own neighborhood)
- Improved mobile navigation logic to avoid overlapping sheets and UI glitches.
- Applied several bug fixes and quality-of-life enhancements.

## Scope Map (Feature -> Files)
- Profile backend connection/refetch:
  - app/profile/index.tsx
  - services/user-service.ts
- Map drawer orchestration and tab navigation handling:
  - app/(tabs)/index.tsx
  - app/(tabs)/_layout.tsx
  - lib/map-style-sheet-controller.ts
- Map info drawer visuals/behavior:
  - components/main/info-sheet.tsx
- Map style drawer stability:
  - components/main/map-style-sheet.tsx
- Search dropdown keyboard-safe behavior and assigned-neighborhood styling:
  - components/ui/location-search-field.tsx
- Supporting UI/perf/config touches:
  - app.config.js
  - app/_layout.tsx
  - app/chatbot/index.tsx
  - components/ui/bottom-button-container.tsx
  - tsconfig.json

## Detailed Changes

### 1) Profile: Backend Connection Reliability
- Refined profile data fetching and image preparation flow.
- Improved handling around profile avatar loading and refresh triggers.
- Reduced failure points by routing profile usage through service-level logic.

### 2) Map: Performance and UX Stability
- Refined map sheet open/close coordination to avoid conflicting interactions.
- Improved handling between map interactions, tab switching, and sheet animations.
- Stabilized map-related drawer behavior to reduce accidental upward expansion and inconsistent states.

### 3) Google Maps + Coordinates Integration
- Added tappable coordinate links with confirmation dialog before opening Google Maps.
- Added external-link visual cues for coordinate actions.
- Extended coordinate-link behavior to relevant drawer/header surfaces for consistency.

### 4) Search Dropdown Improvements
- Implemented keyboard-aware dynamic dropdown height to prevent overlap with system keyboard.
- Kept list scrolling, tap handling, and neighborhood redirect behavior intact.
- Preserved search filtering and selection UX while adapting layout responsively.

### 5) Assigned Neighborhood Visual Distinction
- Applied exclusive green accenting for assigned neighborhood elements.
- Updated map Info drawer accents for assigned neighborhood state.
- Updated search dropdown item styling (icon/text/selected state) for assigned neighborhood clarity.

### 6) Navigation and Drawer Logic Hardening
- Improved cross-tab close behavior so active drawers close with expected animation before navigation.
- Centralized/streamlined map-style drawer close coordination.
- Reduced overlapping sheet scenarios and side effects during rapid interactions.

## Developer Review Guide

### Priority Review Areas
- Verify profile data and avatar loading path uses the intended service/API flow.
- Validate map drawer state transitions when interacting with:
  - map press
  - search open
  - profile tap
  - tab switch (Map/Info/Reports)
- Confirm assigned neighborhood color semantics remain exclusive:
  - own neighborhood: green
  - other neighborhoods: blue

### End-to-End Test Scenarios
1. Open Map -> tap Layers -> swipe/drag interactions should be stable (no unintended upward expansion state).
2. Open Search -> keyboard appears -> dropdown should resize and remain scrollable.
3. Select a neighborhood from dropdown -> map should focus and open corresponding neighborhood details.
4. Tap assigned neighborhood -> info drawer signal/share accents should be green.
5. Tap non-assigned neighborhood -> info drawer accents should remain blue.
6. Tap coordinate link -> confirmation dialog appears -> Open Maps launches Google Maps.
7. With any sheet open, switch tabs -> active sheet closes first, then navigation proceeds.

### Acceptance Criteria
- No dropdown/keyboard overlap on common screen sizes.
- No sheet overlap or stuck/open state when switching tabs quickly.
- No regression to map marker interaction and detail display.
- Assigned neighborhood is consistently distinguishable from other neighborhoods.
- No lint errors on touched files.

## Key Files Updated
- app.config.js
- app/(tabs)/_layout.tsx
- app/(tabs)/about-neighborhood.tsx
- app/(tabs)/index.tsx
- app/_layout.tsx
- app/chatbot/index.tsx
- app/profile/index.tsx
- components/main/info-sheet.tsx
- components/main/map-style-sheet.tsx
- components/ui/bottom-button-container.tsx
- components/ui/location-search-field.tsx
- services/user-service.ts
- tsconfig.json
- lib/map-style-sheet-controller.ts (new)

## Screenshots (To Be Added)

### A) Profile Backend/Connection Updates
- [ ] Add screenshot(s) showing updated profile data/avatar load behavior

### B) Map Drawer and Navigation Behavior
- [ ] Add screenshot(s) showing stable map-style drawer behavior
- [ ] Add screenshot(s) showing close-with-animation behavior on tab switch

### C) Google Maps Coordinate Integration
- [ ] Add screenshot(s) of coordinate link + confirmation dialog
- [ ] Add screenshot(s) of successful Google Maps handoff

### D) Search Dropdown Keyboard Handling
- [ ] Add screenshot(s) showing dropdown not overlapping system keyboard
- [ ] Add screenshot(s) showing scroll still functional with keyboard open

### E) Assigned Neighborhood Distinction
- [ ] Add screenshot(s) showing assigned neighborhood in green on map drawer
- [ ] Add screenshot(s) showing assigned neighborhood row in green in search dropdown

## QA Checklist
- [ ] Profile page loads data correctly with no broken states
- [ ] Profile avatar loads/refetches as expected
- [ ] Map initially focuses correctly and remains responsive
- [ ] Map-style drawer opens/closes consistently
- [ ] No accidental upward drawer expansion from unintended swipes
- [ ] Tab switching closes active sheets with proper animation
- [ ] Coordinates are tappable and open Google Maps after confirmation
- [ ] Search dropdown avoids keyboard overlap
- [ ] Search dropdown remains scrollable while keyboard is open
- [ ] Selecting a dropdown item redirects to the correct neighborhood
- [ ] Assigned neighborhood visuals are green; other neighborhoods remain blue
- [ ] No regressions observed on Info/Reports/Map tab flows

## Risks / Notes
- UI interaction flows were adjusted across map, sheets, and navigation; please regression-test edge cases with rapid taps/swipes.
- Validate behavior across multiple device sizes due to keyboard and dynamic dropdown calculations.

## Rollback Plan
- Revert this branch commit to restore previous sheet/dropdown behavior.
- If partial rollback is needed, revert in this order:
  1. map-style sheet controller and tab-close orchestration
  2. map/search UI styling and keyboard-aware dropdown sizing
  3. profile connection changes

## Commit Message
Refresh (RESQW-328):
- Improved backend connection on the Profile Page through its' own services, endpoints and APIs.
- Improved performance for the Map Page.
- Deeper integration with Google Maps for features such as coordinated links, dynamic dropdown list and improved distinguishment for assigned pins (highlighted in green)
- Improved logic for mobile app navigation to avoid overlapping and possible glitches.
- Several bug fixes and enhancements.
