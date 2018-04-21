export enum CardSetType {
  BOOSTER = 'booster',
  STARTER = 'starter'
}

export interface CardSetList {
  name: string;
  url: string;
  type: CardSetType;
}
