import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

let statusBar: vscode.StatusBarItem;
let javaProcess: cp.ChildProcessWithoutNullStreams | undefined;
let stdioBuffer = '';

export function activate(context: vscode.ExtensionContext) {
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = 'pomodoro.startPause';
    statusBar.text = '$(play) Работа 25:00';
    statusBar.show();

    context.subscriptions.push(
        vscode.commands.registerCommand('pomodoro.startPause', () => {
            sendToJava('start'); 
        }),
        vscode.commands.registerCommand('pomodoro.reset', () => {
            sendToJava('reset');
        })
    );

    startJavaServer(context);

    context.subscriptions.push({
        dispose: () => {
            sendToJava('quit');
            if (javaProcess) javaProcess.kill();
            statusBar.dispose();
        }
    });

    context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('pomodoro.view', new PomodoroViewProvider(context.extensionUri))
    );
}

function startJavaServer(context: vscode.ExtensionContext) {
    const jarPath = path.join(context.extensionPath, 'java-server', 'pomodoro-server.jar');
    javaProcess = cp.spawn('java', ['-jar', jarPath]);

    javaProcess.stdout.on('data', (data: Buffer) => {
        stdioBuffer += data.toString();
        let idx: number;
        while ((idx = stdioBuffer.indexOf('\n')) >= 0) {
            const line = stdioBuffer.slice(0, idx).trim();
            stdioBuffer = stdioBuffer.slice(idx + 1);
            if (line) handleJavaMessage(line);
        }
    });

    javaProcess.stderr.on('data', (d: Buffer) => {
        console.error('[pomodoro-java]', d.toString());
    });
}

function sendToJava(cmd: string) {
    if (javaProcess && javaProcess.stdin.writable) {
        javaProcess.stdin.write(cmd + '\n');
    }
}

function handleJavaMessage(line: string) {
    let msg: { remaining: number; phase: 'work' | 'break'; event: string | null };
    try {
        msg = JSON.parse(line);
    } catch {
        return;
    }

    const min = Math.floor(msg.remaining / 60).toString().padStart(2, '0');
    const sec = (msg.remaining % 60).toString().padStart(2, '0');
    const phase = msg.phase === 'work' ? 'Работа' : 'Перерыв';
    statusBar.text = `$(watch) ${phase} ${min}:${sec}`;

    if (msg.event === 'work_done') {
        vscode.window.showInformationMessage('🍅 Помидор вырос! Перерыв 5 минут.');
    } else if (msg.event === 'break_done') {
        vscode.window.showInformationMessage('☕ Перерыв закончен. Растим новый помидор.');
    }
}

export function deactivate() {
    sendToJava('quit');
    if (javaProcess) javaProcess.kill();
    if (statusBar) statusBar.dispose();
}

class PomodoroViewProvider implements vscode.WebviewViewProvider {
    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = `
        <html>
        <body style="text-align:center; font-family:sans-serif;">
            <h2 id="timer">25:00</h2>
            <button onclick="send('start')">Старт</button>
            <button onclick="send('reset')">Сброс</button>
            <script>
                const vscode = acquireVsCodeApi();
                function send(cmd) { vscode.postMessage({ command: cmd }); }
                // Здесь можно ловить сообщения от Java и менять цифры
            </script>
        </body>
        </html>`;
        
        webviewView.webview.onDidReceiveMessage(msg => {
            if (msg.command === 'start') sendToJava('start');
            if (msg.command === 'reset') sendToJava('reset');
        });
    }
}