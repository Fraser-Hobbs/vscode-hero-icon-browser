import * as vscode from "vscode";
import { getNonce } from "./getNonce";


export class IconBrowserPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: IconBrowserPanel | undefined;

  public static readonly viewType = "Icon-Browser-Panel";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (IconBrowserPanel.currentPanel) {
      IconBrowserPanel.currentPanel._panel.reveal(column);
      IconBrowserPanel.currentPanel._update();
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      IconBrowserPanel.viewType,
      "Hero Icon Browser",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "media"),
        ],
      }
    );

    IconBrowserPanel.currentPanel = new IconBrowserPanel(panel, extensionUri);
  }

  public static kill() {
    IconBrowserPanel.currentPanel?.dispose();
    IconBrowserPanel.currentPanel = undefined;
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    IconBrowserPanel.currentPanel = new IconBrowserPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

  }

  public dispose() {
    IconBrowserPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;

    this._panel.webview.html = this._getHtmlForWebview(webview);
    webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {

    // const scriptUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "out", "compiled/swiper.js")
    // );

    // Local path to css styles
    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "reset.css"
    ));


    const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "vscode.css"
    ));

    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "BrowserPanel.css")
    );

    // // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content=" img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<link href="${cssUri}" rel="stylesheet">

        <script nonce="${nonce}">
        </script>
			</head>

      <body>

      <h2>Test H2</h2>

			</body>
				
			</html>`;
  }
}
