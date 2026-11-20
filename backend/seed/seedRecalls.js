import { client, db } from "../db/connection.js";

const NUM_RECALLS = 1200;

const CATALOG = {
  Produce: {
    products: [
      "Baby Spinach",
      "Romaine Lettuce",
      "Cilantro",
      "Salad Mix",
      "Peppers",
      "Kale",
      "Brussels Sprouts",
      "Strawberries",
    ],
    sizes: [
      "each",
      "1 bunch",
      "16 oz bag",
      "1 lb",
      "2 lb bag",
      "3 lb bag",
      "5 lb bag",
    ],
  },
  Dairy: {
    products: [
      "Whole Milk",
      "Shredded Mozzarella",
      "Greek Yogurt",
      "Cream Cheese",
      "Cheddar Cheese",
    ],
    sizes: ["8 oz", "16 oz", "32 oz", "half gallon", "1 gallon"],
  },
  Meat: {
    products: [
      "Ground Beef",
      "Chicken Breasts",
      "Pork Sausage",
      "Beef Jerky",
      "Hot Dogs",
      "Bacon",
    ],
    sizes: ["12 oz", "1 lb", "2 lb", "3 lb family pack"],
  },
  Seafood: {
    products: [
      "Smoked Salmon",
      "Canned Tuna",
      "Crab Meat",
      "Fish Sticks",
      "Cooked Shrimp",
    ],
    sizes: ["4 oz", "6 oz can", "12 oz", "2 lb bag"],
  },
  Bakery: {
    products: [
      "Bread",
      "Bagels",
      "Blueberry Muffins",
      "Almond Cookies",
      "Flour Tortillas",
    ],
    sizes: ["6 count", "12 count", "20 oz loaf", "24 oz"],
  },
  Snacks: {
    products: [
      "Peanut Butter Crackers",
      "Trail Mix",
      "Potato Chips",
      "Pretzels",
      "Protein Bars",
      "Coconut Almond Candy Bar",
    ],
    sizes: ["1.5 oz", "8 oz", "12 count box", "family size"],
  },
  Frozen: {
    products: [
      "Frozen Mixed Berries",
      "Frozen Pizza",
      "Chicken Nuggets",
      "Chicken Popcorn",
      "Frozen Waffles",
    ],
    sizes: ["10 oz", "16 oz", "2 lb bag", "4 count"],
  },
  Beverages: {
    products: [
      "Orange Juice",
      "Almond Milk",
      "Soda",
      "Apple Juice",
      "Iced Tea",
    ],
    sizes: ["12 oz bottle", "32 oz", "52 oz", "half gallon"],
  },
  Pantry: {
    products: [
      "Peanut Butter",
      "Alfredo Sauce",
      "Ground Cinnamon",
      "Oatmeal",
      "Flour",
      "Pasta Sauce",
    ],
    sizes: ["2 oz jar", "16 oz jar", "15 oz can", "5 lb bag"],
  },
  "Baby Food": {
    products: [
      "Infant Formula",
      "Fruit Puree Pouches",
      "Crackers",
      "Cereal",
      "Veggie Puree Jars",
    ],
    sizes: ["4 oz pouch", "8 oz", "12.4 oz can", "22 oz can"],
  },
};

// product variants
const VARIANTS = {
  Produce: [
    "",
    "Organic",
    "Pre-Washed",
    "Family Size",
    "Local",
    "Snack Pack",
    "Bagged",
    "Fresh Cut",
    "Value Pack",
  ],
  Dairy: [
    "",
    "Organic",
    "Low-Fat",
    "Lactose-Free",
    "Reduced Fat",
    "Family Size",
    "Grass-Fed",
    "Value Pack",
    "Single Serve",
  ],
  Meat: [
    "",
    "Organic",
    "Grass-Fed",
    "Seasoned",
    "Family Pack",
    "Thin Sliced",
    "Smoked",
    "Lean",
    "Value Pack",
  ],
  Seafood: [
    "",
    "Wild-Caught",
    "Farm-Raised",
    "Family Size",
    "Seasoned",
    "Value Pack",
    "Premium",
    "Single Serve",
    "Lightly Salted",
  ],
  Bakery: [
    "",
    "Whole Wheat",
    "Gluten-Free",
    "Mini",
    "Family Size",
    "Multigrain",
    "Fresh Baked",
    "Value Pack",
    "Sugar-Free",
  ],
  Snacks: [
    "",
    "Honey Roasted",
    "Sea Salt",
    "Gluten-Free",
    "Snack Size",
    "Family Size",
    "Spicy",
    "Reduced Fat",
    "Value Pack",
  ],
  Frozen: [
    "",
    "Organic",
    "Family Size",
    "Microwavable",
    "Single Serve",
    "Value Pack",
    "Gluten-Free",
    "Party Size",
    "Premium",
  ],
  Beverages: [
    "",
    "Organic",
    "Unsweetened",
    "Low Sugar",
    "Family Size",
    "Single Serve",
    "Premium",
    "Value Pack",
    "Mini",
  ],
  Pantry: [
    "",
    "Organic",
    "Value Size",
    "Store Brand",
    "Reduced Sodium",
    "Family Size",
    "Gluten-Free",
    "Bulk",
    "Premium",
  ],
  "Baby Food": [
    "",
    "Organic",
    "Stage 1",
    "Stage 2",
    "Stage 3",
    "Value Pack",
    "Sensitive",
    "Gentle",
    "Iron-Fortified",
  ],
};

