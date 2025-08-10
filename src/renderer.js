/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';


// UI Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const themeColorInput = document.getElementById('theme-color');
const fontSizeInput = document.getElementById('font-size');
const bgColorInput = document.getElementById('bg-color');
const tabBar = document.getElementById('tab-bar');
const terminalInput = document.getElementById('terminal-input');
const runCmdBtn = document.getElementById('run-cmd');
const outputLines = document.getElementById('output-lines');

// Settings modal logic
settingsBtn.onclick = () => {
	settingsModal.style.display = 'block';
};
closeSettings.onclick = () => {
	settingsModal.style.display = 'none';
};
themeColorInput.oninput = (e) => {
	document.documentElement.style.setProperty('--theme-green', e.target.value);
};
fontSizeInput.oninput = (e) => {
	document.body.style.fontSize = e.target.value + 'px';
};
bgColorInput.oninput = (e) => {
	document.documentElement.style.setProperty('--background-dark', e.target.value);
};


// Tab management
let tabs = [{id: 1, name: 'Tab 1', history: []}];
let activeTab = 1;

function renderTabs() {
	tabBar.innerHTML = '';
	tabs.forEach(tab => {
		const btn = document.createElement('button');
		btn.className = 'tab' + (tab.id === activeTab ? ' active' : '');
		btn.textContent = tab.name;
		btn.onclick = () => switchTab(tab.id);

		// Add close cross
		if (tabs.length > 1) {
			const closeBtn = document.createElement('span');
			closeBtn.textContent = ' ×';
			closeBtn.style.cursor = 'pointer';
			closeBtn.style.marginLeft = '6px';
			closeBtn.onclick = (e) => {
				e.stopPropagation();
				closeTab(tab.id);
			};
			btn.appendChild(closeBtn);
		}

		tabBar.appendChild(btn);
	});
	const addBtn = document.createElement('button');
	addBtn.className = 'tab';
	addBtn.textContent = '+';
	addBtn.onclick = () => newTab();
	tabBar.appendChild(addBtn);
}

function newTab() {
	const id = Date.now();
	tabs.push({id, name: `Tab ${tabs.length+1}`, history: []});
	activeTab = id;
	renderTabs();
	renderHistory();
}
function switchTab(id) {
	activeTab = id;
	renderTabs();
	renderHistory();
}
function closeTab(id) {
	if (tabs.length === 1) return;
	tabs = tabs.filter(tab => tab.id !== id);
	if (!tabs.some(tab => tab.id === activeTab)) activeTab = tabs[0].id;
	renderTabs();
	renderHistory();
}
function renderHistory() {
	outputLines.innerHTML = '';
	const tab = tabs.find(t => t.id === activeTab);
	tab.history.forEach(line => {
		const div = document.createElement('div');
		div.textContent = line;
		outputLines.appendChild(div);
	});
}

function addOutput(text) {
	const tab = tabs.find(t => t.id === activeTab);
	tab.history.push(text);
	renderHistory();
}

renderTabs();
renderHistory();

// Terminal command logic
// (already defined above with tab support)

runCmdBtn.onclick = () => {
	handleCommand(terminalInput.value);
	terminalInput.value = '';
};
terminalInput.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		runCmdBtn.click();
	}
});

// --- Folder navigation and working directory ---
let currentDir = '.';
let dirHistory = [currentDir];
let dirIndex = 0;


document.getElementById('back-btn').onclick = () => {
	if (dirIndex > 0) {
		dirIndex--;
		currentDir = dirHistory[dirIndex];
	addOutput(`Went back to: ${currentDir}`);
		addOutput(`Went back to: ${currentDir}`);
	} else {
		addOutput('No previous folder');
	}
};
document.getElementById('forward-btn').onclick = () => {
	if (dirIndex < dirHistory.length - 1) {
		dirIndex++;
		currentDir = dirHistory[dirIndex];
	addOutput(`Went forward to: ${currentDir}`);
		addOutput(`Went forward to: ${currentDir}`);
	} else {
		addOutput('No next folder');
	}
};

// Update handleCommand to run in currentDir
async function handleCommand(cmd) {
	if (cmd.trim().toLowerCase() === 'bore bore bore') {
		addOutput('🐍 Snake game starting... (easter egg)');
		startSnakeGame();
		return;
	}
	// Matrix emoji output for fun
	if (cmd.trim().toLowerCase() === 'matrix') {
		addOutput('🟢🟩🟢🟩🟢 Matrix mode!');
		return;
	}
	addOutput('> ' + cmd);
	// Run real shell command in currentDir
	if (cmd.trim()) {
		try {
			const result = await window.api.runCommand(cmd, currentDir);
			addOutput(result);
		} catch (e) {
			addOutput('Error running command: ' + e.message);
		}
	}
}

