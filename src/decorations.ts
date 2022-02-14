import * as vscode from 'vscode';

const keywordDecoration = vscode.window.createTextEditorDecorationType({
  letterSpacing: '-1ch',
  opacity: '0',
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
  // ';': '',
  'export default': '❮',
  // function: "ƒn",
  // true: '🄣',
  // false: '🅵',
  // undefined: '🄤',
  // null: '🄝',
};

export const applyDecorations = (_ctx: vscode.ExtensionContext, editor: vscode.TextEditor, patches: any[]) => {
  const cursorPosition = editor.selection.active;
  const selectionStartPosition = editor.selection.anchor;
  const selectionEndLine = cursorPosition.line;   
  const selectionStartLine = selectionStartPosition.line;

  const isMultiline = selectionEndLine !== selectionStartLine 
  const isPseudoMultiline = (cursorPosition.character === 0 && cursorPosition.line === selectionStartLine + 1); 
  

  if(isMultiline && !isPseudoMultiline || editor.selections.length > 1) {
    editor.setDecorations(keywordDecoration, []);
    return;
  }
  


  const decorationsArray = patches
    .filter(patch => decorationTypeMap[patch.type])
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
          },
          letterSpacing: '-1ch',
          opacity: '0',
        }
      } as vscode.DecorationOptions;
    })
    .filter(item => {
      if(isPseudoMultiline){
        if(item.range.start.line === selectionStartLine) {
          return false;
        }
        // return true
      }
      if(
        item.range.start.line === selectionEndLine
        && cursorPosition.isBeforeOrEqual(item.range.end)
        && cursorPosition.isAfterOrEqual(item.range.start) 
      ) {
        // if(
        //   selectionStartPosition.isBefore(item.range.end)
        //   && selectionStartPosition.isAfter(item.range.start) &&
        //     cursorPosition.isBefore(item.range.end)
        //     && cursorPosition.isAfter(item.range.start) 
        //     && !editor.selection.contains(item.range)
        // ) {
        //   editor.selections = [
        //     new vscode.Selection(
        //       item.range.start.line, 
        //       item.range.start.character,
        //       item.range.end.line,
        //       item.range.end.character
        //     )
        //   ];
        // }
        return false;
      }
      return true;
    });
  editor.setDecorations(keywordDecoration, decorationsArray);
};

export const disposeDecorations = () => {
  keywordDecoration.dispose();
};