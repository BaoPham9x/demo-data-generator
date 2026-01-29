import { randomNormal } from "npm:d3-random";

/**
 * Utility functions for generating realistic random data
 */

// First names pool
const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa",
  "Timothy", "Deborah", "Ronald", "Stephanie", "Jason", "Rebecca", "Edward", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
  "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
  "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
  "Benjamin", "Samantha", "Samuel", "Katherine", "Frank", "Christine", "Gregory", "Debra",
  "Raymond", "Rachel", "Alexander", "Carolyn", "Patrick", "Janet", "Jack", "Virginia",
  "Dennis", "Maria", "Jerry", "Heather", "Tyler", "Diane", "Aaron", "Julie",
  "Jose", "Joyce", "Adam", "Victoria", "Nathan", "Kelly", "Henry", "Christina",
  "Zachary", "Joan", "Douglas", "Evelyn", "Peter", "Judith", "Kyle", "Megan",
  "Noah", "Cheryl", "Ethan", "Andrea", "Jeremy", "Hannah", "Walter", "Jacqueline",
  "Christian", "Martha", "Keith", "Gloria", "Roger", "Teresa", "Terry", "Sara",
  "Gerald", "Janice", "Harold", "Marie", "Sean", "Julia", "Austin", "Grace",
  "Carl", "Judy", "Arthur", "Theresa", "Lawrence", "Madison", "Dylan", "Beverly",
  "Jesse", "Denise", "Jordan", "Marilyn", "Bryan", "Amber", "Billy", "Danielle",
  "Joe", "Rose", "Bruce", "Brittany", "Gabriel", "Diana", "Logan", "Abigail",
  "Alan", "Jane", "Juan", "Lori", "Wayne", "Alexis", "Roy", "Marie",
  "Ralph", "Olivia", "Randy", "Catherine", "Eugene", "Frances", "Vincent", "Christine",
  "Russell", "Samantha", "Louis", "Debra", "Philip", "Rachel", "Johnny", "Carolyn",
  "Howard", "Janet", "Bobby", "Virginia", "Willie", "Maria", "Earl", "Heather",
];

// Last names pool
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
  "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez",
  "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams",
  "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
  "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards",
  "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers",
  "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly",
  "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks",
  "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes",
  "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross",
  "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell", "Sullivan", "Bell",
  "Coleman", "Butler", "Henderson", "Barnes", "Gonzales", "Fisher", "Vasquez", "Simmons",
  "Romero", "Jordan", "Patterson", "Alexander", "Hamilton", "Graham", "Reynolds", "Griffin",
  "Wallace", "Moreno", "West", "Cole", "Hayes", "Bryant", "Herrera", "Gibson",
  "Ellis", "Tran", "Medina", "Aguilar", "Stevens", "Murray", "Ford", "Castro",
  "Marshall", "Owens", "Harrison", "Fernandez", "Mcdonald", "Woods", "Washington", "Kennedy",
];

// Countries with their currencies, cities, and regions
const COUNTRIES = [
  { 
    code: "US", 
    currency: "USD", 
    weight: 40,
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
    region: "North America",
    timezone: "America/New_York"
  },
  { 
    code: "GB", 
    currency: "GBP", 
    weight: 25,
    cities: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Leeds", "Edinburgh", "Bristol", "Cardiff", "Belfast"],
    region: "Europe",
    timezone: "Europe/London"
  },
  { 
    code: "SE", 
    currency: "SEK", 
    weight: 15,
    cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping"],
    region: "Europe",
    timezone: "Europe/Stockholm"
  },
  { 
    code: "DE", 
    currency: "EUR", 
    weight: 10,
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig"],
    region: "Europe",
    timezone: "Europe/Berlin"
  },
  { 
    code: "FR", 
    currency: "EUR", 
    weight: 5,
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
    region: "Europe",
    timezone: "Europe/Paris"
  },
  { 
    code: "NL", 
    currency: "EUR", 
    weight: 3,
    cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen"],
    region: "Europe",
    timezone: "Europe/Amsterdam"
  },
  { 
    code: "ES", 
    currency: "EUR", 
    weight: 2,
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao"],
    region: "Europe",
    timezone: "Europe/Madrid"
  },
];

// Registration sources
const REGISTRATION_SOURCES = [
  { source: "organic", weight: 40 },
  { source: "google_ads", weight: 25 },
  { source: "meta_ads", weight: 20 },
  { source: "youtube_ads", weight: 10 },
  { source: "referral", weight: 5 },
];

// Account types
const ACCOUNT_TYPES = [
  { type: "checking", weight: 60 },
  { type: "savings", weight: 25 },
  { type: "business", weight: 10 },
  { type: "investment", weight: 5 },
];

// Customer tiers
const CUSTOMER_TIERS = [
  { tier: "free", weight: 40 },
  { tier: "premium", weight: 30 },
  { tier: "enterprise", weight: 20 },
  { tier: "starter", weight: 10 },
];

