import * as request from 'request';
import { JSDOM } from 'jsdom';
import * as Q from 'q';
import * as htmlToText from 'html-to-text';
import { CardSet, CardSetExtractionData, CardSetType, Card, Affinity, Skill, SkillType } from '../Types';

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

const SKILL_NAME_REGEX = /<b>(.*)<\/b>/g;
const EXTRANEOUS_GIF_DATA_REGEX = /(\[data:image\/gif.*?\].*?)\[/g;
const DUPLICATE_IMAGE_REGEX = /(\[.*?\]).(\1)/g;
const CHARACTER_NAME_BACKUP_REGEX = /\w*$/g;
const CHARACTER_TITLE_BACKUP_REGEX = /(.*)\s\w*$/g;
const HREF_REGEX = /\[(?!\s).*?\]/g;
const MULTI_SPACE_REGEX = /\s\s+/g;
const TAG_BACKUP_REGEX = /<.*?>/g;
const DUPLICATE_WORD_REGEX = /\b([A-Z0-9a-z0-9]+)\s+\1\b/;
const DUPLICATE_DOUBLE_WORD_REGEX = /\b([A-Z0-9a-z0-9]+\s+[A-Z0-9a-z0-9]+)\s\1\b/;
const DUPLICATE_TRIPLE_WORD_REGEX = /\b([A-Z0-9a-z0-9]+\s+[A-Z0-9a-z0-9]+\s[A-Z0-9a-z0-9]+)\s\1\b/;
const LEFT_QUOTE = '“';
const RIGHT_QUOTE = '”';

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
    const headers = rawCard.querySelector('.wikitable').querySelectorAll('th');
    const skillGroups = this.getSkills(table, headers);
    const cardName = rawCard.querySelector('.card-name').children[0].children[0].innerHTML.replace('\n', '');
    let names = cardName.split(',');
    if (names.length === 1) {
      names = cardName.split('.');
    }
    if (names.length === 1) {
      const name = cardName.match(CHARACTER_NAME_BACKUP_REGEX)[0];
      const title = cardName.replace(name, '');
      names = [
        title,
        name
      ];
    }
    return {
      name: cardName,
      title: names[0].trim(),
      characterName: names[1].trim(),
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
      skills: skillGroups.skills,
      supportSkills: skillGroups.supportSkills,
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
    return table[INDEX.QUOTE].children[0].innerHTML
      .replace('\n', '')
      .replace(LEFT_QUOTE, '')
      .replace(RIGHT_QUOTE, '')
      .trim();
  }

  private getSkills(
    table: NodeListOf<HTMLTableDataCellElement>,
    headers: NodeListOf<HTMLTableHeaderCellElement>
  ): { skills: Skill[], supportSkills: Skill[] } {
    const skills: Skill[] = [];
    const supportSkills: Skill[] = [];
    for (let i = INDEX.QUOTE + 1; i < headers.length; i += 1) {
      if (table[i].innerHTML === '\n') {
        continue;
      }
      if (headers[i].innerHTML.includes('Support')) {
        supportSkills.push({
          name: this.getSkillName(table[i]),
          text: this.getSkillText(table[i]),
          type: SkillType.SUPPORT_SKILL
        });
      } else {
        skills.push({
          name: this.getSkillName(table[i]),
          text: this.getSkillText(table[i]),
          type: SkillType.SKILL
        });
      }
    }
    return {
      skills,
      supportSkills
    };
  }

  private getSkillName(cell: HTMLTableDataCellElement): string {
    const nameHtml = new JSDOM(cell.innerHTML);
    let text = htmlToText.fromString(nameHtml.window.document.querySelector('body').innerHTML);
    const matches = text.match(HREF_REGEX);
    if (matches !== null) {
      matches.forEach((m) => {
        text = text.replace(m, '');
      });
    }
    const tagMatches = text.match(TAG_BACKUP_REGEX);
    if (tagMatches !== null) {
      tagMatches.forEach((m) => {
        text = text.replace(m, '');
      });
    }
    text = text.replace(MULTI_SPACE_REGEX, ' ');
    text = text.replace(/\n/g, ' ');
    let m;
    while ((m = DUPLICATE_WORD_REGEX.exec(text)) !== null) {
      if (m.index === DUPLICATE_WORD_REGEX.lastIndex) {
        DUPLICATE_WORD_REGEX.lastIndex += 1;
      }
      text = text.replace(m[0], '!!!!');
      text = text.replace('!!!!', m[1]);
    }
    while ((m = DUPLICATE_DOUBLE_WORD_REGEX.exec(text)) !== null) {
      if (m.index === DUPLICATE_DOUBLE_WORD_REGEX.lastIndex) {
        DUPLICATE_DOUBLE_WORD_REGEX.lastIndex += 1;
      }
      text = text.replace(m[0], '!!!!');
      text = text.replace('!!!!', m[1]);
    }
    while ((m = DUPLICATE_TRIPLE_WORD_REGEX.exec(text)) !== null) {
      if (m.index === DUPLICATE_TRIPLE_WORD_REGEX.lastIndex) {
        DUPLICATE_TRIPLE_WORD_REGEX.lastIndex += 1;
      }
      text = text.replace(m[0], '!!!!');
      text = text.replace('!!!!', m[1]);
    }
    return text;
  }

  private getSkillText(cell: HTMLTableDataCellElement): string {
    let text: string = cell.innerHTML.replace(SKILL_NAME_REGEX, '').trim();
    text = htmlToText.fromString(text).replace(/\n/g, ' ');
    let m;
    while ((m = EXTRANEOUS_GIF_DATA_REGEX.exec(text)) !== null) {
      if (m.index === EXTRANEOUS_GIF_DATA_REGEX.lastIndex) {
        EXTRANEOUS_GIF_DATA_REGEX.lastIndex += 1;
      }
      text = text.replace(m[1], '');
    }
    while ((m = DUPLICATE_IMAGE_REGEX.exec(text)) !== null) {
      if (m.index === DUPLICATE_IMAGE_REGEX.lastIndex) {
        DUPLICATE_IMAGE_REGEX.lastIndex += 1;
      }
      text = text.replace(m[2], '');
    }
    const matches = text.match(HREF_REGEX);
    if (matches !== null) {
      matches.forEach((m) => {
        text = text.replace(m, '');
      });
    }
    text = text.replace(MULTI_SPACE_REGEX, ' ');
    const tagMatches = text.match(TAG_BACKUP_REGEX);
    if (tagMatches !== null) {
      tagMatches.forEach((m) => {
        text = text.replace(m, '');
      });
    }
    return text;
  }
}
