import DeckAndBoosterUrlParser from './Parsers/DeckAndBoosterUrlParser';
import CardDetailExtractor from './Parsers/CardDetailExtractor';
import { CardSetExtractionData } from './Types';
import * as fs from 'fs';

const deckAndBoosterUrlParser = new DeckAndBoosterUrlParser();
const cardDetailExtractor = new CardDetailExtractor();

deckAndBoosterUrlParser
  .getUrls()
  .then((cardSetData: CardSetExtractionData[]) => {
    return cardDetailExtractor.getCardSets(cardSetData);
  })
  .then((cardSets) => {
    fs.writeFileSync('cards.json', JSON.stringify(cardSets));
  });
