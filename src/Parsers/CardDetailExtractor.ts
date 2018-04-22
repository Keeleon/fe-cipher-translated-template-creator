import * as request from 'request';
import { JSDOM } from 'jsdom';
import * as Q from 'q';
import { CardSet, CardSetExtractionData, CardSetType, Card, Affinity } from '../Types';

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
    const cardList: Card[] = [];
    const deferred = Q.defer<CardSet>();
    request(cardSetData.url, (error, response, body) => {
      if (error) {
        deferred.reject(error);
        return;
      }
      const dom = new JSDOM(body);
      const rawCards = dom.window.document.querySelectorAll('.card-wrapper');
      console.log(`Extracting data for: ${cardSetData.name}`);
      rawCards.forEach((rawCard) => {
        cardList.push(this.getCard(rawCard));
      });
      deferred.resolve({
        name: cardSetData.name,
        type: cardSetData.type,
        cards: cardList
      });
    });
    return deferred.promise;
  }

  private getCard(rawCard: Element): Card {
    const table = rawCard.querySelector('.wikitable').querySelectorAll('td');
    return {
      name: rawCard.querySelector('.card-name').children[0].children[0].innerHTML.replace('\n', ''),
      illustrator: table[INDEX.ILLUSTRATOR].innerHTML.replace('\n', ''),
      deployCost: parseInt(table[INDEX.DEPLOY_COST].innerHTML, 10),
      cardNumber: rawCard.id,
      promoteCost: parseInt(table[INDEX.PROMOTE_COST].innerHTML, 10),
      class: this.getClass(table),
      attack: parseInt(table[INDEX.ATTACK].innerHTML, 10),
      affinities: this.getAffinities(table),
      range: parseInt(table[INDEX.RANGE].innerHTML, 10),
      notes: table[INDEX.NOTES].innerHTML.replace('\n', ''),
      support: parseInt(table[INDEX.SUPPORT].innerHTML, 10),
      quote: this.getQuote(table),
      skills: [],
      supportSkills: [],
    };
  }

  private getAffinities(table: NodeListOf<HTMLTableDataCellElement>): Affinity[] {
    const affinities: Affinity[] = [];
    const html = table[INDEX.AFFINITIES];
    html.querySelectorAll('img').forEach((affinity) => {
      affinities.push({
        name: affinity.getAttribute('alt').replace('Cipher ', ''),
        imageUrl: affinity.getAttribute('data-src')
      });
    });
    return affinities;
  }

  private getClass(table: NodeListOf<HTMLTableDataCellElement>): string {
    if (typeof table[INDEX.CLASS].children[0] === 'undefined') {
      return table[INDEX.CLASS].innerHTML.replace('\n', '');
    }
    return table[INDEX.CLASS].children[0].innerHTML.replace('\n', '');
  }

  private getQuote(table: NodeListOf<HTMLTableDataCellElement>): string {
    if (typeof table[INDEX.QUOTE].children[0] === 'undefined') {
      return '';
    }
    return table[INDEX.QUOTE].children[0].innerHTML.replace('\n', '');
  }
}
