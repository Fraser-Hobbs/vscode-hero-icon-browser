import * as vscode from 'vscode';
import { IconWebview } from './components/IconWebview';
import { Sidebar } from './providers/Sidebar';

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "hero-icon-browser" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('hero-icon-browser.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		IconWebview.createOrShow(context.extensionUri);
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Hero Icon Browser!');
	}));

	const sidebarProvider = new Sidebar(context.extensionUri);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(
		"hero-icon-browser-sidebar",
		sidebarProvider
	));

}

// this method is called when your extension is deactivated
export function deactivate() {}
