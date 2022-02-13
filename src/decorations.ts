import * as vscode from 'vscode';

const keywordDecoration = vscode.window.createTextEditorDecorationType({
  letterSpacing: '-1ch',
  opacity: '0',
  rangeBehavior: 1,
});

const semicolonDecoration = vscode.window.createTextEditorDecorationType({});

// const symbolMap = {
//   declarationSmall: {
//     var: "∅",
//     let: "◦",
//     const: "∙",
//   },
//   declarationLarge: {
//     var: "∅",
//     let: "○",
//     const: "●"
//   }
//   // ⨀⨁⨂⨳⨴⨵⨷⨸⧬⧭⊕⊖⊗⊘⊙⊚⊛⊜⊝⊞⊟⊠⏁⏂⏀◐◑◒◓◌◯
// };

const decorationTypeMap: Record<string, string> = {
  var: "∅",
  let: "○",
  const: "●",
  return: "⮑", //"➔",//"➞","↳"
  import: '❯', //'⬇',
  export: '❮', //'⬆',
  type: '✣',
  interface: '✣',
  ';': '',
  'export default': '❮',
  // function: "ƒn",
  // true: '🄣',
  // false: '🅵',
  // undefined: '🄤',
  // null: '🄝',
};

export const applyDecorations = (_ctx: vscode.ExtensionContext, editor: vscode.TextEditor, patches: any[]) => {
  const currentLine = editor.selection.active.line;   
  
  const decorationsArray = patches
    .map((patch) => {
      return {
        range: new vscode.Range(
          new vscode.Position(patch.start.line -1, patch.start.column),
          new vscode.Position(patch.end.line -1, patch.end.column)
        ),
        renderOptions: {
          before: {
            contentText: decorationTypeMap[patch.type],
            fontStyle: vscode.workspace.getConfiguration("decorations").get("fontStyle"),
            fontWeight: vscode.workspace.getConfiguration("decorations").get("fontWeight"),
          }
        }
      } as vscode.DecorationOptions;
    })
    .filter(item => {
      if(item.range.start.line === currentLine || item.range.start.line === currentLine) {
        return false
      }
      return true
    });
  editor.setDecorations(keywordDecoration, decorationsArray);
};

export const disposeDecorations = () => {
  keywordDecoration.dispose();
};