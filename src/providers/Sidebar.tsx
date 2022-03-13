import {WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, window}from "vscode";
import getNonce from "../utilities/getNonce";


export default class Sidebar implements WebviewViewProvider {
  constructor(
      private readonly extensionPath: Uri,
      private _view: any = null
    ) {}

    private onDidChangeTreeData: EventEmitter<any | undefined | null | void> = new EventEmitter<any | undefined | null | void>();

    refresh(context: any): void {
      this.onDidChangeTreeData.fire(null);
      this._view.webview.html = this._getHtmlForWebview(this._view?.webview);
    }

    resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this.extensionPath],
      };
      webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
      this._view = webviewView;
      this.activeMessageListener();
    }

    private activeMessageListener() {
      this._view.webview.onDidReceiveMessage((message: any) => {
        switch (message.action) {
          case 'SHOW_WARNING_LOG':
            window.showWarningMessage(message.data.message);
            console.log(message.data.message);
            break;
          default:
            break;
        }
      });
    }

    private _getHtmlForWebview(webview: Webview) {
      // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
      // Script to handle user action
      const scriptUri = webview.asWebviewUri(
        Uri.joinPath(this.extensionPath, "script", "left-webview-provider.js")
      );
      const constantUri = webview.asWebviewUri(
        Uri.joinPath(this.extensionPath, "script", "constant.js")
      );
      // CSS file to handle styling
      const styleUri = webview.asWebviewUri(
        Uri.joinPath(this.extensionPath, "script", "left-webview-provider.css")
      );

  
      // Use a nonce to only allow a specific script to be run.
      const nonce = getNonce();
  
      return `
        <html>
          <head>
            <meta charSet="utf-8"/>
            <meta http-equiv="Content-Security-Policy" content="default-src 'none';
                  img-src vscode-resource: https:; font-src ${webview.cspSource};
                  style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">           
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
          </head>
          <h2>SideBar Provider</h2>
          <body>
            <script nonce="${nonce}" type="text/javascript" src="${constantUri}"></script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>`;
    }
  }