// Transaction types
const TRANSACTION_TYPES = [
  { type: "card_spend", weight: 50 },
  { type: "transfer", weight: 20 },
  { type: "deposit", weight: 15 },
  { type: "payment", weight: 10 },
  { type: "withdrawal", weight: 3 },
  { type: "refund", weight: 2 },
];

// Merchant categories
const MERCHANT_CATEGORIES = [
  "retail", "utilities", "subscriptions", "food", "travel", "entertainment",
  "healthcare", "education", "technology", "transportation", "other",
];

// Payment methods
const PAYMENT_METHODS = [
  { method: "card", weight: 60 },
  { method: "bank_transfer", weight: 25 },
  { method: "wallet", weight: 10 },
  { method: "ach", weight: 5 },
];

/**
 * Pick a random item from array
 */
export function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Pick a weighted random item
 */
export function weightedPick<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }
  
  return items[items.length - 1];
}

/**
 * Generate random first name
 */
export function randomFirstName(): string {
  return randomPick(FIRST_NAMES);
}

/**
 * Generate random last name
 */
export function randomLastName(): string {
  return randomPick(LAST_NAMES);
}

/**
 * Generate random email
 */
export function randomEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com", "business.io"];
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`,
  ];
  const format = randomPick(formats);
  const domain = randomPick(domains);
  return `${format}@${domain}`;
}

/**
 * Generate random country
 */
export function randomCountry(): { 
  code: string; 
  currency: string; 
  city: string; 
  region: string; 
  timezone: string;
} {
  const country = weightedPick(COUNTRIES);
  return {
    code: country.code,
    currency: country.currency,
    city: randomPick(country.cities),
    region: country.region,
    timezone: country.timezone,
  };
}

/**
 * Generate random coordinates for a country
 */
export function randomCoordinates(countryCode: string): { latitude: number; longitude: number } {
  // Approximate center coordinates for each country
  const countryCoords: Record<string, { lat: [number, number]; lng: [number, number] }> = {
    "US": { lat: [25, 49], lng: [-125, -66] },
    "GB": { lat: [50, 60], lng: [-8, 2] },
    "SE": { lat: [55, 69], lng: [11, 24] },
    "DE": { lat: [47, 55], lng: [6, 15] },
    "FR": { lat: [42, 51], lng: [-5, 10] },
    "NL": { lat: [50.7, 53.7], lng: [3.2, 7.2] },
    "ES": { lat: [36, 44], lng: [-10, 4] },
  };
  
  const coords = countryCoords[countryCode] || { lat: [0, 0], lng: [0, 0] };
  
  return {
    latitude: randomFloatBetween(coords.lat[0], coords.lat[1]),
    longitude: randomFloatBetween(coords.lng[0], coords.lng[1]),
  };
}

/**
 * Generate random registration source
 */
export function randomRegistrationSource(): string {
  return weightedPick(REGISTRATION_SOURCES).source;
}

/**
 * Generate random account type
 */
export function randomAccountType(): string {
  return weightedPick(ACCOUNT_TYPES).type;
}

/**
 * Generate random customer tier
 */
export function randomCustomerTier(): string {
  return weightedPick(CUSTOMER_TIERS).tier;
}

/**
 * Generate random transaction type
 */
export function randomTransactionType(): string {
  return weightedPick(TRANSACTION_TYPES).type;
}

/**
 * Generate random merchant category
 */
export function randomMerchantCategory(): string {
  return randomPick(MERCHANT_CATEGORIES);
}

/**
 * Generate random payment method
 */
export function randomPaymentMethod(): string {
  return weightedPick(PAYMENT_METHODS).method;
}

/**
 * Generate random date between start and end
 */
export function randomDateBetween(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
export function randomFloatBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random amount (rounded to 2 decimals)
 */
export function randomAmount(min: number, max: number): number {
  return Math.round(randomFloatBetween(min, max) * 100) / 100;
}

/**
 * Generate random risk score (300-850)
 */
export function randomRiskScore(): number {
  // Normal distribution around 650
  const normal = randomNormal(650, 100);
  let score = Math.round(normal());
  score = Math.max(300, Math.min(850, score));
  return score;
}

/**
 * Generate random credit score (300-850)
 */
export function randomCreditScore(): number {
  // Normal distribution around 700
  const normal = randomNormal(700, 80);
  let score = Math.round(normal());
  score = Math.max(300, Math.min(850, score));
  return score;
}

/**
 * Generate number of accounts for a customer (1-3, weighted)
 */
export function randomAccountCount(): number {
  const rand = Math.random();
  if (rand < 0.70) return 1;  // 70% have 1 account
  if (rand < 0.95) return 2;  // 25% have 2 accounts
  return 3;  // 5% have 3+ accounts
}

/**
 * Generate merchant name
 */
export function randomMerchantName(category: string): string {
  const prefixes = ["Premium", "Global", "Elite", "Prime", "Super", "Mega", "Ultra"];
  const suffixes = ["Store", "Shop", "Market", "Hub", "Center", "Mart", "Outlet"];
  
  const prefix = Math.random() < 0.3 ? randomPick(prefixes) + " " : "";
  const suffix = randomPick(suffixes);
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  
  return `${prefix}${categoryName} ${suffix}`;
}
