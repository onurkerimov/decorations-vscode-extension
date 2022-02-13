import * as vscode from 'vscode';
import { applyDecorations, disposeDecorations } from './decorations'; 
import parse from './parse';
import { settingsKey } from './constants'

function registerCommands() {
  // Command to hide / show annotations
  vscode.commands.registerCommand(`${settingsKey}.toggle`, () => {
    const currentState = vscode.workspace.getConfiguration(settingsKey).get("enabled");
    vscode.workspace.getConfiguration(settingsKey).update("enabled", !currentState, true);
  });
}

const supportedLanguages = ["javascript", "typescript", "javascriptreact", "typescriptreact"];

const run = (_ctx: vscode.ExtensionContext, editor: vscode.TextEditor | undefined) => {
  if(!editor) return;
  if (!supportedLanguages.includes(editor.document.languageId)) return;
  
  const isEnabled = vscode.workspace.getConfiguration(settingsKey).get("enabled");

  if(!isEnabled) {
    disposeDecorations();
    return;
  }

  let sourceCode = editor.document.getText();
  const patches = parse(sourceCode);
  applyDecorations(_ctx, editor, patches);
};

export function activate(ctx: vscode.ExtensionContext) {
  console.log("decorations-vscode-extension is active");
  let timeoutId: ReturnType<typeof setTimeout>;

  registerCommands();

  run(ctx, vscode.window.activeTextEditor);

  // Update when a file opens
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    run(ctx, editor);
  });

  // Update when a file saves
  vscode.workspace.onWillSaveTextDocument((event) => {
    const openEditor = vscode.window.visibleTextEditors.filter((editor) => editor.document.uri === event.document.uri)[0];
    run(ctx, openEditor);
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const openEditor = vscode.window.visibleTextEditors.filter((editor) => editor.document.uri === event.document.uri)[0];
      run(ctx, openEditor);
    }, 100);
  });

    /**
   * Any time we move anywhere around our editor, we want to trigger
   * a decoration.
   */
    vscode.window.onDidChangeTextEditorSelection(() => {
      run(ctx, vscode.window.activeTextEditor);
    });

  // Update if the config was changed
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(settingsKey)) {
      run(ctx, vscode.window.activeTextEditor);
    }
  });
}

export function deactivate() {
  console.log("DONE");
}