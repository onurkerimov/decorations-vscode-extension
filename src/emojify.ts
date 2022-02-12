import * as vscode from 'vscode';
import looseParse from './looseParse';

const symbolMap = {
  var: "∅",
  let: "○",
  const: "●",
  // interface: "■",
  // function: "ƒn",
  return: "⮑",//"➔",//"➞","↳"
  import: '❯',//'⬇',
  export: '❮'//'⬆',
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

  return decorations;
}

export function emojify(
  target: vscode.TextEditor,
  decorations: { [emoji: string]: vscode.TextEditorDecorationType }) {
  let sourceCode = target.document.getText();
  let decorationArray: { [emoji: string]: vscode.DecorationOptions[] } = {};

  const patches = looseParse(sourceCode);
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