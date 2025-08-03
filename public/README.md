# Public Assets

This directory contains static assets for the MedChain AI Forecasting application.

## Required Files

### Background Video
- **File**: `background.mp4`
- **Location**: `/public/background.mp4`
- **Description**: A looping background video that plays behind the main content across the entire website
- **Format**: MP4
- **Recommended**: Abstract, medical/pharmaceutical themed, subtle animation
- **Size**: Optimize for web (compress to reduce file size)

### Logo
- **File**: `medchain-logo.png`
- **Location**: `/public/medchain-logo.png`
- **Description**: MedChain company logo displayed at the top of the page
- **Format**: PNG (with transparency preferred)
- **Size**: Recommended height: 64px (will scale proportionally)
- **Style**: Should work well on dark backgrounds

## File Structure
```
public/
├── background.mp4         # Background video file
├── medchain-logo.png      # Company logo
└── README.md             # This file
```

## Notes
- Both files are optional - the application will work without them
- The logo will be hidden if the file doesn't exist
- The background video will fall back to the gradient background if not found
- Ensure files are optimized for web performance
- The background video is now applied to the entire website via the root layout 