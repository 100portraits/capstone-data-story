## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Components](#components)
  - [ScrollytellingContainer](#scrollytellingcontainer)
  - [PackedCircleChart](#packedcirclechart)
  - [StoryProgress](#storyprogress)
  - [ScrollSection](#scrollsection)
  - [VisualizationSection](#visualizationsection)
  - [HeadlineComparison](#headlinecomparison)
  - [QuoteBlock](#quoteblock)
- [Data Model](#data-model)
- [Main Page](#main-page)
- [Features and Functionality](#features-and-functionality)
- [Getting Started](#getting-started)



## Project Structure

The project is built with SvelteKit and follows this structure:

```
src/
  ├── lib/
  │   ├── components/          # Reusable Svelte components
  │   │   ├── PackedCircleChart.svelte
  │   │   ├── ScrollytellingContainer.svelte
  │   │   ├── StoryProgress.svelte
  │   │   ├── ScrollSection.svelte
  │   │   ├── VisualizationSection.svelte
  │   │   ├── HeadlineComparison.svelte
  │   │   └── QuoteBlock.svelte
  │   └── data.ts               # Data models and generators
  ├── routes/
  │   ├── +page.svelte          # Main page component
  │   ├── +layout.svelte        # App layout
  │   └── api/                  # API routes
  │       └── humanize/         # API for "humanizing" crash data
  └── app.html                  # App HTML template
```

## Components

### ScrollytellingContainer

**Purpose**: The main container for the scrollytelling experience. Manages section visibility, highlight filters, and transitions between story mode and exploration mode.

**Key Props**:
- `showViz`: Boolean to control visualization visibility
- `initViz`: Boolean to control initial visualization state

**State Management**:
- `dots`: Array of Dot objects representing crash data points
- `highlightFatalities`: Filter for dots with fatalities
- `highlightNumberRange`: Filter for dots based on number of people involved
- `activeSectionId`: Currently active section ID
- `explorationMode`: Boolean tracking whether in exploration mode

**Key Functions**:
- `resetFilters()`: Resets all visualization filters
- `highlightDots()`: Sets visualization filters based on params
- `enterExplorationMode()`: Enters exploration mode with animation
- `exitExplorationMode()`: Exits exploration mode and returns to story
- `scrollToSection()`: Scrolls to a specific section by ID

**Event Handling**:
- Uses IntersectionObserver to detect visible sections
- Applies filters based on which section is visible
- Handles exploration mode toggle


### PackedCircleChart

**Purpose**: The core visualization component using D3.js to create a packed circle chart of traffic crashes.

**Key Props**:
- `dots`: Array of Dot objects to visualize
- `width/height`: Dimensions of the visualization
- `highlightFatalities`: Filter for highlighting dots with fatalities
- `highlightNumberRange`: Filter for highlighting dots by casualty count
- `activeSectionId`: ID of active section for highlighting
- `interactive`: Boolean controlling interactive features

**Interfaces**:
- `PackedDot`: Extends Dot interface with D3 required properties (value, r, x, y, data)

**State Management**:
- `selectedDot`: Currently selected dot (if any)
- `humanizedData`: Data for "humanized" headline version
- `isHumanized`: Toggle between original and humanized view
- `zoom`: D3 zoom behavior reference
- `hoveredDot`: Currently hovered dot for tooltip
- `isMobile`: Detects if on mobile device

**Key Functions**:
- `updateChart()`: Main function to redraw the chart, especially on resize
- `renderChart()`: Creates the D3 visualization with packed circles
- `updateHighlighting()`: Applies visual highlighting based on filters
- `resetHighlighting()`: Removes all highlighting
- `resetView()`: Resets zoom and pan to initial state
- `zoomOutView()`: Zooms out for exploration mode
- `handleDotClick()`: Processes dot selection and zoom animation
- `toggleView()`: Toggles between original and humanized views
- `updateVisibleCounts()`: Calculates casualties visible in viewport

### StoryProgress

**Purpose**: Progress indicator at the top(mobile) or right of screen

**Key Props**:
- `sections`: Array of section objects with id and label
- `activeSection`: ID of the currently active section
- `showLabels`: Boolean to toggle label visibility
- `orientation`: "vertical" or "horizontal" layout
- `position`: "left", "right", "top", or "bottom" screen position
- `className`: Additional CSS classes
- `onSectionClick`: Function to handle section navigation

**Key Functions**:
- `handleSectionClick()`: Processes clicks on navigation items


### ScrollSection

**Purpose**: Container for individual story sections with consistent styling.

**Key Props**:
- `id`: Unique section identifier
- `background`: Background color/style
- `fullHeight`: Boolean for full viewport height
- `scrollToMe`: Boolean to trigger scrolling to this section


### VisualizationSection

**Purpose**: Specialized section for displaying visualizations with overlay text.

**Key Props**:
- `id`: Unique section identifier
- `heading`: Section heading text
- `backgroundColor`: Background color
- `boxPosition`: Position of the text overlay box
- `boxOpacity`: Opacity of the text overlay box
- `scrollToMe`: Boolean to trigger scrolling to this section



### HeadlineComparison

**Purpose**: Component for side-by-side comparison of different headlines for the same crash.

**Key Props**:
- `headline1`: First headline text
- `headline2`: Second headline text
- `source1`: Source of first headline
- `source2`: Source of second headline
- `description`: Descriptive text about the comparison


### QuoteBlock

**Purpose**: Component for displaying formatted quotes.

**Key Props**:
- `text`: Quote text content
- `source`: Optional source attribution
- `centered`: Boolean for text alignment
- `size`: "small", "medium", or "large" size option

## Data Model

### Dot Interface

`src/lib/data.ts` -> interface that defines the structure of each crash data point:

```typescript
export interface Dot {
    id: number;
    numberInvolved: number;
    fatalities: boolean;
    headline: string;
    humanized_headline: string;
    x?: number;
    y?: number;
    criteria: {
        criteria1: boolean;
        criteria2: boolean;
        criteria3: boolean;
        criteria4: boolean;
        criteria5: boolean;
    }
}
```

**Data Generation**:
- `generateDots(count: number)`: Function that generates random crash data

## Main Page

The main page (`src/routes/+page.svelte`) organizes the application by:

1. Defining the sections array with IDs and labels
2. Handling section navigation
3. Setting up the ScrollytellingContainer
4. Arranging all story sections in sequence
5. Including progress navigation

**Navigation Logic**:
- Uses IntersectionObserver to detect visible sections
- Updates active section for navigation highlighting
- Provides click handling for navigation items
