import DeckAndBoosterUrlParser from './Parsers/DeckAndBoosterUrlParser';
import CardDetailExtractor from './Parsers/CardDetailExtractor';
import CardOutputter from './Output/CardOutputter';
import { CardSetExtractionData } from './Types';
import * as fs from 'fs';

const deckAndBoosterUrlParser = new DeckAndBoosterUrlParser();
const cardDetailExtractor = new CardDetailExtractor();
const cardOutputter = new CardOutputter();

deckAndBoosterUrlParser
  .getUrls()
  .then((cardSetData: CardSetExtractionData[]) => {
    return cardDetailExtractor.getCardSets(cardSetData);
  })
  .then((cardSets) => {
    fs.writeFileSync('cards.json', JSON.stringify(cardSets));
    return cardSets;
  })
  .then((cardSets) => {
    cardOutputter.output(cardSets);
  });
