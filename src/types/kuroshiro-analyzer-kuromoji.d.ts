declare module 'kuroshiro-analyzer-kuromoji' {
  export default class KuromojiAnalyzer {
    constructor();
    init(): Promise<void>;
    parse(text: string): Array<{
      surface_form: string;
      pos: string;
      pos_detail_1: string;
      pos_detail_2: string;
      pos_detail_3: string;
      conjugated_type: string;
      conjugated_form: string;
      basic_form: string;
      reading: string;
      pronunciation: string;
    }>;
  }
} 