renderFileList();

// Snake game implementation
function startSnakeGame() {
	outputLines.innerHTML = '';
	const gameArea = document.createElement('div');
	gameArea.id = 'snake-game';
	gameArea.style.width = '300px';
	gameArea.style.height = '300px';
	gameArea.style.background = '#111';
	gameArea.style.border = '2px solid var(--theme-green)';
	gameArea.style.position = 'relative';
	gameArea.style.margin = 'auto';
	outputLines.appendChild(gameArea);

	const gridSize = 15;
	let snake = [{x: 7, y: 7}];
	let direction = 'right';
	let food = {x: Math.floor(Math.random()*gridSize), y: Math.floor(Math.random()*gridSize)};
	let gameOver = false;

	function draw() {
		gameArea.innerHTML = '';
		// Draw snake
		snake.forEach((segment, i) => {
			const segDiv = document.createElement('div');
			segDiv.style.position = 'absolute';
			segDiv.style.width = '20px';
			segDiv.style.height = '20px';
			segDiv.style.left = `${segment.x*20}px`;
			segDiv.style.top = `${segment.y*20}px`;
			segDiv.style.background = i === 0 ? 'lime' : 'var(--theme-green)';
			segDiv.style.borderRadius = '5px';
			gameArea.appendChild(segDiv);
		});
		// Draw food
		const foodDiv = document.createElement('div');
		foodDiv.style.position = 'absolute';
		foodDiv.style.width = '20px';
		foodDiv.style.height = '20px';
		foodDiv.style.left = `${food.x*20}px`;
		foodDiv.style.top = `${food.y*20}px`;
		foodDiv.style.background = 'red';
		foodDiv.style.borderRadius = '50%';
		gameArea.appendChild(foodDiv);
	}

	function move() {
		if (gameOver) return;
		const head = {...snake[0]};
		if (direction === 'right') head.x++;
		if (direction === 'left') head.x--;
		if (direction === 'up') head.y--;
		if (direction === 'down') head.y++;
		// Check collision
		if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || snake.some(seg => seg.x === head.x && seg.y === head.y)) {
			gameOver = true;
			setTimeout(() => addOutput('Game Over! Type "bore bore bore" to play again.'), 500);
			return;
		}
		snake.unshift(head);
		// Check food
		if (head.x === food.x && head.y === food.y) {
			food = {x: Math.floor(Math.random()*gridSize), y: Math.floor(Math.random()*gridSize)};
		} else {
			snake.pop();
		}
		draw();
	}

	draw();
	let interval = setInterval(move, 150);

	window.onkeydown = (e) => {
		if (gameOver) return;
		if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up';
		if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down';
		if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
		if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right';
	};
}

// Button actions (scaffold)
document.getElementById('new-btn').onclick = () => addOutput('🆕 New tab created!');
document.getElementById('save-btn').onclick = () => addOutput('💾 Saved!');
document.getElementById('exit-btn').onclick = () => addOutput('❌ Exiting...');
document.getElementById('back-btn').onclick = () => addOutput('⬅️ Back');
document.getElementById('forward-btn').onclick = () => addOutput('➡️ Forward');

// Initial output
addOutput('Welcome to Matrix Terminal! Type "bore bore bore" for a surprise 🐍');
	
	// File browser logic with navigation and working directory
	// (already declared above)

	function renderFileList() {
		const fileList = document.getElementById('file-list');
		fileList.innerHTML = '';
		window.api.listFiles(currentDir).then(files => {
			files.forEach(file => {
				const li = document.createElement('li');
				li.textContent = file;
				li.onclick = () => {
					const newPath = currentDir === '.' ? file : currentDir + '/' + file;
					window.api.listFiles(newPath).then(subFiles => {
						if (subFiles.length > 0) {
							// It's a folder
							currentDir = newPath;
							dirHistory = dirHistory.slice(0, dirIndex + 1);
							dirHistory.push(currentDir);
							dirIndex++;
							renderFileList();
							addOutput(`Changed directory to: ${currentDir}`);
						} else {
							addOutput(`Opened file: ${file}`);
						}
					});
				};
				fileList.appendChild(li);
			});
		});
	}

	document.getElementById('back-btn').onclick = () => {
		if (dirIndex > 0) {
			dirIndex--;
			currentDir = dirHistory[dirIndex];
			renderFileList();
			addOutput(`Went back to: ${currentDir}`);
		} else {
			addOutput('No previous folder');
		}
	};
	document.getElementById('forward-btn').onclick = () => {
		if (dirIndex < dirHistory.length - 1) {
			dirIndex++;
			currentDir = dirHistory[dirIndex];
			renderFileList();
			addOutput(`Went forward to: ${currentDir}`);
		} else {
			addOutput('No next folder');
		}
	};

