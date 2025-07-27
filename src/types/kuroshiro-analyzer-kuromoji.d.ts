declare module 'kuroshiro-analyzer-kuromoji' {
  export default class KuromojiAnalyzer {
    constructor();
    init(): Promise<void>;
    parse(text: string): any[];
  }
} 