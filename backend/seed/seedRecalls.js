import { client, db } from "../db/connection.js";

const NUM_RECALLS = 50;

const CATALOG = {
  Produce: {
    products: ["Baby Spinach", "Romaine Lettuce", "Oranges", "Cilantro", "Yellow Onions", "Red Onions", "Salad Mix", "Sliced Apples", "Pomegranate", "Tomato", "Peppers", "Ginger", "Garlic", "Carrots", "Cucumbers", "Celery", "Broccoli", "Mushrooms", "Watermelon", "Peaches", "Kale"],
    sizes: ["each", "1 bunch", "16 oz bag", "1 lb", "2 lb bag", "3 lb bag", "5 lb bag"],
  },
  Dairy: {
    products: ["Whole Milk", "Shredded Mozzarella", "Greek Yogurt", "Cream Cheese", "Butter", "Ice Cream", "Pepper Jack Cheese"],
    sizes: ["8 oz", "16 oz", "32 oz", "half gallon", "1 gallon"],
  },
  Meat: {
    products: ["Ground Beef", "Chicken Breasts", "Pork Sausage", "Sliced Deli Turkey", "Beef Jerky", "Hot Dogs"],
    sizes: ["12 oz", "1 lb", "2 lb", "3 lb family pack"],
  },
  Seafood: {
    products: ["Frozen Shrimp", "Smoked Salmon", "Canned Tuna", "Crab Meat", "Fish Sticks"],
    sizes: ["4 oz", "6 oz can", "12 oz", "2 lb bag"],
  },
  Bakery: {
    products: ["Bread", "Bagels", "Blueberry Muffins", "Chocolate Chip Cookies", "Flour Tortillas"],
    sizes: ["6 count", "12 count", "20 oz loaf", "24 oz"],
  },
  Snacks: {
    products: ["Peanut Butter Crackers", "Trail Mix", "Granola Bars", "Potato Chips", "Pretzels", "Protein Bars"],
    sizes: ["1.5 oz", "8 oz", "12 count box", "family size"],
  },
  Frozen: {
    products: ["Frozen Mixed Berries", "Frozen Pizza", "Frozen Peas", "Chicken Nuggets", "Frozen Burritos", "Chicken Popcorn"],
    sizes: ["10 oz", "16 oz", "2 lb bag", "4 count"],
  },
  Beverages: {
    products: ["Orange Juice", "Apple Juice", "Cold Brew Coffee", "Almond Milk", "Cola", "Soda"],
    sizes: ["12 oz bottle", "32 oz", "52 oz", "half gallon"],
  },
  Pantry: {
    products: ["Peanut Butter", "Pasta Sauce", "Alfredo Sauce", "Ground Cinnamon", "Canned Black Beans", "Instant Oatmeal", "Flour"],
    sizes: ["2 oz jar", "16 oz jar", "15 oz can", "5 lb bag"],
  },
  "Baby Food": {
    products: ["Infant Formula", "Fruit Puree Pouches", "Crackers", "Cereal"],
    sizes: ["4 oz pouch", "8 oz", "12.4 oz can", "22 oz can"],
  },
};

const BRANDS = ["GreenLeaf Farms", "Boston Fresh", "Sunny Farms", "Maple Ridge", "Coastal Kitchen", "Golden Fields", "Blue Hill Foods", "PineHill Valley", "Red Maple Barn", "Silver Creek", "Oak & Grain", "Little Sprout"];

const FIRM_LOCATIONS = [
  ["Boston", "MA"], ["Chicago", "IL"], ["Dallas", "TX"], ["Portland", "OR"],
  ["Atlanta", "GA"], ["Madison", "WI"], ["Columbus", "OH"], ["Seattle", "WA"],
  ["Denver", "CO"], ["Fresno", "CA"], ["Providence", "RI"],
];

const STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

const RETAILERS = ["Whole Foods", "Stop & Shop", "Trader Joe's", "Market Basket", "Star Market", "Walmart", "Target", "Costco", "Aldi", "Sams Club"];

