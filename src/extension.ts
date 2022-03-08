// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { IconBrowserPanel } from './IconBrowserPanel';
import { SidebarProvider } from './SidebarProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "hero-icon-browser" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json


	context.subscriptions.push(vscode.commands.registerCommand('hero-icon-browser.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		IconBrowserPanel.createOrShow(context.extensionUri);

		vscode.window.showInformationMessage('Hello World from Hero Icon Browser!');
	}));

	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(
		"hero-icon-browser-sidebar",
		sidebarProvider
	));


}

// this method is called when your extension is deactivated
export function deactivate() {}