const BRANDS = [ // I can't believe people still shop from these companies if these 10 alone are responsible for 1k+ recalls
  "GreenLeaf Farms",
  "Boston Fresh",
  "Sunny Farms",
  "Maple Ridge", // NO! This was one of my favorite brands!!! I'll never buy thier milk again!
  "Coastal Kitchen",
  "Golden Fields",
  "Blue Hill Foods",
  "PineHill Valley",
  "Red Maple Barn",
  "Silver Creek",
  "Oak & Grain",
  "Little Sprout",
];

const FIRM_LOCATIONS = [
  ["Boston", "MA"],
  ["Chicago", "IL"],
  ["Dallas", "TX"],
  ["Portland", "OR"],
  ["Atlanta", "GA"],
  ["Madison", "WI"],
  ["Columbus", "OH"],
  ["Seattle", "WA"],
  ["Denver", "CO"],
  ["Fresno", "CA"],
  ["Providence", "RI"],
];

const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const RETAILERS = [
  "Whole Foods",
  "Stop & Shop",
  "Trader Joe's",
  "Market Basket",
  "Star Market",
  "Walmart",
  "Target",
  "Costco",
  "Aldi",
  "Sams Club",
];

// possible problems
const HAZARDS = [
  {
    type: "bacterial",
    weight: 40,
    reasons: [
      "Possible Listeria monocytogenes contamination",
      "Possible Salmonella contamination",
      "Possible E. coli O157:H7 contamination",
      "Possible Clostridium botulinum contamination",
    ],
  },
  { type: "allergen", weight: 35, reasons: [] },
  {
    type: "foreign",
    weight: 15,
    reasons: [
      "May contain metal fragments",
      "May contain hard plastic pieces",
      "May contain glass fragments",
    ],
  },
  {
    type: "mislabel",
    weight: 10,
    reasons: [
      "Incorrect expiration date on packaging",
      "Product packaged in wrong container",
      "Missing ingredient statement",
    ],
  },
];

const CATEGORY_ALLERGENS = {
  Dairy: ["Peanuts", "Tree Nuts", "Eggs", "Soy"],
  Meat: ["Soy", "Wheat", "Sesame"],
  Seafood: ["Wheat", "Soy", "Eggs"],
  Bakery: ["Peanuts", "Tree Nuts", "Eggs", "Milk", "Soy", "Sesame"],
  Snacks: ["Peanuts", "Tree Nuts", "Milk", "Soy", "Sesame", "Wheat"],
  Frozen: ["Soy", "Wheat", "Eggs", "Sesame"],
  Pantry: ["Peanuts", "Tree Nuts", "Soy", "Wheat", "Sesame"],
  "Baby Food": ["Milk", "Soy", "Wheat", "Eggs"],
};

const ALLERGEN_KEYWORDS = {
  Peanuts: ["peanut"],
  "Tree Nuts": ["almond", "nut", "coconut", "trail mix"],
  Milk: ["milk", "cheese", "yogurt", "cream", "butter", "alfredo", "formula"],
  Eggs: ["egg", "waffle", "pancake"],
  Soy: ["soy", "edamame"],
  Wheat: [
    "flour",
    "bread",
    "bagel",
    "muffin",
    "cookie",
    "tortilla",
    "pizza",
    "cereal",
    "cracker",
    "pretzel",
    "oatmeal",
    "waffle",
    "nugget",
    "popcorn",
    "fish stick",
  ],
  Sesame: ["hummus", "sesame"],
};

const ACTIONS_BY_HAZARD = {
  bacterial: ["Throw away", "Do not consume; contact the company for a refund"],
  foreign: ["Do not consume; contact the company for a refund", "Throw away"],
  allergen: [
    "Return to store for a full refund",
    "Do not consume if you have this allergy; return to store for a refund",
  ],
  mislabel: ["Return to store for a full refund"],
};

const NOW = new Date("2026-11-15T12:00:00Z");

