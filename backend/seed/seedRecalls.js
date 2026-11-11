import "dotenv/config";
import { MongoClient } from "mongodb";

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
