class TypingTestApp {
    constructor() {
        this.currentTab = 'typing-test';
        this.typingTexts = [];
        this.htmlSnippets = [];
        this.currentText = '';
        this.currentSnippet = '';
        
        // Typing test state
        this.isTyping = false;
        this.startTime = null;
        this.timer = null;
        this.totalCharacters = 0;
        this.correctCharacters = 0;
        
        // HTML practice state
        this.isHtmlTyping = false;
        this.htmlStartTime = null;
        this.htmlTimer = null;
        this.htmlTotalCharacters = 0;
        this.htmlCorrectCharacters = 0;
        
        // Word Race state
        this.raceActive = false;
        this.raceWords = ['javascript', 'python', 'react', 'coding', 'typing', 'keyboard', 'computer', 'program', 'function', 'variable'];
        this.raceCurrentWord = '';
        this.raceScore = 0;
        this.raceWordsCompleted = 0;
        this.raceTimeLeft = 30;
        this.raceTimer = null;
        
        // Typing Shooter state
        this.shooterActive = false;
        this.shooterWords = ['bug', 'code', 'app', 'web', 'css', 'html', 'js', 'api', 'git', 'npm'];
        this.fallingWords = [];
        this.shooterScore = 0;
        this.targetsHit = 0;
        this.lives = 3;
        this.shooterTimer = null;
        
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.bindEvents();
        this.loadData();
        this.showTab(this.currentTab);
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('typing-test-theme') || 'dark';
        document.getElementById('themeSelect').value = savedTheme;
        this.applyTheme(savedTheme);
    }
    
    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
        localStorage.setItem('typing-test-theme', theme);
    }
    
    bindEvents() {
        // Theme selector
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
        });
        
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.showTab(e.target.dataset.tab);
            });
        });
        
        // Typing Test
        document.getElementById('startTest').addEventListener('click', () => this.startTypingTest());
        document.getElementById('resetTest').addEventListener('click', () => this.resetTypingTest());
        document.getElementById('newText').addEventListener('click', () => this.loadNewText());
        document.getElementById('typingInput').addEventListener('input', (e) => this.handleTyping(e));
        
        // HTML Practice
        document.getElementById('startHtml').addEventListener('click', () => this.startHtmlPractice());
        document.getElementById('resetHtml').addEventListener('click', () => this.resetHtmlPractice());
        document.getElementById('newSnippet').addEventListener('click', () => this.loadNewSnippet());
        document.getElementById('htmlInput').addEventListener('input', (e) => this.handleHtmlTyping(e));
        
        // Word Race
        document.getElementById('startRace').addEventListener('click', () => this.startWordRace());
        document.getElementById('resetRace').addEventListener('click', () => this.resetWordRace());
        document.getElementById('raceInput').addEventListener('keypress', (e) => this.handleRaceInput(e));
        
        // Typing Shooter
        document.getElementById('startShooter').addEventListener('click', () => this.startTypingShooter());
        document.getElementById('resetShooter').addEventListener('click', () => this.resetTypingShooter());
        document.getElementById('shooterInput').addEventListener('keypress', (e) => this.handleShooterInput(e));
        
        // Content Manager
        document.getElementById('saveTypingTexts').addEventListener('click', () => this.saveTypingTexts());
        document.getElementById('saveHtmlSnippets').addEventListener('click', () => this.saveHtmlSnippets());
    }
    
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Load content for content manager
        if (tabName === 'content-manager') {
            this.loadContentManager();
        }
    }
    
    async loadData() {
        try {
            const [textsResponse, snippetsResponse] = await Promise.all([
                fetch('/api/typing-texts'),
                fetch('/api/html-snippets')
            ]);
            
            const textsData = await textsResponse.json();
            const snippetsData = await snippetsResponse.json();
            
            this.typingTexts = textsData.texts || [];
            this.htmlSnippets = snippetsData.snippets || [];
            
            this.loadNewText();
            this.loadNewSnippet();
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback data
            this.typingTexts = [
                "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once.",
                "Programming is not just about writing code; it's about solving problems and creating solutions that make life easier.",
                "In the world of web development, HTML provides structure, CSS adds style, and JavaScript brings interactivity to life."
            ];
            this.htmlSnippets = [
                '<div class="container"><h1>Hello World</h1><p>Welcome to HTML!</p></div>',
                '<nav class="navbar"><ul><li><a href="#home">Home</a></li><li><a href="#about">About</a></li></ul></nav>',
                '<form action="/submit" method="post"><input type="text" name="username" required><button type="submit">Submit</button></form>'
            ];
            this.loadNewText();
            this.loadNewSnippet();
        }
    }
    
    // Typing Test Methods
    loadNewText() {
        if (this.typingTexts.length > 0) {
            this.currentText = this.typingTexts[Math.floor(Math.random() * this.typingTexts.length)];
            document.getElementById('textDisplay').textContent = this.currentText;
        }
    }
    
    startTypingTest() {
        this.isTyping = true;
        this.startTime = Date.now();
        this.totalCharacters = 0;
        this.correctCharacters = 0;
        
        const input = document.getElementById('typingInput');
        input.value = '';
        input.disabled = false;
        input.focus();
        
        document.getElementById('startTest').disabled = true;
        
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timer').textContent = `${elapsed}s`;
        }, 1000);
    }
    
    resetTypingTest() {
        this.isTyping = false;
        clearInterval(this.timer);
        
        document.getElementById('typingInput').value = '';
        document.getElementById('typingInput').disabled = false;
        document.getElementById('startTest').disabled = false;
        document.getElementById('timer').textContent = '0s';
        document.getElementById('wpm').textContent = '0';
        document.getElementById('accuracy').textContent = '100%';
        
        this.loadNewText();
        this.highlightText('');
    }
    
    handleTyping(e) {
        if (!this.isTyping) return;
        
        const input = e.target.value;
        this.totalCharacters = input.length;
        this.correctCharacters = 0;
        
        for (let i = 0; i < input.length; i++) {
            if (i < this.currentText.length && input[i] === this.currentText[i]) {
                this.correctCharacters++;
            }
        }
        
        this.updateStats();
        this.highlightText(input);
        
        // Check if completed
        if (input === this.currentText) {
            this.completeTypingTest();
        }
    }
    
    highlightText(input) {
        const display = document.getElementById('textDisplay');
        let html = '';
        
        for (let i = 0; i < this.currentText.length; i++) {
            const char = this.currentText[i];
            
            if (i < input.length) {
                if (input[i] === char) {
                    html += `<span class="correct">${char}</span>`;
                } else {
                    html += `<span class="incorrect">${char}</span>`;
                }
            } else if (i === input.length) {
                html += `<span class="current">${char}</span>`;
            } else {
                html += char;
            }
        }
        
        display.innerHTML = html;
    }
    
    updateStats() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const minutes = elapsed / 60;
        const wpm = Math.round((this.correctCharacters / 5) / minutes) || 0;
        const accuracy = Math.round((this.correctCharacters / Math.max(this.totalCharacters, 1)) * 100);
        
        document.getElementById('wpm').textContent = wpm;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }
    
    completeTypingTest() {
        this.isTyping = false;
        clearInterval(this.timer);
        document.getElementById('typingInput').disabled = true;
        document.getElementById('startTest').disabled = false;
        
        // Show completion message
        setTimeout(() => {
            alert('🎉 Congratulations! You completed the typing test!');
        }, 100);
    }
    
    // HTML Practice Methods
    loadNewSnippet() {
        if (this.htmlSnippets.length > 0) {
            this.currentSnippet = this.htmlSnippets[Math.floor(Math.random() * this.htmlSnippets.length)];
            document.getElementById('htmlDisplay').textContent = this.currentSnippet;
        }
    }
    
    startHtmlPractice() {
        this.isHtmlTyping = true;
        this.htmlStartTime = Date.now();
        this.htmlTotalCharacters = 0;
        this.htmlCorrectCharacters = 0;
        
        const input = document.getElementById('htmlInput');
        input.value = '';
        input.disabled = false;
        input.focus();
        
        document.getElementById('startHtml').disabled = true;
        
        this.htmlTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.htmlStartTime) / 1000);
            document.getElementById('htmlTimer').textContent = `${elapsed}s`;
        }, 1000);
    }
    
    resetHtmlPractice() {
        this.isHtmlTyping = false;
        clearInterval(this.htmlTimer);
        
        document.getElementById('htmlInput').value = '';
        document.getElementById('htmlInput').disabled = false;
        document.getElementById('startHtml').disabled = false;
        document.getElementById('htmlTimer').textContent = '0s';
        document.getElementById('htmlWpm').textContent = '0';
        document.getElementById('htmlAccuracy').textContent = '100%';
        
        this.loadNewSnippet();
        this.highlightHtmlText('');
    }
    
    handleHtmlTyping(e) {
        if (!this.isHtmlTyping) return;
        
        const input = e.target.value;
        this.htmlTotalCharacters = input.length;
        this.htmlCorrectCharacters = 0;
        
        for (let i = 0; i < input.length; i++) {
            if (i < this.currentSnippet.length && input[i] === this.currentSnippet[i]) {
                this.htmlCorrectCharacters++;
            }
        }
        
        this.updateHtmlStats();
        this.highlightHtmlText(input);
        
        // Check if completed
        if (input === this.currentSnippet) {
            this.completeHtmlPractice();
        }
    }
    
    highlightHtmlText(input) {
        const display = document.getElementById('htmlDisplay');
        let html = '';
        
        for (let i = 0; i < this.currentSnippet.length; i++) {
            const char = this.currentSnippet[i];
            
            if (i < input.length) {
                if (input[i] === char) {
                    html += `<span class="correct">${char}</span>`;
                } else {
                    html += `<span class="incorrect">${char}</span>`;
                }
            } else if (i === input.length) {
                html += `<span class="current">${char}</span>`;
            } else {
                html += char;
            }
        }
        
        display.innerHTML = html;
    }
    
    updateHtmlStats() {
        const elapsed = (Date.now() - this.htmlStartTime) / 1000;
        const minutes = elapsed / 60;
        const wpm = Math.round((this.htmlCorrectCharacters / 5) / minutes) || 0;
        const accuracy = Math.round((this.htmlCorrectCharacters / Math.max(this.htmlTotalCharacters, 1)) * 100);
        
        document.getElementById('htmlWpm').textContent = wpm;
        document.getElementById('htmlAccuracy').textContent = `${accuracy}%`;
    }
    
    completeHtmlPractice() {
        this.isHtmlTyping = false;
        clearInterval(this.htmlTimer);
        document.getElementById('htmlInput').disabled = true;
        document.getElementById('startHtml').disabled = false;
        
        setTimeout(() => {
            alert('🎉 Great job! HTML snippet completed!');
        }, 100);
    }
    
    // Word Race Game Methods
    startWordRace() {
        this.raceActive = true;
        this.raceScore = 0;
        this.raceWordsCompleted = 0;
        this.raceTimeLeft = 30;
        
        document.getElementById('raceInput').disabled = false;
        document.getElementById('raceInput').focus();
        document.getElementById('startRace').disabled = true;
        
        this.nextRaceWord();
        
        this.raceTimer = setInterval(() => {
            this.raceTimeLeft--;
            document.getElementById('raceTimer').textContent = `${this.raceTimeLeft}s`;
            
            if (this.raceTimeLeft <= 0) {
                this.endWordRace();
            }
        }, 1000);
    }
    
    nextRaceWord() {
        this.raceCurrentWord = this.raceWords[Math.floor(Math.random() * this.raceWords.length)];
        document.getElementById('raceWord').textContent = this.raceCurrentWord;
        document.getElementById('raceInput').value = '';
    }
    
    handleRaceInput(e) {
        if (!this.raceActive || e.key !== 'Enter') return;
        
        const input = e.target.value.trim();
        
        if (input === this.raceCurrentWord) {
            this.raceWordsCompleted++;
            this.raceScore += input.length * 10;
            
            document.getElementById('wordsCompleted').textContent = `${this.raceWordsCompleted}/∞`;
            document.getElementById('raceScore').textContent = this.raceScore;
            
            this.nextRaceWord();
        }
        
        e.target.value = '';
    }
    
    endWordRace() {
        this.raceActive = false;
        clearInterval(this.raceTimer);
        document.getElementById('raceInput').disabled = true;
        document.getElementById('startRace').disabled = false;
        
        setTimeout(() => {
            alert(`🏁 Race finished! You typed ${this.raceWordsCompleted} words and scored ${this.raceScore} points!`);
        }, 100);
    }
    
    resetWordRace() {
        this.raceActive = false;
        clearInterval(this.raceTimer);
        
        this.raceScore = 0;
        this.raceWordsCompleted = 0;
        this.raceTimeLeft = 30;
        
        document.getElementById('raceWord').textContent = 'Click Start to begin!';
        document.getElementById('raceInput').value = '';
        document.getElementById('raceInput').disabled = true;
        document.getElementById('wordsCompleted').textContent = '0/∞';
        document.getElementById('raceTimer').textContent = '30s';
        document.getElementById('raceScore').textContent = '0';
        document.getElementById('startRace').disabled = false;
    }
    
    // Typing Shooter Game Methods
    startTypingShooter() {
        this.shooterActive = true;
        this.shooterScore = 0;
        this.targetsHit = 0;
        this.lives = 3;
        this.fallingWords = [];
        
        document.getElementById('shooterInput').disabled = false;
        document.getElementById('shooterInput').focus();
        document.getElementById('startShooter').disabled = true;
        
        const area = document.getElementById('shooterArea');
        area.innerHTML = '';
        
        this.shooterTimer = setInterval(() => {
            this.spawnFallingWord();
            this.updateFallingWords();
        }, 1500);
    }
    
    spawnFallingWord() {
        if (!this.shooterActive) return;
        
        const word = this.shooterWords[Math.floor(Math.random() * this.shooterWords.length)];
        const wordElement = document.createElement('div');
        wordElement.className = 'falling-word';
        wordElement.textContent = word;
        wordElement.style.left = Math.random() * 80 + '%';
        wordElement.style.top = '-50px';
        
        const area = document.getElementById('shooterArea');
        area.appendChild(wordElement);
        
        this.fallingWords.push({
            element: wordElement,
            word: word,
            startTime: Date.now()
        });
    }
    
    updateFallingWords() {
        if (!this.shooterActive) return;
        
        this.fallingWords = this.fallingWords.filter(wordObj => {
            const elapsed = (Date.now() - wordObj.startTime) / 1000;
            const position = elapsed * 60; // pixels per second
            
            if (position > 350) {
                // Word reached bottom
                wordObj.element.remove();
                this.lives--;
                document.getElementById('lives').textContent = this.lives;
                
                if (this.lives <= 0) {
                    this.endTypingShooter();
                }
                
                return false;
            }
            
            wordObj.element.style.top = position + 'px';
            return true;
        });
    }
    
    handleShooterInput(e) {
        if (!this.shooterActive || e.key !== 'Enter') return;
        
        const input = e.target.value.trim();
        
        // Find matching falling word
        const matchIndex = this.fallingWords.findIndex(wordObj => wordObj.word === input);
        
        if (matchIndex !== -1) {
            const wordObj = this.fallingWords[matchIndex];
            wordObj.element.remove();
            this.fallingWords.splice(matchIndex, 1);
            
            this.targetsHit++;
            this.shooterScore += input.length * 20;
            
            document.getElementById('targetsHit').textContent = this.targetsHit;
            document.getElementById('shooterScore').textContent = this.shooterScore;
        }
        
        e.target.value = '';
    }
    
    endTypingShooter() {
        this.shooterActive = false;
        clearInterval(this.shooterTimer);
        
        // Remove all falling words
        this.fallingWords.forEach(wordObj => wordObj.element.remove());
        this.fallingWords = [];
        
        document.getElementById('shooterInput').disabled = true;
        document.getElementById('startShooter').disabled = false;
        
        setTimeout(() => {
            alert(`🎯 Game Over! You hit ${this.targetsHit} targets and scored ${this.shooterScore} points!`);
        }, 100);
    }
    
    resetTypingShooter() {
        this.shooterActive = false;
        clearInterval(this.shooterTimer);
        
        // Remove all falling words
        this.fallingWords.forEach(wordObj => wordObj.element.remove());
        this.fallingWords = [];
        
        this.shooterScore = 0;
        this.targetsHit = 0;
        this.lives = 3;
        
        const area = document.getElementById('shooterArea');
        area.innerHTML = '<div class="shooter-instruction">Type the falling words to shoot them! 🚀</div>';
        
        document.getElementById('shooterInput').value = '';
        document.getElementById('shooterInput').disabled = true;
        document.getElementById('targetsHit').textContent = '0';
        document.getElementById('shooterScore').textContent = '0';
        document.getElementById('lives').textContent = '3';
        document.getElementById('startShooter').disabled = false;
    }
    
    // Content Manager Methods
    loadContentManager() {
        document.getElementById('typingTextsEditor').value = this.typingTexts.join('\n');
        document.getElementById('htmlSnippetsEditor').value = this.htmlSnippets.join('\n');
    }
    
    async saveTypingTexts() {
        const texts = document.getElementById('typingTextsEditor').value
            .split('\n')
            .map(text => text.trim())
            .filter(text => text.length > 0);
        
        try {
            const response = await fetch('/api/typing-texts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ texts }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.typingTexts = texts;
                this.showStatusMessage('✅ Typing texts saved successfully!', 'success');
                this.loadNewText();
            } else {
                this.showStatusMessage('❌ Error saving typing texts: ' + result.error, 'error');
            }
        } catch (error) {
            this.showStatusMessage('❌ Error saving typing texts: ' + error.message, 'error');
        }
    }
    
    async saveHtmlSnippets() {
        const snippets = document.getElementById('htmlSnippetsEditor').value
            .split('\n')
            .map(snippet => snippet.trim())
            .filter(snippet => snippet.length > 0);
        
        try {
            const response = await fetch('/api/html-snippets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ snippets }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.htmlSnippets = snippets;
                this.showStatusMessage('✅ HTML snippets saved successfully!', 'success');
                this.loadNewSnippet();
            } else {
                this.showStatusMessage('❌ Error saving HTML snippets: ' + result.error, 'error');
            }
        } catch (error) {
            this.showStatusMessage('❌ Error saving HTML snippets: ' + error.message, 'error');
        }
    }
    
    showStatusMessage(message, type) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'status-message';
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypingTestApp();
});