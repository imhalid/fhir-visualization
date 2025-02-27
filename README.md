# FHIR TypeScript Visualization

This project provides a 3D interactive visualization of FHIR (Fast Healthcare Interoperability Resources) TypeScript interfaces, helping developers better understand the relationships between different data types.

## Overview

This application parses TypeScript interface definitions from FHIR resources and generates a 3D force-directed graph visualization. The visualization helps to understand the structure and relationships between different FHIR data types.

## Features

- Parse TypeScript interface definitions
- Generate interactive 3D visualization of data structures
- Display relationships between interfaces and their properties
- Show detailed information about each node on hover

## Project Structure

```
ts-node/
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── script.ts           # TypeScript parser that generates JSON from .d.ts files
├── src/
│   ├── App.tsx         # React component for 3D visualization
│   └── App.css         # Styling for the application
├── r4b.d.ts            # FHIR TypeScript definitions (you need to create this)
└── output.json         # Generated output from script.ts
```

## Prerequisites

- Node.js (v14 or newer)
- NPM or Yarn

## Setup Instructions

1. Clone this repository
2. Install dependencies:

```bash
pnpm install
```

3. Create or obtain a FHIR TypeScript definitions file (`r4b.d.ts`) and place it in the project root

## Usage

### Generate JSON Data

Run the parser to convert TypeScript definitions to JSON:

```bash
pnpm run generate
```

This will process the `r4b.d.ts` file and generate `output.json`.

### Run the Visualization

Start the development server:

```bash
pnpm run dev
```

The application will be available at http://localhost:5173

### Building for Production

```bash
pnpm run build
```

## How It Works

1. `script.ts` parses TypeScript interface definitions from the FHIR specification
2. It extracts interface names, descriptions, properties, and relationships
3. The parser generates a JSON structure with nodes and links
4. `App.tsx` uses react-force-graph-3d to render an interactive 3D visualization

## Technologies Used

- TypeScript
- React
- react-force-graph-3d (based on Three.js)
- Vite