// possible problems 
const HAZARDS = [
  { type: "bacterial", weight: 40, reasons: ["Possible Listeria monocytogenes contamination", "Possible Salmonella contamination", "Possible E. coli O157:H7 contamination", "Possible Clostridium botulinum contamination"] },
  { type: "allergen", weight: 35, reasons: [] },
  { type: "foreign", weight: 15, reasons: ["May contain metal fragments", "May contain hard plastic pieces", "May contain glass fragments"] },
  { type: "mislabel", weight: 10, reasons: ["Incorrect expiration date on packaging", "Product packaged in wrong container", "Missing ingredient statement"] },
];

const ALLERGENS = ["Peanuts", "Tree Nuts", "Milk", "Eggs", "Soy", "Wheat", "Fish", "Shellfish", "Sesame"];

const CONSUMER_ACTIONS = ["Throw away", "Return to store for a full refund", "Do not consume; contact the company for a refund"];

// helper func
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const pickMany = (arr, min, max) =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, rand(min, max));
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

function pickWeighted(items) {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

const OBVIOUS_ALLERGENS = {
  Dairy: ["Milk"],
  Seafood: ["Fish", "Shellfish"],
  Bakery: ["Wheat"],
};

function buildHazard(category) {
  const hazard = pickWeighted(HAZARDS);
  if (hazard.type === "allergen") {
    const excluded = OBVIOUS_ALLERGENS[category] || [];
    const allergens = pickMany(ALLERGENS.filter((a) => !excluded.includes(a)), 1, 2);
    return {
      reason: `Undeclared ${allergens.join(" and ").toLowerCase()}`,
      allergens,
      classification: "Class I",
      illnessesReported: Math.random() < 0.2 ? rand(1, 4) : 0,
    };
  }
  return {
    reason: pick(hazard.reasons),
    allergens: [],
    classification:
      hazard.type === "bacterial" ? "Class I"
      : hazard.type === "foreign" ? "Class II"
      : pick(["Class II", "Class III"]),
    illnessesReported: hazard.type === "bacterial" ? rand(0, 25) : 0,
  };
}

function buildDates() {
  const now = new Date();
  const recallDate = addDays(now, -rand(0, 3 * 365));
  const reportDate = addDays(recallDate, rand(3, 20));
  let status = pick(["Ongoing", "Ongoing", "Completed", "Terminated", "Terminated"]);
  let terminationDate = null;

  if (status === "Terminated") {
    terminationDate = addDays(reportDate, rand(60, 400));
    if (terminationDate > now) {
      status = "Ongoing";
      terminationDate = null;
    }
  }
  return { recallDate, reportDate, terminationDate, status };
}

function buildRecall(index) {
  const category = pick(Object.keys(CATALOG));
  const { products, sizes } = CATALOG[category];
  const brand = pick(BRANDS);
  const [firmCity, firmState] = pick(FIRM_LOCATIONS);
  const dates = buildDates();
  const initials = brand.split(" ").map((w) => w[0]).join("").replace(/[^A-Za-z]/g, "").toUpperCase();
  const nationwide = Math.random() < 0.15;

  return {
    recallNumber: `F-${String(index + 1).padStart(4, "0")}-${dates.recallDate.getFullYear()}`,
    product: pick(products),
    brand,
    category,
    productType: "Food",
    packageSize: pick(sizes),
    lotCodes: Array.from({ length: rand(1, 4) }, () => `${initials}${rand(1000, 9999)}`),
    quantity: `${rand(100, 50000).toLocaleString()} ${pick(["cases", "units", "pounds"])}`,
    ...buildHazard(category),
    status: dates.status,
    consumerAction: pick(CONSUMER_ACTIONS),
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

// run
async function seed() {
  try {
    await client.connect();
    const recalls = db.collection("recalls");

    await recalls.deleteMany({});
    const docs = Array.from({ length: NUM_RECALLS }, (_, i) => buildRecall(i));
    const result = await recalls.insertMany(docs);

    // text index for grocery list matching and search
    await recalls.createIndex({ product: "text", brand: "text", category: "text" });

    console.log(`Inserted ${result.insertedCount} recalls`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();