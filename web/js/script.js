// Safe storage wrapper ensuring functionality even when localStorage is restricted or throws
const SafeStorage = {
    _mem: {},
    getItem(key) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const val = window.localStorage.getItem(key);
                if (val !== null) return val;
            }
        } catch (e) {}
        return this._mem[key] !== undefined ? this._mem[key] : null;
    },
    setItem(key, value) {
        this._mem[key] = String(value);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, String(value));
            }
        } catch (e) {}
    }
};

class TypingTestApp {
    constructor() {
        this.currentTab = 'typing-test';
        this.typingTexts = [];
        this.htmlSnippets = [];
        this.currentText = '';
        this.currentSnippet = '';
        
        // GameMonetize ad state
        this.isAdPlaying = false;
        this.adPauseStartTime = null;
        this.pendingEndMessage = null;

        // Typing test state
        this.isTyping = false;
        this.startTime = null;
        this.timer = null;
        this.totalCharacters = 0;
        this.correctCharacters = 0;
        this.bestWpm = parseInt(SafeStorage.getItem('typing-test-best-wpm') || '0', 10);
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

        this.testsCompleted = parseInt(SafeStorage.getItem('typerush-tests-completed') || '0', 10);
        this.funFacts = [
            "The fastest typist ever recorded reached 216 words per minute.",
            "The word 'typewriter' can be typed using only the top row of a QWERTY keyboard.",
            "The first computer mouse was made of wood.",
            "HTML stands for HyperText Markup Language.",
            "The Dvorak keyboard layout was designed to increase typing speed.",
            "The longest English word without a true vowel is 'rhythms'.",
            "The first email was sent in 1971 by Ray Tomlinson.",
            "The average person types at about 40 words per minute.",
            "The QWERTY layout was designed to prevent typewriter jams.",
            "The first website is still online at info.cern.ch."
        ];
        
        this.init();
        this.loadHighScores();
    }
    
    init() {
        this.loadTheme();
        this.bindEvents();
        this.loadData();
        this.showTab(this.currentTab);

        // Hide caret initially
        const typingInput = document.getElementById('typingInput');
        const htmlInput = document.getElementById('htmlInput');
        if (typingInput) typingInput.classList.add('hide-caret');
        if (htmlInput) htmlInput.classList.add('hide-caret');

        // Disable text selection for display areas
        const textDisplay = document.getElementById('textDisplay');
        const htmlDisplay = document.getElementById('htmlDisplay');
        if (textDisplay) textDisplay.classList.add('no-select');
        if (htmlDisplay) htmlDisplay.classList.add('no-select');
    }

    /* --------------------------------------------------------------------------
       GameMonetize SDK & Ad Controls
       -------------------------------------------------------------------------- */
    triggerAd(reason = '') {
        console.log(`[GameMonetize] Requesting advertisement. Trigger point: "${reason}"`);
        if (typeof sdk !== 'undefined' && typeof sdk.showBanner !== 'undefined') {
            try {
                sdk.showBanner();
            } catch (err) {
                console.error('[GameMonetize] Exception calling sdk.showBanner():', err);
            }
        } else {
            console.log('[GameMonetize] sdk.showBanner is not available (local testing or ad blocker active).');
        }
    }

    pauseForAd() {
        console.log('[GameMonetize] Ad playing: Pausing gameplay & timers...');
        this.isAdPlaying = true;
        this.adPauseStartTime = Date.now();

        // 1. Pause active timers
        if (this.isTyping && this.timer) {
            clearInterval(this.timer);
        }
        if (this.isHtmlTyping && this.htmlTimer) {
            clearInterval(this.htmlTimer);
        }
        if (this.raceActive && this.raceTimer) {
            clearInterval(this.raceTimer);
        }
        if (this.shooterActive && this.shooterTimer) {
            clearInterval(this.shooterTimer);
        }

        // 2. Temporarily disable active inputs
        const typingInput = document.getElementById('typingInput');
        const htmlInput = document.getElementById('htmlInput');
        const raceInput = document.getElementById('raceInput');
        const shooterInput = document.getElementById('shooterInput');

        if (typingInput) typingInput.disabled = true;
        if (htmlInput) htmlInput.disabled = true;
        if (raceInput) raceInput.disabled = true;
        if (shooterInput) shooterInput.disabled = true;

        // 3. Show visual pause overlay
        const overlay = document.getElementById('adPauseOverlay');
        if (overlay) overlay.classList.add('active');
    }

