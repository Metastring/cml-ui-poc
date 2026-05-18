
# CML

A single platform that allows researchers to search and federate datasets from multiple sources (biodiversity, climate, health, etc.), allow ontology mapping, and provide interactive map-based search with filters.

## Tech Stack

### Frontend
- **Framework:** Next.js (v15.3.4)
- **Language:** TypeScript (v5)
- **Styling:** Tailwind CSS (v4) with `tailwind-merge` for class management
- **UI Components:** shadcn/ui, Radix UI (`@radix-ui/react-*`)
- **Icons:** Lucide React
- **State Management:** Zustand
- **Date Handling:** date-fns
- **Notifications:** Sonner

### Maps & Geospatial
- **Map Library:** MapLibre GL (v5.6.0)
- **Drawing & Layers:** Terra Draw, Terra Draw MapLibre GL Adapter, @watergis/maplibre-gl-terradraw

### Data & Queries
- **Data Fetching & Caching:** React Query (`@tanstack/react-query` & devtools)

### Dev Tools
- **Linting:** ESLint (`eslint-config-next`)
- **PostCSS:** @tailwindcss/postcss
- **Animations:** tw-animate-css


## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v20.17.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```bash
# Clone the repository
git clone <repository_url_here>


# Navigate into the project directory
cd <project_directory>


# Install dependencies
npm install

```

### Running the Project

#### To start the development server, run:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

```


Open http://localhost:3000
 in your browser to see the result.


## Environment Variables

Create a `.env.local` file in the root of your project and add the following variables:

```env
# Base URL for Federated Search API
NEXT_PUBLIC_FEDERATED_BASE_URL=your_federated_api_base_url_here

# Optional: CPHR ontology API (GET /ontology/*). When unset, the same URL as
# NEXT_PUBLIC_FEDERATED_BASE_URL is used for ontology requests.
NEXT_PUBLIC_ONTOLOGY_BASE_URL=http://localhost:8000

# Base URL for Map Tiles / Map API
NEXT_PUBLIC_MAP_BASE_URL=your_map_base_url_here
```


## Features

### 1. Federated Search

- Search across all onboarded datasets (biodiversity, climate, health).


- Query across metadata and attributes (common name, scientific name, etc.).


- Users can select fields for search.


### 2. Map Search
- Users can draw polygons and select attributes on the map.


- Based on the drawn region/filters, details are fetched from the backend.


- Map will display points (lat/long) or distribution layers.


### 3. Dataset Onboarding

- Upload datasets via links.


- Provide ontology mapping for uniform representation.


<!-- - Mark datasets as map-data or non-map-data. -->



### 4. Dataset Details


- Display metadata of all registered datasets.


- Include source and other details.


### 5. Pointer/Marker Behavior

- When a marker appears on the map, hovering over it displays key metadata.
- Metadata includes name, type, and relevant attributes.
- Allows users to quickly understand the dataset without opening additional details.



## Use Case

### Use Case 1: Federated Search for Biodiversity Research
A biodiversity researcher wants to find specific data across multiple datasets.

**How Federated Search Works:**
1. **Select Datasets:** The user chooses one or more datasets to search from (e.g., biodiversity, climate, health).
2. **Select Fields:** The user selects the fields/attributes they want to query, such as common name, scientific name, or location.
3. **Enter Search Input:** The user types the search query (e.g., "neem") and enter the search button.
4. **Search Execution:** The platform sends the query to all selected datasets.
5. **Results Display:** The platform aggregates results and presents them in a unified view, including:
   - Tables with relevant metadata
   - Map visualization with points or layers corresponding to the search results

### Use Case 2: Map Search for Biodiversity Research
A biodiversity researcher wants to explore datasets visually on a map to understand spatial patterns of species or environmental data.

**How Map Search Works:**
1. **Select Datasets:** The researcher chooses the datasets to visualize on the map.
2. **Draw Polygon:** They can draw polygons and areas on the map to define the region of interest.
3. **Fetch Data:** The platform queries the selected datasets and fetches records that fall within the selected region and match the filters.
4. **Visualization:**
   - The map displays points, heatmaps, or distribution layers for the results.
   - Hovering over markers shows key metadata (name, type, other attributes).
5. **Interactive Analysis:** The researcher can zoom, pan, and click on map elements to explore data in detail.

### Use Case 3: Dataset Contribution by Researchers

A researcher wants to contribute new datasets to the platform.

**How Dataset Contribution Works:**

#### Step 1: Initial Dataset Registration
- Fill in basic dataset information:
  - Title, Description, Citation, DOI
  - Language, Data Language, License, Keywords
  - Dataset Type and Category
  - Publication Date and Metadata Modified Date
- After completing, click **Next** to move to the final registration step.

#### Step 2: Final Dataset Registration
- Add **Scopes** and **Statistics** for the dataset.
- Provide **Publisher Information** and **Publisher Contacts**.
- Add multiple contacts if needed.
- Click **Submit Dataset** to register the dataset to the platform.

> These two steps ensure the dataset is correctly registered.

---
### Use Case 4: Dataset Exploration by Researchers

A researcher wants to explore existing datasets to analyze patterns, trends, or overlaps between multiple data sources.

**How Dataset Exploration Works:**
1. **Open Dataset Page:** Navigate to the dataset route/page in the application.
2. **Select a Category:** For example, choose "Biodiversity" to explore relevant datasets.
3. **Choose a Dataset:** Click on a specific dataset, such as the "Kew Plant Database."
4. **View Dataset Details:** Check metadata, description, source, contacts, and available fields.

---

## Support

For support, contact: [info@metastringfoundation.org](mailto:info@metastringfoundation.org)
