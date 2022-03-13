import * as vscode from "vscode";

import Sidebar from "./providers/Sidebar";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "hero-icon-browser" is now active!'
  );

  const sidebarProvider = new Sidebar(context?.extensionUri, {});
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "hero-icon-browser-sidebar",
      sidebarProvider
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
