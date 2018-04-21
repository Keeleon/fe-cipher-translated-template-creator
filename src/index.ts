import DeckAndBoosterUrlParser from './Parsers/DeckAndBoosterUrlParser';
import CardDetailExtractor from './Parsers/CardDetailExtractor';
import { CardSetExtractionData } from './Types';

const deckAndBoosterUrlParser = new DeckAndBoosterUrlParser();
const cardDetailExtractor = new CardDetailExtractor();

deckAndBoosterUrlParser
  .getUrls()
  .then((cardSetData: CardSetExtractionData[]) => {
    cardDetailExtractor.getCardSets(cardSetData);
  });
