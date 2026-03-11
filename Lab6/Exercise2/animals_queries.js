// Lab 6 - Exercise 2: Zoo / Animal Database
// Run with: mongosh animals_queries.js

// ─── 1. Create / select database 'animal' ────────────────────────────────────
use("animal");
print("Selected database: " + db.getName());

// ─── 2. Display all databases ────────────────────────────────────────────────
print("\n--- All Databases ---");
const dbList = db.adminCommand({ listDatabases: 1 });
dbList.databases.forEach(d => print(d.name));

// ─── 3. Create collections ────────────────────────────────────────────────────
// Capped collection for wild_animals
db.createCollection("wild_animals", { capped: true, size: 1048576, max: 100 });
// Regular collection for domestic_animals
db.createCollection("domestic_animals");
print("\nCollections created: wild_animals (capped), domestic_animals");

// ─── 4. Insert 5 wild animals ────────────────────────────────────────────────
db.wild_animals.insertMany([
  {
    animal_name: "Bengal Tiger",
    nature: "harm",
    favorite_foods: ["deer", "boar", "rabbits"],
    care_taker_name: "Ramesh Kumar",
    life_span: 12,
    timestamp: new Date("2020-03-10"),
    expenses: 45000
  },
  {
    animal_name: "African Elephant",
    nature: "harmless",
    favorite_foods: ["grass", "fruits", "bark"],
    care_taker_name: "Suresh Patel",
    life_span: 60,
    timestamp: new Date("2018-07-22"),
    expenses: 90000
  },
  {
    animal_name: "King Cobra",
    nature: "harm",
    favorite_foods: ["rats", "frogs", "lizards"],
    care_taker_name: "Anita Sharma",
    life_span: 20,
    timestamp: new Date("2021-11-05"),
    expenses: 15000
  },
  {
    animal_name: "White Rhinoceros",
    nature: "harmless",
    favorite_foods: ["grass", "leaves", "shrubs"],
    care_taker_name: "Ramesh Kumar",
    life_span: 40,
    timestamp: new Date("2019-04-18"),
    expenses: 75000
  },
  {
    animal_name: "Snow Leopard",
    nature: "harm",
    favorite_foods: ["deer", "goats", "rabbits"],
    care_taker_name: "Priya Nair",
    life_span: 15,
    timestamp: new Date("2022-01-30"),
    expenses: 60000
  }
]);
print("Inserted 5 wild animals.");

// ─── 5. Insert 5 domestic animals ────────────────────────────────────────────
db.domestic_animals.insertMany([
  {
    animal_name: "Dog",
    gender: "male",
    favorite_foods: ["meat", "biscuits", "rice"],
    animal_petname: "Bruno",
    life_span: 13,
    timestamp: new Date("2021-06-15"),
    expenses: 8000
  },
  {
    animal_name: "Cat",
    gender: "female",
    favorite_foods: ["fish", "milk", "meat"],
    animal_petname: "Whiskers",
    life_span: 15,
    timestamp: new Date("2020-09-01"),
    expenses: 5000
  },
  {
    animal_name: "Parrot",
    gender: "male",
    favorite_foods: ["seeds", "fruits", "nuts"],
    animal_petname: "Mango",
    life_span: 30,
    timestamp: new Date("2022-03-20"),
    expenses: 3000
  },
  {
    animal_name: "Rabbit",
    gender: "female",
    favorite_foods: ["carrots", "leafy greens", "hay"],
    animal_petname: "Snowball",
    life_span: 8,
    timestamp: new Date("2023-02-10"),
    expenses: 2000
  },
  {
    animal_name: "Tortoise",
    gender: "male",
    favorite_foods: ["leafy greens", "vegetables", "fruits"],
    animal_petname: "Rocky",
    life_span: 100,
    timestamp: new Date("2019-11-25"),
    expenses: 1500
  }
]);
print("Inserted 5 domestic animals.");

// ─── 6. Display all documents ────────────────────────────────────────────────
print("\n--- All Wild Animals ---");
db.wild_animals.find().forEach(printjson);

print("\n--- All Domestic Animals ---");
db.domestic_animals.find().forEach(printjson);

// ─── 7. Display only animal name and expenses ────────────────────────────────
print("\n--- Wild Animals: Name & Expenses ---");
db.wild_animals.find({}, { animal_name: 1, expenses: 1, _id: 0 }).forEach(printjson);

print("\n--- Domestic Animals: Name & Expenses ---");
db.domestic_animals.find({}, { animal_name: 1, expenses: 1, _id: 0 }).forEach(printjson);

// ─── 8. Domestic animals whose life span is a particular year (e.g., 13) ─────
print("\n--- Domestic Animals with Life Span of 13 years ---");
db.domestic_animals.find({ life_span: 13 }).forEach(printjson);

// ─── 9. Wild animals under a particular care taker ───────────────────────────
print("\n--- Wild Animals under Ramesh Kumar ---");
db.wild_animals.find({ care_taker_name: "Ramesh Kumar" }).forEach(printjson);

// ─── 10. Animals with life span > 5 years ─────────────────────────────────────
print("\n--- Wild Animals: Name, Foods, Expenses (life span > 5) ---");
db.wild_animals.find(
  { life_span: { $gt: 5 } },
  { animal_name: 1, favorite_foods: 1, expenses: 1, _id: 0 }
).forEach(printjson);

print("\n--- Domestic Animals: Name, Foods, Expenses (life span > 5) ---");
db.domestic_animals.find(
  { life_span: { $gt: 5 } },
  { animal_name: 1, favorite_foods: 1, expenses: 1, _id: 0 }
).forEach(printjson);