// seeded random generator
let seedState = 5610;
function random() {
  seedState = (seedState + 0x6d2b79f5) | 0;
  let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// helper func
const rand = (min, max) => Math.floor(random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const pickMany = (arr, min, max) => shuffle(arr).slice(0, rand(min, max));

function pickWeighted(items) {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

const PRODUCT_LINES = Object.entries(CATALOG).flatMap(
  ([category, { products }]) =>
    products.flatMap((name) =>
      VARIANTS[category].map((variant) => ({
        category,
        product: `${variant} ${name}`.trim(),
        brands: pickMany(BRANDS, 2, 2),
      })),
    ),
);

const SLOTS = shuffle(
  PRODUCT_LINES.flatMap((line) =>
    line.brands.map((brand) => ({ ...line, brand })),
  ),
).slice(0, NUM_RECALLS);

function allowedAllergens(category, product) {
  const name = product.toLowerCase();
  return (CATEGORY_ALLERGENS[category] || []).filter(
    (allergen) =>
      !(ALLERGEN_KEYWORDS[allergen] || []).some((word) => name.includes(word)),
  );
}

function buildHazard(category, product) {
  const allowed = allowedAllergens(category, product);
  let hazard = pickWeighted(HAZARDS);

  // produce and drinks get a different hazard instead of allergen
  while (hazard.type === "allergen" && allowed.length === 0) {
    hazard = pickWeighted(HAZARDS);
  }

  if (hazard.type === "allergen") {
    const allergens = pickMany(allowed, 1, Math.min(2, allowed.length));
    return {
      reason: `Undeclared ${allergens.join(" and ").toLowerCase()}`,
      allergens,
      classification: "Class I",
      illnessesReported: random() < 0.2 ? rand(1, 4) : 0,
      consumerAction: pick(ACTIONS_BY_HAZARD.allergen),
    };
  }
  return {
    reason: pick(hazard.reasons),
    allergens: [],
    classification:
      hazard.type === "bacterial"
        ? "Class I"
        : hazard.type === "foreign"
          ? "Class II"
          : pick(["Class II", "Class III"]),
    illnessesReported: hazard.type === "bacterial" ? rand(0, 25) : 0,
    consumerAction: pick(ACTIONS_BY_HAZARD[hazard.type]),
  };
}

function buildDates() {
  const recallDate = addDays(NOW, -rand(20, 3 * 365));
  const reportDate = addDays(recallDate, rand(3, 20));
  let status = pick([
    "Ongoing",
    "Ongoing",
    "Completed",
    "Terminated",
    "Terminated",
  ]);
  let terminationDate = null;

  if (status === "Completed" && recallDate > addDays(NOW, -60)) {
    status = "Ongoing";
  }

  if (status === "Terminated") {
    terminationDate = addDays(reportDate, rand(60, 400));
    if (terminationDate > NOW) {
      status = "Ongoing";
      terminationDate = null;
    }
  }
  return { recallDate, reportDate, terminationDate, status };
}

function buildRecall(index, slot) {
  const { category, product, brand } = slot;
  const { sizes } = CATALOG[category];
  const [firmCity, firmState] = pick(FIRM_LOCATIONS);
  const dates = buildDates();
  const initials = brand
    .split(" ")
    .map((w) => w[0])
    .join("")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
  const nationwide = random() < 0.15;

  return {
    recallNumber: `F-${String(index + 1).padStart(4, "0")}-${dates.recallDate.getFullYear()}`,
    displayOrder: index,
    product,
    brand,
    category,
    productType: "Food",
    isSynthetic: true,
    packageSize: pick(sizes),
    lotCodes: Array.from(
      { length: rand(1, 4) },
      () => `${initials}${rand(1000, 9999)}`,
    ),
    quantity: `${rand(100, 50000).toLocaleString("en-US")} ${pick(["cases", "units", "pounds"])}`,
    ...buildHazard(category, product),
    status: dates.status,
    firm: `${brand} ${pick(["LLC", "Inc.", "Co."])}`,
    firmCity,
    firmState,
    firmCountry: "United States",
    contactPhone: `1-800-555-${String(rand(0, 9999)).padStart(4, "0")}`,
    distribution: nationwide ? STATES : pickMany(STATES, 1, 8),
    retailers: pickMany(RETAILERS, 1, 4),
    recallDate: dates.recallDate,
    reportDate: dates.reportDate,
    terminationDate: dates.terminationDate,
  };
}

async function seed() {
  try {
    await client.connect();
    const recalls = db.collection("recalls");

    const existing = await recalls.countDocuments();

    if (existing > 0 && !process.argv.includes("--force")) {
      console.log(
        `Recalls already seeded (${existing} records). Use --force to re-seed.`,
      );
      return;
    }

    await recalls.deleteMany({});
    const docs = SLOTS.map((slot, i) => buildRecall(i, slot));
    const result = await recalls.insertMany(docs);

    // grocery list matching and search
    await recalls.createIndex({ displayOrder: 1 });
    await recalls.createIndex({
      product: "text",
      brand: "text",
      category: "text",
    });

    console.log(`Inserted ${result.insertedCount} recalls`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();
