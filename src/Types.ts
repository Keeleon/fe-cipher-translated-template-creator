export enum CardSetType {
  BOOSTER = 'booster',
  STARTER = 'starter'
}

export enum SkillType {
  SKILL = 'skill',
  SUPPORT_SKILL = 'support_skill'
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
  skills: Skill[];
  supportSkills: Skill[];
}

export interface Affinity {
  name: string;
  imageUrl: string;
}

export interface Skill {
  name: string;
  text: string;
  type: SkillType;
}
