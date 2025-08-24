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
        this.bestWpm = parseInt(localStorage.getItem('typing-test-best-wpm') || '0', 10);
        this.confettiCanvas = null;
        this.disableBackspace = false;
        
        // HTML practice state
        this.isHtmlTyping = false;
        this.htmlStartTime = null;
        this.htmlTimer = null;
        this.htmlTotalCharacters = 0;
        this.htmlCorrectCharacters = 0;
        this.disableBackspaceHtml = false;
        
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

        // Hide caret initially
        document.getElementById('typingInput').classList.add('hide-caret');
        document.getElementById('htmlInput').classList.add('hide-caret');

        // Disable text selection for display areas
        document.getElementById('textDisplay').classList.add('no-select');
        document.getElementById('htmlDisplay').classList.add('no-select');
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
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.addEventListener('change', (e) => this.applyTheme(e.target.value));

        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.showTab(e.target.dataset.tab);
            });
        });

        // Typing Test
        const startTest = document.getElementById('startTest');
        if (startTest) startTest.addEventListener('click', () => this.startTypingTest());
        const resetTest = document.getElementById('resetTest');
        if (resetTest) resetTest.addEventListener('click', () => this.resetTypingTest());
        const typingInput = document.getElementById('typingInput');
        if (typingInput) {
            typingInput.addEventListener('input', (e) => this.handleTyping(e));
            typingInput.addEventListener('keydown', (e) => {
                if (!this.isTyping && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                }
                if (this.disableBackspace && e.key === 'Backspace') {
                    e.preventDefault();
                }
            });
        }
        const newText = document.getElementById('newText');
        if (newText) newText.addEventListener('click', () => this.loadNewText());
        const toggleBackspace = document.getElementById('toggleBackspace');
        if (toggleBackspace) toggleBackspace.addEventListener('click', () => this.toggleBackspace());

        // HTML Practice
        const startHtml = document.getElementById('startHtml');
        if (startHtml) startHtml.addEventListener('click', () => this.startHtmlPractice());
        const resetHtml = document.getElementById('resetHtml');
        if (resetHtml) resetHtml.addEventListener('click', () => this.resetHtmlPractice());
        const htmlInput = document.getElementById('htmlInput');
        if (htmlInput) {
            htmlInput.addEventListener('input', (e) => this.handleHtmlTyping(e));
            htmlInput.addEventListener('keydown', (e) => {
                if (!this.isHtmlTyping && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                }
                if (this.disableBackspaceHtml && e.key === 'Backspace') {
                    e.preventDefault();
                }
            });
        }
        const newSnippet = document.getElementById('newSnippet');
        if (newSnippet) newSnippet.addEventListener('click', () => this.loadNewSnippet());
        const toggleBackspaceHtml = document.getElementById('toggleBackspaceHtml');
        if (toggleBackspaceHtml) toggleBackspaceHtml.addEventListener('click', () => this.toggleBackspaceHtml());

        // Word Race
        const startRace = document.getElementById('startRace');
        if (startRace) startRace.addEventListener('click', () => this.startWordRace());
        const resetRace = document.getElementById('resetRace');
        if (resetRace) resetRace.addEventListener('click', () => this.resetWordRace());
        const raceInput = document.getElementById('raceInput');
        if (raceInput) raceInput.addEventListener('keydown', (e) => this.handleRaceInput(e));

        // Typing Shooter
        const startShooter = document.getElementById('startShooter');
        if (startShooter) startShooter.addEventListener('click', () => this.startTypingShooter());
        const resetShooter = document.getElementById('resetShooter');
        if (resetShooter) resetShooter.addEventListener('click', () => this.resetTypingShooter());
        const shooterInput = document.getElementById('shooterInput');
        if (shooterInput) shooterInput.addEventListener('keydown', (e) => this.handleShooterInput(e));

        // Content Manager
        const saveTypingTexts = document.getElementById('saveTypingTexts');
        if (saveTypingTexts) saveTypingTexts.addEventListener('click', () => this.saveTypingTexts());
        const saveHtmlSnippets = document.getElementById('saveHtmlSnippets');
        if (saveHtmlSnippets) saveHtmlSnippets.addEventListener('click', () => this.saveHtmlSnippets());
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

            // Ensure progress tracker is shown on load
            this.highlightText('');
            this.highlightHtmlText('');
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

            // Ensure progress tracker is shown on load (fallback)
            this.highlightText('');
            this.highlightHtmlText('');
        }
    }
    
    // Typing Test Methods
    loadNewText() {
        if (this.typingTexts.length > 0) {
            this.currentText = this.typingTexts[Math.floor(Math.random() * this.typingTexts.length)];
            document.getElementById('textDisplay').textContent = this.currentText;
            // Show progress tracker immediately
            this.highlightText(document.getElementById('typingInput').value || '');
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
        input.classList.remove('hide-caret'); // Show caret
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
        
        const input = document.getElementById('typingInput');
        input.value = '';
        input.disabled = false;
        input.classList.add('hide-caret'); // Hide caret
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

        // If backspace is disabled, end test when input length matches or exceeds target length
        if (this.disableBackspace && input.length >= this.currentText.length) {
            // Prevent further typing
            e.target.value = input.slice(0, this.currentText.length);
            this.isTyping = false;
            this.completeTypingTest(true);
        } else if (!this.disableBackspace && input === this.currentText) {
            this.completeTypingTest(false);
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
    
    completeTypingTest(forceEndWithErrors = false) {
        this.isTyping = false;
        clearInterval(this.timer);
        document.getElementById('typingInput').disabled = true;
        document.getElementById('startTest').disabled = false;

        // Calculate final WPM
        const elapsed = (Date.now() - this.startTime) / 1000;
        const minutes = elapsed / 60;
        const wpm = Math.round((this.correctCharacters / 5) / minutes) || 0;

        // Check for new high score
        if (!forceEndWithErrors && wpm > this.bestWpm) {
            this.bestWpm = wpm;
            localStorage.setItem('typing-test-best-wpm', wpm);
            this.showConfetti();
            setTimeout(() => {
                alert(`🎉 You beat your high score! Your new high score is: ${wpm} WPM`);
            }, 100);
        } else if (!forceEndWithErrors) {
            setTimeout(() => {
                alert('🎉 Congratulations! You completed the typing test!');
            }, 100);
        } else {
            setTimeout(() => {
                alert('⚠️ Test ended. There are typing errors (backspace was disabled).');
            }, 100);
        }
    }

    showConfetti() {
        // Create a canvas overlay for confetti
        if (!this.confettiCanvas) {
            this.confettiCanvas = document.createElement('canvas');
            this.confettiCanvas.style.position = 'fixed';
            this.confettiCanvas.style.left = 0;
            this.confettiCanvas.style.top = 0;
            this.confettiCanvas.style.width = '100vw';
            this.confettiCanvas.style.height = '100vh';
            this.confettiCanvas.style.pointerEvents = 'none';
            this.confettiCanvas.style.zIndex = 9999;
            document.body.appendChild(this.confettiCanvas);
        }
        const canvas = this.confettiCanvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');

        // Confetti particles
        const confettiCount = 120;
        const confetti = [];
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8be9fd', '#ffb86c', '#50fa7b', '#f1fa8c'];
        for (let i = 0; i < confettiCount; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * confettiCount,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 10,
                tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                tiltAngle: 0
            });
        }

        let angle = 0;
        let tiltAngle = 0;
        let frame = 0;
        function drawConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            angle += 0.01;
            tiltAngle += 0.1;
            for (let i = 0; i < confettiCount; i++) {
                let c = confetti[i];
                c.tiltAngle += c.tiltAngleIncremental;
                c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
                c.x += Math.sin(angle);
                c.tilt = Math.sin(c.tiltAngle - (i % 3)) * 15;

                ctx.beginPath();
                ctx.lineWidth = c.r;
                ctx.strokeStyle = c.color;
                ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
                ctx.lineTo(c.x + c.tilt, c.y + c.tilt + 10);
                ctx.stroke();
            }
            frame++;
            if (frame < 90) {
                requestAnimationFrame(drawConfetti);
            } else {
                canvas.parentNode && canvas.parentNode.removeChild(canvas);
                this.confettiCanvas = null;
            }
        }
        drawConfetti = drawConfetti.bind(this);
        drawConfetti();
    }
    
    // HTML Practice Methods
    loadNewSnippet() {
        if (this.htmlSnippets.length > 0) {
            this.currentSnippet = this.htmlSnippets[Math.floor(Math.random() * this.htmlSnippets.length)];
            // Always use textContent to prevent HTML rendering
            document.getElementById('htmlDisplay').textContent = this.currentSnippet;
            // Show progress tracker immediately
            this.highlightHtmlText(document.getElementById('htmlInput').value || '');
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
        input.classList.remove('hide-caret'); // Show caret
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
        
        const input = document.getElementById('htmlInput');
        input.value = '';
        input.disabled = false;
        input.classList.add('hide-caret'); // Hide caret
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
            const escapedChar = this.escapeHtmlChar(char);

            let spanClass = '';
            if (i < input.length) {
                spanClass = input[i] === char ? 'correct' : 'incorrect';
            } else if (i === input.length) {
                spanClass = 'current';
            }

            html += spanClass ? `<span class="${spanClass}">${escapedChar}</span>` : escapedChar;
        }
        // Apply syntax highlighting after progress highlighting
        display.innerHTML = this.applyHtmlSyntaxHighlighting(html);
    }

    applyHtmlSyntaxHighlighting(html) {
        // This function expects already-escaped HTML with progress <span>s.
        // We'll use regex to wrap HTML tags, attributes, and strings with extra <span> classes.
        // Only highlight outside of progress <span> tags.
        // This is a simple highlighter and may not cover all edge cases.

        // Highlight tags: &lt;tag ...&gt;
        html = html.replace(/(&lt;\/?)([a-zA-Z0-9\-]+)([\s\S]*?)(\/?&gt;)/g, (match, open, tag, rest, close) => {
            // Highlight tag name
            let result = `<span class="html-tag">${open}<span class="html-tag-name">${tag}</span>`;
            // Highlight attributes and strings inside the tag
            result += rest.replace(/([a-zA-Z\-:]+)(=)("[^"]*"|'[^']*')?/g, (m, attr, eq, val) => {
                let attrStr = `<span class="html-attr">${attr}</span>${eq}`;
                if (val) {
                    attrStr += `<span class="html-string">${val}</span>`;
                }
                return attrStr;
            });
            result += `${close}</span>`;
            return result;
        });
        return html;
    }

    escapeHtmlChar(char) {
        if (char === '<') return '&lt;';
        if (char === '>') return '&gt;';
        if (char === '&') return '&amp;';
        if (char === '"') return '&quot;';
        if (char === "'") return '&#39;';
        return char;
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
        if (!this.raceActive) return;
        if (e.key === 'Enter') {
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
        
        // Start the falling words interval
        if (this.shooterTimer) clearInterval(this.shooterTimer);
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
        if (!this.shooterActive) return;
        if (e.key === 'Enter') {
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
        if (this.shooterTimer) clearInterval(this.shooterTimer);
        
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

    toggleBackspace() {
        this.disableBackspace = !this.disableBackspace;
        const btn = document.getElementById('toggleBackspace');
        btn.textContent = this.disableBackspace ? '✅ Backspace Disabled' : '⛔ Disable Backspace';
    }

    toggleBackspaceHtml() {
        this.disableBackspaceHtml = !this.disableBackspaceHtml;
        const btn = document.getElementById('toggleBackspaceHtml');
        btn.textContent = this.disableBackspaceHtml ? '✅ Backspace Disabled' : '⛔ Disable Backspace';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypingTestApp();
});