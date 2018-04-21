import * as request from 'request';
import { JSDOM } from 'jsdom';
import * as Q from 'q';
import { CardSet, CardSetType } from '../Types';

const WIKI_URL = 'http://fireemblem.wikia.com';
const DECK_AND_BOOSTER_INDEX_URL = 'http://fireemblem.wikia.com/wiki/Fire_Emblem_0_(Cipher)';

export default class DeckAndBoosterUrlParser {
  public getUrls(): Q.Promise<CardSet[]> {
    const cardSetLists: CardSet[] = [];
    const deferred = Q.defer<CardSet[]>();
    request(DECK_AND_BOOSTER_INDEX_URL, (error, response, body) => {
      if (error) {
        deferred.reject(error);
        return;
      }

      const dom = new JSDOM(body);
      const lis = dom.window.document.querySelectorAll('li');
      lis.forEach((li) => {
        if (li.innerHTML.includes('Card List')) {
          cardSetLists.push({
            name: li.children[0].innerHTML,
            type: CardSetType.BOOSTER,
            url: `${WIKI_URL}${li.children[1].getAttribute('href')}`
          });
        } else if (li.innerHTML.match(/Starter Deck \d{1,}:/g) !== null) {
          cardSetLists.push({
            name: li.children[0].innerHTML,
            type: CardSetType.STARTER,
            url: `${WIKI_URL}${li.children[0].getAttribute('href')}`
          });
        }
      });
      deferred.resolve(cardSetLists);
    });
    return deferred.promise;
  }
}
