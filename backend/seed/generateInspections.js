import { readFile, writeFile } from "node:fs/promises";

const restaurantCount = 200;
const inspectionsPerRestaurant = 5;

const neighborhoods = new Set([
  "Back Bay",
  "Beacon Hill",
  "Dorchester",
  "East Boston",
  "Jamaica Plain",
]);

// Load the inspection templates and saved restaurant profiles.
const samples = JSON.parse(
  await readFile(new URL("./inspectionSample.json", import.meta.url), "utf8"),
);

const profiles = JSON.parse(
  await readFile(
    new URL("./restaurants.mockaroo.json", import.meta.url),
    "utf8",
  ),
);

if (!Array.isArray(samples) || samples.length === 0) {
  throw new Error("inspectionSample.json must contain a non-empty array.");
}

if (!Array.isArray(profiles) || profiles.length !== restaurantCount) {
  throw new Error(
    "restaurants.mockaroo.json must contain exactly 200 profiles.",
  );
}

const restaurantNumbers = new Set();
const inspections = [];

for (const profile of profiles) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new Error("Each restaurant profile must be an object.");
  }

  const { restaurantNumber, restaurantName, neighborhood, address } = profile;

  if (
    !Number.isInteger(restaurantNumber) ||
    restaurantNumber < 1 ||
    restaurantNumber > restaurantCount ||
    restaurantNumbers.has(restaurantNumber)
  ) {
    throw new Error(
      "Restaurant numbers must be unique integers from 1 to 200.",
    );
  }

  if (
    [restaurantName, neighborhood, address].some(
      (value) => typeof value !== "string" || value.trim().length === 0,
    )
  ) {
    throw new Error(`Restaurant ${restaurantNumber} has missing profile text.`);
  }

  if (!neighborhoods.has(neighborhood)) {
    throw new Error(
      `Restaurant ${restaurantNumber} has an unknown neighborhood.`,
    );
  }

  restaurantNumbers.add(restaurantNumber);

  // Preserve the existing ID, date, and inspection-template mapping.
  const restaurantIndex = restaurantNumber - 1;
  const number = String(restaurantNumber).padStart(3, "0");

  for (
    let inspectionIndex = 0;
    inspectionIndex < inspectionsPerRestaurant;
    inspectionIndex += 1
  ) {
    const sample =
      samples[(restaurantIndex + inspectionIndex) % samples.length];

    const inspectionDate = new Date(
      Date.UTC(2026, 5 + inspectionIndex, (restaurantIndex % 25) + 1),
    )
      .toISOString()
      .slice(0, 10);

    // Use the same profile for every inspection of this restaurant.
    inspections.push({
      ...sample,
      restaurantId: `demo-rest-${number}`,
      restaurantName: restaurantName.trim(),
      neighborhood,
      address: address.trim(),
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
  `Generated ${inspections.length} inspections for ${restaurantCount} fictional restaurants using Mockaroo profiles.`,
);
