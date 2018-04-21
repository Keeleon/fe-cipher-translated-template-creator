import DeckAndBoosterUrlParser from './Parsers/DeckAndBoosterUrlParser';

const deckAndBoosterUrlParser = new DeckAndBoosterUrlParser();

deckAndBoosterUrlParser
  .getUrls()
  .then((res) => {
    console.log(res);
  });
