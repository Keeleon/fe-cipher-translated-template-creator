import * as request from 'request';
import { JSDOM } from 'jsdom';
import * as Q from 'q';
import { CardSet, CardSetExtractionData, CardSetType, Card } from '../Types';

const enum INDEX {
  ILLUSTRATOR = 0,
  DEPLOY_COST = 1,
  PROMOTE_COST = 3,
  CLASS = 4,
  ATTACK = 5,
  AFFINITIES = 6,
  RANGE = 7,
  NOTES = 8,
  SUPPORT = 9,
  QUOTE = 10
}

export default class CardDetailExtractor {
  public getCardSets(cardSetExtractionData: CardSetExtractionData[]): Q.Promise<CardSet[]> {
    const promises: Q.Promise<CardSet>[] = [];
    cardSetExtractionData.forEach((cardSetData) => {
      promises.push(this.getCardSet(cardSetData));
    });
    return Q.all(promises);
  }

  private getCardSet(cardSetData: CardSetExtractionData): Q.Promise<CardSet> {
    const cards: Card[] = [];
    const deferred = Q.defer<CardSet>();
    request(cardSetData.url, (error, response, body) => {
      if (error) {
        deferred.reject(error);
        return;
      }
      const dom = new JSDOM(body);
      const rawCards = dom.window.document.querySelectorAll('.card-wrapper');
      console.log(cardSetData.url);
      rawCards.forEach((rawCard) => {
        cards.push(this.getCard(rawCard));
      });
    });
    return deferred.promise;
  }

  private getCard(rawCard: Element): Card {
    const table = rawCard.querySelector('.wikitable').querySelectorAll('td');
    table.forEach((td, i) => {
      console.log(`${i}: ${td.innerHTML}`);
    });
    return {
      name: rawCard.querySelector('.card-name').children[0].children[0].innerHTML,
      illustrator: table[INDEX.ILLUSTRATOR].innerHTML,
      deployCost: parseInt(table[INDEX.DEPLOY_COST].innerHTML, 10),
      cardNumber: rawCard.id,
      promoteCost: parseInt(table[INDEX.PROMOTE_COST].innerHTML, 10),
      class: table[INDEX.CLASS].innerHTML,
      attack: parseInt(table[INDEX.ATTACK].innerHTML, 10),
      affinities: [],
      range: 0,
      notes: table[INDEX.NOTES].innerHTML,
      support: parseInt(table[INDEX.SUPPORT].innerHTML, 10),
      quote: table[INDEX.QUOTE].innerHTML,
      skill: [],
      supportSkill: [],
    };
  }
}