    resumeAfterAd() {
        console.log('[GameMonetize] Ad completed: Resuming gameplay & timers...');
        this.isAdPlaying = false;
        const pauseDelta = Date.now() - (this.adPauseStartTime || Date.now());

        // 1. Hide visual pause overlay
        const overlay = document.getElementById('adPauseOverlay');
        if (overlay) overlay.classList.remove('active');

        // 2. Resume Typing Test
        if (this.isTyping) {
            this.startTime += pauseDelta;
            const input = document.getElementById('typingInput');
            if (input) {
                input.disabled = false;
                input.focus();
            }
            this.timer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                document.getElementById('timer').textContent = `${elapsed}s`;
            }, 1000);
        }

        // 3. Resume HTML Practice
        if (this.isHtmlTyping) {
            this.htmlStartTime += pauseDelta;
            const input = document.getElementById('htmlInput');
            if (input) {
                input.disabled = false;
                input.focus();
            }
            this.htmlTimer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.htmlStartTime) / 1000);
                document.getElementById('htmlTimer').textContent = `${elapsed}s`;
            }, 1000);
        }

        // 4. Resume Word Race
        if (this.raceActive) {
            const input = document.getElementById('raceInput');
            if (input) {
                input.disabled = false;
                input.focus();
            }
            this.raceTimer = setInterval(() => {
                this.raceTimeLeft--;
                document.getElementById('raceTimer').textContent = `${this.raceTimeLeft}s`;
                if (this.raceTimeLeft <= 0) {
                    this.endWordRace();
                }
            }, 1000);
        }

        // 5. Resume Shooter
        if (this.shooterActive) {
            this.fallingWords.forEach(w => {
                w.startTime += pauseDelta;
            });
            const input = document.getElementById('shooterInput');
            if (input) {
                input.disabled = false;
                input.focus();
            }
            this.shooterTimer = setInterval(() => {
                this.spawnFallingWord();
                this.updateFallingWords();
            }, 1500);
        }

        // 6. Deliver any pending end-game message
        if (this.pendingEndMessage) {
            const msg = this.pendingEndMessage;
            this.pendingEndMessage = null;
            setTimeout(() => {
                alert(msg);
            }, 150);
        }
    }

    notifyGameEnd(message) {
        if (this.isAdPlaying) {
            this.pendingEndMessage = message;
        } else {
            setTimeout(() => {
                alert(message);
            }, 200);
        }
    }

    /* --------------------------------------------------------------------------
       Theme Management
       -------------------------------------------------------------------------- */
    loadTheme() {
        const savedTheme = SafeStorage.getItem('typing-test-theme') || 'dark';
        this.setTheme(savedTheme);
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        SafeStorage.setItem('typing-test-theme', theme);
        const statsTheme = document.getElementById('statsTheme');
        if (statsTheme) {
            let themeLabel = 'Obsidian Dark';
            if (theme === 'blue') themeLabel = 'Cobalt Blue';
            if (theme === 'light') themeLabel = 'Nordic Light';
            statsTheme.textContent = themeLabel;
        }
    }
    
    /* --------------------------------------------------------------------------
       Event Bindings
       -------------------------------------------------------------------------- */
    bindEvents() {
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));
        }
        
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                this.showTab(targetTab);
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
        if (!tabName) return;
        const targetContent = document.getElementById(tabName);
        const targetNavTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (!targetContent) return;

        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        targetContent.classList.add('active');
        if (targetNavTab) {
            targetNavTab.classList.add('active');
        }
        
        this.currentTab = tabName;
        
        // Load content for content manager
        if (tabName === 'content-manager') {
            this.loadContentManager();
        }
        // Update stats tab
        if (tabName === 'stats') {
            this.updateStatsTab();
        }
    }
    
    /* --------------------------------------------------------------------------
       Data Loading & Storage (Static Web & Local Storage Optimized)
       -------------------------------------------------------------------------- */
    async loadData() {
        const defaultTexts = [
            "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once, making it perfect for typing practice.",
            "Programming is not just about writing code; it's about solving problems and creating solutions that make life easier for people around the world.",
            "In the world of web development, HTML provides structure, CSS adds style, and JavaScript brings interactivity to life on the internet.",
            "Machine learning and artificial intelligence are revolutionizing how we approach complex problems in science, medicine, and technology.",
            "The art of debugging is like being a detective in a crime movie where you are also the murderer, the victim, and the confused witness.",
            "Good software design is about finding the right balance between simplicity and functionality while maintaining code that is easy to read and maintain.",
            "The internet has connected billions of people worldwide, creating unprecedented opportunities for collaboration, learning, and innovation.",
            "Data structures and algorithms form the foundation of computer science, enabling efficient storage and manipulation of information.",
            "Version control systems like Git allow developers to track changes, collaborate effectively, and maintain a history of their project's evolution.",
            "User experience design focuses on creating intuitive, accessible, and enjoyable interfaces that serve real human needs and behaviors."
        ];

        const defaultSnippets = [
            "<div class=\"container\"><h1>Welcome to HTML</h1><p>This is a basic HTML structure.</p></div>",
            "<nav class=\"navbar\"><ul><li><a href=\"#home\">Home</a></li><li><a href=\"#about\">About</a></li><li><a href=\"#contact\">Contact</a></li></ul></nav>",
            "<form action=\"/submit\" method=\"post\"><input type=\"text\" name=\"username\" required><input type=\"email\" name=\"email\" required><button type=\"submit\">Submit</button></form>",
            "<section class=\"hero\"><h2>Hero Section</h2><p>This is the main hero content.</p><button class=\"cta-button\">Get Started</button></section>",
            "<article class=\"blog-post\"><header><h3>Blog Post Title</h3><time datetime=\"2024-01-15\">January 15, 2024</time></header><p>Blog content goes here.</p></article>",
            "<footer class=\"site-footer\"><div class=\"footer-content\"><p>&copy; 2024 Company Name. All rights reserved.</p></div></footer>",
            "<table class=\"data-table\"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody><tr><td>John Doe</td><td>john@example.com</td><td>Developer</td></tr></tbody></table>",
            "<div class=\"card\"><img src=\"image.jpg\" alt=\"Card image\"><div class=\"card-body\"><h5>Card Title</h5><p>Card description text.</p></div></div>",
            "<aside class=\"sidebar\"><h4>Quick Links</h4><ul><li><a href=\"#link1\">Link One</a></li><li><a href=\"#link2\">Link Two</a></li></ul></aside>",
            "<main class=\"main-content\"><section id=\"about\"><h2>About Us</h2><p>We are a team of passionate developers.</p></section></main>"
        ];

        // 1. Check SafeStorage (custom user edits)
        const savedTexts = SafeStorage.getItem('typerush-custom-texts');
        const savedSnippets = SafeStorage.getItem('typerush-custom-snippets');

        if (savedTexts) {
            try {
                this.typingTexts = JSON.parse(savedTexts);
            } catch (e) {}
        }
        if (savedSnippets) {
            try {
                this.htmlSnippets = JSON.parse(savedSnippets);
            } catch (e) {}
        }

        // 2. Fetch from local files if not in SafeStorage
        if (!this.typingTexts || this.typingTexts.length === 0) {
            try {
                const res = await fetch('data/typing-texts.json');
                if (res.ok) {
                    const data = await res.json();
                    this.typingTexts = data.texts || [];
                }
            } catch (e) {
                // Ignore fetch errors in file:// or sandbox, fallback will apply
            }
        }

        if (!this.htmlSnippets || this.htmlSnippets.length === 0) {
            try {
                const res = await fetch('data/html-snippets.json');
                if (res.ok) {
                    const data = await res.json();
                    this.htmlSnippets = data.snippets || [];
                }
            } catch (e) {
                // Ignore fetch errors in file:// or sandbox
            }
        }

        // 3. Fallback defaults if still empty
        if (!this.typingTexts || this.typingTexts.length === 0) {
            this.typingTexts = defaultTexts;
        }
        if (!this.htmlSnippets || this.htmlSnippets.length === 0) {
            this.htmlSnippets = defaultSnippets;
        }

        this.loadNewText();
        this.loadNewSnippet();

        // Ensure initial trackers render
        this.highlightText('');
        this.highlightHtmlText('');
    }
    
    // Typing Test Methods
    loadNewText() {
        if (this.typingTexts.length > 0) {
            this.currentText = this.typingTexts[Math.floor(Math.random() * this.typingTexts.length)];
            document.getElementById('textDisplay').textContent = this.currentText;
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
        input.classList.remove('hide-caret');
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
        input.classList.add('hide-caret');
        document.getElementById('startTest').disabled = false;
        document.getElementById('timer').textContent = '0s';
        document.getElementById('wpm').textContent = '0';
        document.getElementById('accuracy').textContent = '100%';
        
        this.loadNewText();
        this.highlightText('');
    }
    
    handleTyping(e) {
        if (!this.isTyping) return;

        let input = e.target.value;
        if (input.length > this.currentText.length) {
            input = input.slice(0, this.currentText.length);
            e.target.value = input;
        }

        this.totalCharacters = input.length;
        this.correctCharacters = 0;

        for (let i = 0; i < input.length; i++) {
            if (i < this.currentText.length && input[i] === this.currentText[i]) {
                this.correctCharacters++;
            }
        }

        this.updateStats();
        this.highlightText(input);

        if (input.length === this.currentText.length) {
            this.isTyping = false;
            const hasErrors = input !== this.currentText;
            this.completeTypingTest(hasErrors);
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

        const elapsed = (Date.now() - this.startTime) / 1000;
        const minutes = elapsed / 60;
        const wpm = Math.round((this.correctCharacters / 5) / minutes) || 0;

        this.bestWpm = parseInt(SafeStorage.getItem('typing-test-best-wpm') || '0', 10);
        this.incrementTestsCompleted();

        // Trigger GameMonetize advertisement on test completion
        this.triggerAd('Typing Test Completed');

        if (!forceEndWithErrors && wpm > this.bestWpm) {
            this.bestWpm = wpm;
            SafeStorage.setItem('typing-test-best-wpm', wpm);
            this.showConfetti();
            this.notifyGameEnd(`🎉 You beat your high score! Your new high score is: ${wpm} WPM`);
        } else if (!forceEndWithErrors) {
            this.notifyGameEnd('🎉 Congratulations! You completed the typing test!');
        } else {
            this.notifyGameEnd('⚠️ Test ended. There are typing errors (backspace was disabled).');
        }
    }

    showConfetti() {
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
        const drawConfetti = () => {
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
        };
        drawConfetti();
    }
    
    // HTML Practice Methods
    loadNewSnippet() {
        if (this.htmlSnippets.length > 0) {
            this.currentSnippet = this.htmlSnippets[Math.floor(Math.random() * this.htmlSnippets.length)];
            document.getElementById('htmlDisplay').textContent = this.currentSnippet;
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
        input.classList.remove('hide-caret');
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
        input.classList.add('hide-caret');
        document.getElementById('startHtml').disabled = false;
        document.getElementById('htmlTimer').textContent = '0s';
        document.getElementById('htmlWpm').textContent = '0';
        document.getElementById('htmlAccuracy').textContent = '100%';
        
        this.loadNewSnippet();
        this.highlightHtmlText('');
    }
    
    handleHtmlTyping(e) {
        if (!this.isHtmlTyping) return;

        let input = e.target.value;
        if (input.length > this.currentSnippet.length) {
            input = input.slice(0, this.currentSnippet.length);
            e.target.value = input;
        }

        this.htmlTotalCharacters = input.length;
        this.htmlCorrectCharacters = 0;

        for (let i = 0; i < input.length; i++) {
            if (i < this.currentSnippet.length && input[i] === this.currentSnippet[i]) {
                this.htmlCorrectCharacters++;
            }
        }

        this.updateHtmlStats();
        this.highlightHtmlText(input);

        if (input.length === this.currentSnippet.length) {
            this.isHtmlTyping = false;
            const hasErrors = input !== this.currentSnippet;
            this.completeHtmlPractice(hasErrors);
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
        display.innerHTML = this.applyHtmlSyntaxHighlighting(html);
    }

    applyHtmlSyntaxHighlighting(html) {
        return html.replace(/(&lt;\/?)([a-zA-Z0-9\-]+)([\s\S]*?)(\/?&gt;)/g, (match, open, tag, rest, close) => {
            let result = `<span class="html-tag">${open}<span class="html-tag-name">${tag}</span>`;
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
    
    completeHtmlPractice(forceEndWithErrors = false) {
        this.isHtmlTyping = false;
        clearInterval(this.htmlTimer);
        document.getElementById('htmlInput').disabled = true;
        document.getElementById('startHtml').disabled = false;

        this.incrementTestsCompleted();

        // Trigger GameMonetize ad
        this.triggerAd('HTML Practice Completed');

        if (!forceEndWithErrors) {
            this.notifyGameEnd('🎉 Great job! HTML snippet completed!');
        } else {
            this.notifyGameEnd('⚠️ Practice ended. There are typing errors.');
        }
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

        this.bestRaceScore = parseInt(SafeStorage.getItem('word-race-best-score') || '0', 10);
        this.incrementTestsCompleted();

        // Trigger GameMonetize advertisement
        this.triggerAd('Word Race Finished');

        if (this.raceScore > this.bestRaceScore) {
            this.bestRaceScore = this.raceScore;
            SafeStorage.setItem('word-race-best-score', this.raceScore);
            this.showConfetti();
            this.notifyGameEnd(`🎉 You beat your Word Race high score! Your new high score is: ${this.raceScore}`);
        } else {
            this.notifyGameEnd(`🏁 Race finished! You typed ${this.raceWordsCompleted} words and scored ${this.raceScore} points!`);
        }
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
            const position = elapsed * 60;
            
            if (position > 350) {
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
        
        this.fallingWords.forEach(wordObj => wordObj.element.remove());
        this.fallingWords = [];
        
        document.getElementById('shooterInput').disabled = true;
        document.getElementById('startShooter').disabled = false;

        this.bestShooterScore = parseInt(SafeStorage.getItem('typing-shooter-best-score') || '0', 10);
        this.incrementTestsCompleted();

        // Trigger GameMonetize advertisement
        this.triggerAd('Typing Shooter Game Over');

        if (this.shooterScore > this.bestShooterScore) {
            this.bestShooterScore = this.shooterScore;
            SafeStorage.setItem('typing-shooter-best-score', this.shooterScore);
            this.showConfetti();
            this.notifyGameEnd(`🎉 You beat your Typing Shooter high score! Your new high score is: ${this.shooterScore}`);
        } else {
            this.notifyGameEnd(`🎯 Game Over! You hit ${this.targetsHit} targets and scored ${this.shooterScore} points!`);
        }
    }
    
    resetTypingShooter() {
        this.shooterActive = false;
        if (this.shooterTimer) clearInterval(this.shooterTimer);
        
        this.fallingWords.forEach(wordObj => wordObj.element.remove());
        this.fallingWords = [];
        
        this.shooterScore = 0;
        this.targetsHit = 0;
        this.lives = 3;
        
        document.getElementById('shooterScore').textContent = '0';
        document.getElementById('targetsHit').textContent = '0';
        document.getElementById('lives').textContent = '3';
        document.getElementById('shooterInput').value = '';
        document.getElementById('shooterInput').disabled = true;
        document.getElementById('startShooter').disabled = false;
        
        const area = document.getElementById('shooterArea');
        area.innerHTML = '<div class="shooter-instruction">Type incoming falling words to neutralize them</div><div class="shooter-grid-overlay" aria-hidden="true"></div>';
    }
    
    // Content Manager Methods (Client-Side Storage)
    loadContentManager() {
        document.getElementById('typingTextsEditor').value = this.typingTexts.join('\n');
        document.getElementById('htmlSnippetsEditor').value = this.htmlSnippets.join('\n');
    }
    
    saveTypingTexts() {
        const texts = document.getElementById('typingTextsEditor').value
            .split('\n')
            .map(text => text.trim())
            .filter(text => text.length > 0);
        
        if (texts.length === 0) {
            this.showStatusMessage('⚠️ Please enter at least one text.', 'error');
            return;
        }

        try {
            SafeStorage.setItem('typerush-custom-texts', JSON.stringify(texts));
            this.typingTexts = texts;
            this.showStatusMessage('✅ Typing texts saved locally in your browser!', 'success');
            this.loadNewText();
        } catch (error) {
            this.showStatusMessage('❌ Error saving typing texts: ' + error.message, 'error');
        }
    }
    
    saveHtmlSnippets() {
        const snippets = document.getElementById('htmlSnippetsEditor').value
            .split('\n')
            .map(snippet => snippet.trim())
            .filter(snippet => snippet.length > 0);
        
        if (snippets.length === 0) {
            this.showStatusMessage('⚠️ Please enter at least one snippet.', 'error');
            return;
        }

        try {
            SafeStorage.setItem('typerush-custom-snippets', JSON.stringify(snippets));
            this.htmlSnippets = snippets;
            this.showStatusMessage('✅ HTML snippets saved locally in your browser!', 'success');
            this.loadNewSnippet();
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

    loadHighScores() {
        this.bestWpm = parseInt(SafeStorage.getItem('typing-test-best-wpm') || '0', 10);
        this.bestRaceScore = parseInt(SafeStorage.getItem('word-race-best-score') || '0', 10);
        this.bestShooterScore = parseInt(SafeStorage.getItem('typing-shooter-best-score') || '0', 10);
    }

    incrementTestsCompleted() {
        this.testsCompleted = parseInt(SafeStorage.getItem('typerush-tests-completed') || '0', 10) + 1;
        SafeStorage.setItem('typerush-tests-completed', this.testsCompleted);
    }

    updateStatsTab() {
        const statsBestWpm = document.getElementById('statsBestWpm');
        const statsBestRace = document.getElementById('statsBestRace');
        const statsBestShooter = document.getElementById('statsBestShooter');
        const statsTheme = document.getElementById('statsTheme');
        const statsTestsCompleted = document.getElementById('statsTestsCompleted');
        const funFact = document.getElementById('funFact');

        if (statsBestWpm) statsBestWpm.textContent = SafeStorage.getItem('typing-test-best-wpm') || '0';
        if (statsBestRace) statsBestRace.textContent = SafeStorage.getItem('word-race-best-score') || '0';
        if (statsBestShooter) statsBestShooter.textContent = SafeStorage.getItem('typing-shooter-best-score') || '0';
        
        const theme = SafeStorage.getItem('typing-test-theme') || 'dark';
        let themeLabel = 'Obsidian Dark';
        if (theme === 'blue') themeLabel = 'Cobalt Blue';
        if (theme === 'light') themeLabel = 'Nordic Light';
        if (statsTheme) statsTheme.textContent = themeLabel;

        if (statsTestsCompleted) statsTestsCompleted.textContent = SafeStorage.getItem('typerush-tests-completed') || '0';
        
        if (funFact && this.funFacts && this.funFacts.length > 0) {
            const fact = this.funFacts[Math.floor(Math.random() * this.funFacts.length)];
            funFact.textContent = `💡 Fun Fact: ${fact}`;
        }
    }
}

// Global initialization & exposure for GameMonetize event callbacks
function initTypeRushApp() {
    try {
        if (!window.typeRushApp) {
            const app = new TypingTestApp();
            window.typeRushApp = app;
            window.typerushApp = app;
            console.log("⚡ TypeRush Web (GameMonetize Edition) initialized.");
        }
    } catch (e) {
        console.error("TypeRush initialization error:", e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypeRushApp);
} else {
    initTypeRushApp();
}
