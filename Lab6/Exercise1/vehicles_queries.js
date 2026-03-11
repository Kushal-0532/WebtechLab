// Lab 6 - Exercise 1: Vehicles Database
// Run with: mongosh vehicles_queries.js

// ─── 1. Create / select database 'vehicles' ───────────────────────────────────
use("vehicles");
print("Selected database: " + db.getName());

// ─── 2. Display all databases ────────────────────────────────────────────────
print("\n--- All Databases ---");
const dbList = db.adminCommand({ listDatabases: 1 });
dbList.databases.forEach(d => print(d.name));

// ─── 3. Create collections ────────────────────────────────────────────────────
// Capped collection for two_wheelers
db.createCollection("two_wheelers", { capped: true, size: 1048576, max: 100 });
// Regular collection for four_wheelers
db.createCollection("four_wheelers");
print("\nCollections created: two_wheelers (capped), four_wheelers");

// ─── 4. Insert 5 two-wheelers ────────────────────────────────────────────────
db.two_wheelers.insertMany([
  {
    bike_name: "Honda Activa 6G",
    model: "gearless",
    category: "125cc",
    colors_available: ["red", "black", "blue", "white"],
    manufacturer: "Honda",
    performance: 7,
    timestamp: new Date("2021-01-15"),
    price: 75000
  },
  {
    bike_name: "Royal Enfield Classic 350",
    model: "gear",
    category: "350cc",
    colors_available: ["black", "chrome silver", "gunmetal grey"],
    manufacturer: "Royal Enfield",
    performance: 8,
    timestamp: new Date("2021-08-20"),
    price: 185000
  },
  {
    bike_name: "Bajaj Pulsar NS200",
    model: "gear",
    category: "200cc",
    colors_available: ["black", "red", "blue"],
    manufacturer: "Bajaj",
    performance: 8,
    timestamp: new Date("2020-06-10"),
    price: 140000
  },
  {
    bike_name: "TVS Jupiter",
    model: "gearless",
    category: "110cc",
    colors_available: ["red", "white", "blue", "sport red"],
    manufacturer: "TVS",
    performance: 6,
    timestamp: new Date("2022-03-05"),
    price: 72000
  },
  {
    bike_name: "Yamaha R15 V4",
    model: "gear",
    category: "150cc",
    colors_available: ["blue", "black", "sport red"],
    manufacturer: "Yamaha",
    performance: 9,
    timestamp: new Date("2022-11-01"),
    price: 175000
  }
]);
print("Inserted 5 two-wheelers.");

// ─── 5. Insert 5 four-wheelers ───────────────────────────────────────────────
db.four_wheelers.insertMany([
  {
    vehicle_name: "Maruti Suzuki Swift",
    model: "own",
    category: "car",
    variants: ["vxi", "zxi", "petrol", "diesel"],
    manufacturer: "Maruti Suzuki",
    performance: 7,
    timestamp: new Date("2021-04-10"),
    price: 700000
  },
  {
    vehicle_name: "Tata Ace",
    model: "commercial",
    category: "mini truck",
    variants: ["diesel", "cng"],
    manufacturer: "Tata Motors",
    performance: 6,
    timestamp: new Date("2020-09-15"),
    price: 450000
  },
  {
    vehicle_name: "Ashok Leyland Dost",
    model: "commercial",
    category: "heavy truck",
    variants: ["diesel"],
    manufacturer: "Ashok Leyland",
    performance: 7,
    timestamp: new Date("2019-12-01"),
    price: 1200000
  },
  {
    vehicle_name: "Hyundai Creta",
    model: "own",
    category: "car",
    variants: ["petrol", "diesel", "vxi", "zxi"],
    manufacturer: "Hyundai",
    performance: 8,
    timestamp: new Date("2022-06-20"),
    price: 1100000
  },
  {
    vehicle_name: "Volvo B9R",
    model: "commercial",
    category: "bus",
    variants: ["diesel"],
    manufacturer: "Volvo",
    performance: 9,
    timestamp: new Date("2021-11-30"),
    price: 5000000
  }
]);
print("Inserted 5 four-wheelers.");

// ─── 6. Display all documents ────────────────────────────────────────────────
print("\n--- All Two Wheelers ---");
db.two_wheelers.find().forEach(printjson);

print("\n--- All Four Wheelers ---");
db.four_wheelers.find().forEach(printjson);

// ─── 7. Display only vehicle name and price ───────────────────────────────────
print("\n--- Two Wheelers: Name & Price ---");
db.two_wheelers.find({}, { bike_name: 1, price: 1, _id: 0 }).forEach(printjson);

print("\n--- Four Wheelers: Name & Price ---");
db.four_wheelers.find({}, { vehicle_name: 1, price: 1, _id: 0 }).forEach(printjson);

// ─── 8. Two-wheelers from a particular company (Honda) ───────────────────────
print("\n--- Two Wheelers by Honda ---");
db.two_wheelers.find({ manufacturer: "Honda" }).forEach(printjson);

// ─── 9. Four-wheelers available in diesel variant ─────────────────────────────
print("\n--- Four Wheelers with Diesel Variant ---");
db.four_wheelers.find({ variants: "diesel" }).forEach(printjson);

// ─── 10. Vehicles with performance rating > 5 ────────────────────────────────
print("\n--- Two Wheelers: Name, Category, Manufacturer (rating > 5) ---");
db.two_wheelers.find(
  { performance: { $gt: 5 } },
  { bike_name: 1, category: 1, manufacturer: 1, _id: 0 }
).forEach(printjson);

print("\n--- Four Wheelers: Name, Category, Manufacturer (rating > 5) ---");
db.four_wheelers.find(
  { performance: { $gt: 5 } },
  { vehicle_name: 1, category: 1, manufacturer: 1, _id: 0 }
).forEach(printjson);
