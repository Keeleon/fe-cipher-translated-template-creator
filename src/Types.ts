export enum CardSetType {
  BOOSTER = 'booster',
  STARTER = 'starter'
}

export interface CardSetExtractionData {
  name: string;
  url: string;
  type: CardSetType;
}

export interface CardSet {
  name: string;
  type: CardSetType;
  cards: Card[];
}

export interface Card {
  name: string;
  illustrator: string;
  deployCost: number;
  cardNumber: string;
  promoteCost: number;
  class: string;
  attack: number;
  affinities: Affinity[];
  range: number;
  notes: string;
  support: number;
  quote: string;
  skills: string[];
  supportSkills: string[];
}

export interface Affinity {
  name: string;
  imageUrl: string;
}
