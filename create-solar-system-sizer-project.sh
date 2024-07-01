#!/bin/bash


# Create public directory and files
mkdir public
touch public/index.html
touch public/favicon.ico

# Create src directory and subdirectories
mkdir -p src/components

# Create component files
touch src/components/ApplianceItem.js
touch src/components/ApplianceList.js
touch src/components/TotalConsumption.js
touch src/components/SolarSystemSuggestion.js
touch src/components/EquipmentSuggestion.js

# Create main App files
touch src/App.js
touch src/App.css
touch src/index.js

# Create package.json and README
touch package.json
touch README.md

echo "Project structure created successfully!"
