import * as Q from 'q';
import * as XLSX from 'xlsx';
import { CardSet, CardSetType, Card, Affinity, Skill, SkillType, Coords, WorksheetOffsets } from '../Types';

const WORKBOOK_LOCATION = './src/FE_Cipher_Template_S.xlsx';

const CARD_COL_OFFSET = 6;
const CARD_ROW_OFFSET = 3;
const MAX_SHEET_NAME_LENGTH = 31;

const QUOTE_OFFSET: Coords = {
  ROW: 2,
  COL: 0
};

const SKILLS_OFFSET: Coords = {
  ROW: 3,
  COL: 1
};

const SUPPORT_SKILLS_OFFSET: Coords = {
  ROW: 4,
  COL: 0
};

const ATTACK_OFFSET: Coords = {
  ROW: 6,
  COL: 0
};

const RANGE_OFFSET: Coords = {
  ROW: 6,
  COL: 1
};

const TITLE_OFFSET: Coords = {
  ROW: 7,
  COL: 1
};

const CHARACTER_NAME_OFFSET: Coords = {
  ROW: 7,
  COL: 3
};

const CLASS_OFFSET: Coords = {
  ROW: 6,
  COL: 3
};

const SUPPORT_OFFSET: Coords = {
  ROW: 6,
  COL: 4
};

export default class CardOutputter {
  private worksheetOffsets: WorksheetOffsets;

  constructor () {
    this.worksheetOffsets = {
      QUOTE: QUOTE_OFFSET,
      SKILLS: SKILLS_OFFSET,
      SUPPORT_SKILLS: SUPPORT_SKILLS_OFFSET,
      ATTACK: ATTACK_OFFSET,
      RANGE: RANGE_OFFSET,
      CLASS: CLASS_OFFSET,
      TITLE: TITLE_OFFSET,
      CHARACTER_NAME: CHARACTER_NAME_OFFSET,
      SUPPORT: SUPPORT_OFFSET
    };
  }

  public output(cardSets: CardSet[]): Promise<boolean> {
    const workbook = XLSX.readFile(WORKBOOK_LOCATION);
    cardSets.forEach((cardSet, i) => {
      const worksheet = this.getWorkSheetOutput(cardSet);
      const sheetName =
        `${cardSet.type === CardSetType.BOOSTER ? 'B' : 'S'} ${cardSet.name}`.slice(0, MAX_SHEET_NAME_LENGTH);
      try {
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      } catch (e) {
        console.log(e.message);
      }
    });
    XLSX.writeFile(workbook, './output.xlsx');
    return Promise.resolve(true);
  }

  private getWorkSheetOutput(cardSet: CardSet): XLSX.WorkSheet {
    const workbook = XLSX.readFile(WORKBOOK_LOCATION);
    const templateSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[templateSheet];
    const sheetNameCell: XLSX.CellObject = {
      t: 's',
      v: `${cardSet.type}: ${cardSet.name} [${cardSet.cards.length} cards]`
    };
    worksheet['A1'] = sheetNameCell;
    for (let i = 0; i < cardSet.cards.length; i += 1) {
      this.addCardToWorkSheet(worksheet, cardSet.cards[i], i);
    }
    return worksheet;
  }

  private addCardToWorkSheet(worksheet: XLSX.WorkSheet, card: Card, index: number): void {
    const cardColOffset = index % 2 === 0 ? 0 : CARD_COL_OFFSET;
    const cardRowOffset = index % 2 === 0 ? CARD_ROW_OFFSET * index : CARD_ROW_OFFSET * (index - 1) ;
    const offsets = Object.keys(this.worksheetOffsets);
    offsets.forEach((offset) => {
      const cellData = this.getCellData(offset, card);
      const cellReference = this.getCellReference(
        this.worksheetOffsets[offset].ROW,
        this.worksheetOffsets[offset].COL,
        cardRowOffset,
        cardColOffset
      );
      const cell: XLSX.CellObject = {
        t: 's',
        v: cellData
      };
      worksheet[cellReference] = cell;
    });
  }

  private getCellData(offset: string, card: Card): string {
    let cellData: string;
    switch (offset) {
      case('QUOTE'):
        cellData = card.quote;
        break;
      case('SKILLS'):
        cellData = this.getSkillText(card.skills);
        break;
      case('SUPPORT_SKILLS'):
        cellData = this.getSkillText(card.supportSkills);
        break;
      case('ATTACK'):
        cellData = card.attack === null ? '' : card.attack.toString();
        break;
      case('RANGE'):
        cellData = card.range === null ? 'RNG: ' : `RNG: ${card.range.toString()}`;
        break;
      case('CLASS'):
        cellData = card.class;
        break;
      case('TITLE'):
        cellData = card.title;
        break;
      case('CHARACTER_NAME'):
        cellData = card.characterName;
        break;
      case('SUPPORT'):
        cellData = card.support === null ? '' : card.support.toString();
        break;
      default:
        cellData = '';
        break;
    }
    return cellData;
  }

  private getSkillText(skills: Skill[]): string {
    let skillText: string = '';
    skills.forEach((skill: Skill) => {
      skillText += `${skill.name}: ${skill.text}\n`;
    });
    return skillText;
  }

  private getCellReference(row: number, col: number, rowOffset: number, colOffset: number): string {
    const colReference = this.numberToLetter(col + colOffset);
    const rowReference = row + rowOffset;
    return `${colReference}${rowReference}`;
  }

  private numberToLetter(c: number): string {
    const cols = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];
    return cols[c];
  }
}
