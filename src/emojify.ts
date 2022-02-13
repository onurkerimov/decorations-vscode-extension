import * as vscode from 'vscode';
import parse from './parse';

const symbolMap = {
  var: "∅",
  let: "○",
  const: "●",
  // function: "ƒn",
  return: "⮑",//"➔",//"➞","↳"
  import: '❯',//'⬇',
  export: '❮',//'⬆',
  ' default': '❮❮',

  type: '✣',
  interface: '✣',
  ';': '',
  // true: '🄣',
  // false: '🄕',
  // undefined: '🄤',
  // null: '🄝',
  // 'function': '⨍'
};

export function initialiseDecorations() {
  let decorations: { [emoji: string]: vscode.TextEditorDecorationType } = {};

  Object.keys(symbolMap).forEach(key => {
    //@ts-ignore
    const symbol = symbolMap[key];
    decorations[symbol] = vscode.window.createTextEditorDecorationType({
      before: {
         contentText: symbol,
         fontStyle: 'normal'
      },
      // after: { contentText: ' ', width: '1ch' },
      letterSpacing: '-1ch',
      opacity: '0',
      rangeBehavior: 0,
    });    
  });

     
  console.log(decorations);

  return decorations;
}

export function emojify(
  target: vscode.TextEditor,
  decorations: { [emoji: string]: vscode.TextEditorDecorationType },
  lastUsed?: string[]
) {
  let sourceCode = target.document.getText();
  let decorationArray: { [emoji: string]: vscode.DecorationOptions[] } = {};

  const patches = parse(sourceCode);
  patches.forEach((patch) => {
    //@ts-ignore
    const symbol = symbolMap[patch.type];
      if (!decorationArray[symbol]) {
        decorationArray[symbol] = [];
      }
      let range = new vscode.Range(
        new vscode.Position(patch.start.line -1, patch.start.column),
        new vscode.Position(patch.end.line -1, patch.end.column)
      );
      decorationArray[symbol].push({ range });
  });

  if (lastUsed) {
    lastUsed.forEach((emoji) => {
      target.setDecorations(decorations[emoji], []);
    });
  }

  let used = [];

  for (const decoration in decorationArray) {
    if (decorations.hasOwnProperty(decoration)) {
      target.setDecorations(
        decorations[decoration],
        decorationArray[decoration]
      );

      used.push(decoration);
    }
  }

  return used;
}