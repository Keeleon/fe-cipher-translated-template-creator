import * as request from 'request';
import { JSDOM } from 'jsdom';
import * as Q from 'q';
import { CardSet, CardSetType, Card } from '../Types';

export default class CardDetailExtractor {
  public getCardSets(cardSetList: CardSet[]): Q.Promise<Card[]> {
    const cards: CardSet[] = [];
    const deferred = Q.defer<Card[]>();
    return deferred.promise;
  }

  private getCardSet(cardSet: CardSet[]): Q.Promise<Card[]> {
    const cards: CardSet[] = [];
    const deferred = Q.defer<Card[]>();
    return deferred.promise;
  }
}
