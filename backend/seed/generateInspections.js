import { readFile, writeFile } from "node:fs/promises";

// Load the sample record shapes.
const samples = JSON.parse(
  await readFile(new URL("./inspectionSample.json", import.meta.url), "utf8"),
);

if (!Array.isArray(samples) || samples.length === 0) {
  throw new Error("inspectionSample.json must contain a non-empty array.");
}

const neighborhoods = [
  "Back Bay",
  "Beacon Hill",
  "Dorchester",
  "East Boston",
  "Jamaica Plain",
];

const restaurantCount = 200;
const inspectionsPerRestaurant = 5;
const inspections = [];

// Keep each restaurant's details consistent.
for (
  let restaurantIndex = 0;
  restaurantIndex < restaurantCount;
  restaurantIndex += 1
) {
  const number = String(restaurantIndex + 1).padStart(3, "0");

  for (
    let inspectionIndex = 0;
    inspectionIndex < inspectionsPerRestaurant;
    inspectionIndex += 1
  ) {
    const sample =
      samples[(restaurantIndex + inspectionIndex) % samples.length];

    // Use fixed dates for repeatable demo data.
    const inspectionDate = new Date(
      Date.UTC(2026, 5 + inspectionIndex, (restaurantIndex % 25) + 1),
    )
      .toISOString()
      .slice(0, 10);

    inspections.push({
      ...sample,
      restaurantId: `demo-rest-${number}`,
      restaurantName: `Demo Restaurant ${number}`,
      neighborhood: neighborhoods[restaurantIndex % neighborhoods.length],
      address: `${101 + restaurantIndex} Example Street`,
      inspectionDate,
      isSynthetic: true,
    });
  }
}

// Save the generated dataset beside this script.
await writeFile(
  new URL("./inspections.generated.json", import.meta.url),
  JSON.stringify(inspections, null, 2) + "\n",
  "utf8",
);

console.log(
  `Generated ${inspections.length} inspections for ${restaurantCount} fictional restaurants.`,
);
