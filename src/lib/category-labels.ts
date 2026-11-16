export const VEHICLES_ALL = "cars,bikes,motorhomes,vans,boats,plant,gear";
export const VEHICLES_LEGACY_ALL = "cars,bikes,motorhomes,vans,boats,plant";
export const VEHICLES_OTHER = "vans,boats,plant";
export const HOME_ALL = "home,food,apparel,diy,toys,household";

const categoryLabels: Record<string, string> = {
  cars: "Cars",
  bikes: "Bikes",
  motorhomes: "Motorhomes",
  vans: "Vans",
  boats: "Boats",
  plant: "Plant",
  gear: "Gear & Accessories",
  houses: "Houses",
  watches: "Watches & Jewellery",
  cash: "Cash",
  tech: "Tech",
  games: "Instants",
  home: "Appliances & Garden",
  food: "Food & Drink",
  apparel: "Apparel",
  diy: "DIY",
  toys: "Toys & Games",
  household: "Household",
  sports: "Sports",
  collectibles: "Collectibles",
  tickets: "Tickets",
  holidays: "Holidays",
  beauty: "Beauty",
  music: "Music",
  experiences: "Experiences",
  other: "More",
  none: "Misc",
  uncategorised: "Misc",
};

const groupLabels: Record<string, string> = {
  [VEHICLES_ALL]: "Vehicles",
  [VEHICLES_LEGACY_ALL]: "Vehicles",
  [VEHICLES_OTHER]: "Other Vehicles",
  [HOME_ALL]: "Home",
};

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getCategoryLabel(value: string): string {
  const normalized = value.trim().toLowerCase();
  return categoryLabels[normalized] ?? titleCase(value.trim());
}

export function getCategoryGroupLabel(value: string): string | null {
  return groupLabels[value.trim().toLowerCase()] ?? null;
}

export const seasonalLabels: Record<string, string> = {
  christmas: "Christmas",
};

export function getSeasonalLabel(value?: string | null): string | null {
  if (!value) return null;
  return seasonalLabels[value.trim().toLowerCase()] ?? null;
}
