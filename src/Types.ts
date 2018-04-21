export enum CardSetType {
  BOOSTER = 'booster',
  STARTER = 'starter'
}

export interface CardSet {
  name: string;
  url: string;
  type: CardSetType;
}

export interface Card {
  name: string;
  illustrator: string;
  deployCost: number;
  cardNumber: string;
  promoteCost: number;
  class: string;
  attack: number;
  affinities: string[];
  range: number;
  notes: string;
  support: number;
  quote: string;
  skill: string[];
  supportSkill: string[];
}
