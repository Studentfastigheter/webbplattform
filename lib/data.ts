import { faker } from "@faker-js/faker";

export type Ad = {
  id: number;
  address: string;
  rooms: number | null;
  rent: number | null;
  status: string;
  published: string;
};

export const createAds = (numberOfAds: number) => {
  const ads: Ad[] = []
  for (let i = 0; i < numberOfAds; i++) {
    ads.push({
      id: i,
      address: faker.location.streetAddress(),
      rooms: Math.floor(Math.random() * (5 - 1)) + 1,
      rent: Math.floor(Math.random() * (11000 - 4000)) + 4000,
      status: Math.floor(Math.random() * 2) == 1 ? "ledig" : "uthyrd",
      published: faker.date.recent().toISOString()
    })
  }
  return ads;
}