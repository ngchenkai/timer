let timers = [];
let currentPage = 0;
let observer;

function createTimer() {
    return {
        seconds: 0,
        isRunning: false,
        interval: null
    };
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return [minutes, seconds].map(v => v < 10 ? "0" + v : v).join(":");
}

function updateDisplay(index) {
    const timerElement = document.querySelector(`.timer-page[data-index="${index}"] .timer`);
    if (timerElement) {
        timerElement.textContent = formatTime(timers[index].seconds);
    }
}

function startTimer(index) {
    if (!timers[index].isRunning) {
        timers[index].isRunning = true;
        timers[index].interval = setInterval(() => {
            if (timers[index].seconds > 0) {
                timers[index].seconds--;
                updateDisplay(index);
            } else {
                clearInterval(timers[index].interval);
                timers[index].isRunning = false;
                alert(`Timer ${index + 1} finished!`);
            }
        }, 1000);
    }
}

function pauseTimer(index) {
    clearInterval(timers[index].interval);
    timers[index].isRunning = false;
}

function resetTimer(index) {
    clearInterval(timers[index].interval);
    timers[index].isRunning = false;
    timers[index].seconds = 0;
    updateDisplay(index);
}

function createTimerPage(index) {
    const timerPage = document.createElement('div');
    timerPage.className = 'timer-page';
    timerPage.dataset.index = index;
    timerPage.innerHTML = `
        <button class="deleteBtn" title="Delete Timer">&times;</button>
        <div class="timer-title" contenteditable="true">Timer ${index + 1}</div>
        <div class="timer" contenteditable="true">00:00</div>
        <div class="controls">
            <button class="startBtn" title="Start Timer"><i class="fas fa-play"></i></button>
            <button class="pauseBtn" title="Pause Timer"><i class="fas fa-pause"></i></button>
            <button class="resetBtn" title="Reset Timer"><i class="fas fa-undo"></i></button>
        </div>
    `;

    timerPage.querySelector('.deleteBtn').addEventListener('click', () => deleteTimer(index));
    timerPage.querySelector('.startBtn').addEventListener('click', () => startTimer(index));
    timerPage.querySelector('.pauseBtn').addEventListener('click', () => pauseTimer(index));
    timerPage.querySelector('.resetBtn').addEventListener('click', () => resetTimer(index));
    timerPage.querySelector('.timer').addEventListener('input', (e) => {
        const time = e.target.textContent.split(':').map(Number);
        timers[index].seconds = time[0] * 60 + time[1];
    });

    return timerPage;
}

function createSideBySideTimerPage() {
    const timerPage = document.createElement('div');
    timerPage.className = 'timer-page side-by-side';
    timerPage.innerHTML = `
        <button class="deleteBtn" title="Delete Timer">&times;</button>
        <div class="timer-container">
            <div class="timer-left-space">
                <div class="timer-title left" contenteditable="true">正方</div>
                <div class="timer left" contenteditable="true">00:00</div>
            </div>
            <div class="controls-space">
                <div class="controls">
                    <button class="leftBtn" title="Start Left Timer"><i class="fas fa-chevron-left"></i></button>
                    <button class="reverseBtn" title="Switch Active Timer"><i class="fas fa-sync"></i></button>
                    <button class="pauseBtn" title="Pause Both Timers"><i class="fas fa-pause"></i></button>
                    <button class="resetBtn" title="Reset Both Timers"><i class="fas fa-undo"></i></button>
                    <button class="rightBtn" title="Start Right Timer"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="timer-right-space">
                <div class="timer-title right" contenteditable="true">反方</div>
                <div class="timer right" contenteditable="true">00:00</div>
            </div>
        </div>
    `;

    timerPage.querySelector('.deleteBtn').addEventListener('click', () => deleteTimer(timerPage));

    const leftTimer = { seconds: 0, isRunning: false, interval: null };
    const rightTimer = { seconds: 0, isRunning: false, interval: null };

    function updateDisplay(timer, side) {
        const timerElement = timerPage.querySelector(`.timer.${side}`);
        timerElement.textContent = formatTime(timer.seconds);
    }

    function hideDirectionButtons() {
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
    }

    function showDirectionButtons() {
        leftBtn.style.display = '';
        rightBtn.style.display = '';
    }

    function startTimer(timer, side) {
        if (!timer.isRunning && timer.seconds > 0) {
            timer.isRunning = true;
            timer.interval = setInterval(() => {
                if (timer.seconds > 0) {
                    timer.seconds--;
                    updateDisplay(timer, side);
                } else {
                    clearInterval(timer.interval);
                    timer.isRunning = false;
                    // Start the other timer automatically
                    if (side === 'left') {
                        startTimer(rightTimer, 'right');
                    } else {
                        startTimer(leftTimer, 'left');
                    }
                }
            }, 1000);
            hideDirectionButtons();
        }
    }

    function stopTimer(timer) {
        clearInterval(timer.interval);
        timer.isRunning = false;
    }

    function pauseTimers() {
        stopTimer(leftTimer);
        stopTimer(rightTimer);
        showDirectionButtons(); // This will unhide left and right buttons when pause is clicked
    }

    function reverseTimers() {
        if (leftTimer.isRunning) {
            stopTimer(leftTimer);
            startTimer(rightTimer, 'right');
        } else if (rightTimer.isRunning) {
            stopTimer(rightTimer);
            startTimer(leftTimer, 'left');
        }
    }

    function resetTimers() {
        [leftTimer, rightTimer].forEach((timer, index) => {
            stopTimer(timer);
            timer.seconds = 0;
            updateDisplay(timer, index === 0 ? 'left' : 'right');
        });
        showDirectionButtons();
    }

    const controls = timerPage.querySelector('.controls');
    const leftBtn = controls.querySelector('.leftBtn');
    const reverseBtn = controls.querySelector('.reverseBtn');
    const pauseBtn = controls.querySelector('.pauseBtn');
    const resetBtn = controls.querySelector('.resetBtn');
    const rightBtn = controls.querySelector('.rightBtn');

    leftBtn.addEventListener('click', () => startTimer(leftTimer, 'left'));
    reverseBtn.addEventListener('click', reverseTimers);
    pauseBtn.addEventListener('click', pauseTimers);
    resetBtn.addEventListener('click', resetTimers);
    rightBtn.addEventListener('click', () => startTimer(rightTimer, 'right'));

    timerPage.querySelectorAll('.timer').forEach((timerElement, index) => {
        timerElement.addEventListener('input', (e) => {
            const time = e.target.textContent.split(':').map(Number);
            const timer = index === 0 ? leftTimer : rightTimer;
            timer.seconds = (time[0] || 0) * 60 + (time[1] || 0);
            updateDisplay(timer, index === 0 ? 'left' : 'right');
        });
    });

    timerPage.leftTimer = leftTimer;
    timerPage.rightTimer = rightTimer;

    return timerPage;
}

function createSideBySideTimerWithoutReverse() {
    const timerPage = document.createElement('div');
    timerPage.className = 'timer-page side-by-side without-reverse';
    timerPage.innerHTML = `
        <button class="deleteBtn" title="Delete Timer">&times;</button>
        <div class="timer-container">
            <div class="timer-left-space">
                <div class="timer-title left" contenteditable="true">Left Timer</div>
                <div class="timer left" contenteditable="true">00:00</div>
            </div>
            <div class="controls-space">
                <div class="controls">
                    <button class="leftBtn" title="Start Left Timer"><i class="fas fa-chevron-left"></i></button>
                    <button class="pauseBtn" title="Pause Both Timers"><i class="fas fa-pause"></i></button>
                    <button class="resetBtn" title="Reset Both Timers"><i class="fas fa-undo"></i></button>
                    <button class="rightBtn" title="Start Right Timer"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="timer-right-space">
                <div class="timer-title right" contenteditable="true">Right Timer</div>
                <div class="timer right" contenteditable="true">00:00</div>
            </div>
        </div>
    `;

    const leftTimer = { seconds: 0, isRunning: false, interval: null };
    const rightTimer = { seconds: 0, isRunning: false, interval: null };

    function updateDisplay(timer, side) {
        const timerElement = timerPage.querySelector(`.timer.${side}`);
        timerElement.textContent = formatTime(timer.seconds);
    }

    function startTimer(timer, side) {
        if (!timer.isRunning && timer.seconds > 0) {
            timer.isRunning = true;
            timer.interval = setInterval(() => {
                if (timer.seconds > 0) {
                    timer.seconds--;
                    updateDisplay(timer, side);
                } else {
                    clearInterval(timer.interval);
                    timer.isRunning = false;
                }
            }, 1000);
        }
    }

    function stopTimer(timer) {
        clearInterval(timer.interval);
        timer.isRunning = false;
    }

    function pauseTimers() {
        stopTimer(leftTimer);
        stopTimer(rightTimer);
    }

    function resetTimers() {
        [leftTimer, rightTimer].forEach((timer, index) => {
            stopTimer(timer);
            timer.seconds = 0;
            updateDisplay(timer, index === 0 ? 'left' : 'right');
        });
    }

    const controls = timerPage.querySelector('.controls');
    const leftBtn = controls.querySelector('.leftBtn');
    const pauseBtn = controls.querySelector('.pauseBtn');
    const resetBtn = controls.querySelector('.resetBtn');
    const rightBtn = controls.querySelector('.rightBtn');

    leftBtn.addEventListener('click', () => startTimer(leftTimer, 'left'));
    pauseBtn.addEventListener('click', pauseTimers);
    resetBtn.addEventListener('click', resetTimers);
    rightBtn.addEventListener('click', () => startTimer(rightTimer, 'right'));

    timerPage.querySelectorAll('.timer').forEach((timerElement, index) => {
        timerElement.addEventListener('input', (e) => {
            const time = e.target.textContent.split(':').map(Number);
            const timer = index === 0 ? leftTimer : rightTimer;
            timer.seconds = (time[0] || 0) * 60 + (time[1] || 0);
            updateDisplay(timer, index === 0 ? 'left' : 'right');
        });
    });

    timerPage.leftTimer = leftTimer;
    timerPage.rightTimer = rightTimer;

    return timerPage;
}

function updatePageIndicator() {
    const pageIndicator = document.getElementById('pageIndicator');
    pageIndicator.innerHTML = '';
    const timerPages = document.querySelectorAll('.timer-page');
    timerPages.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = `indicator ${index === currentPage ? 'active' : ''}`;
        indicator.addEventListener('click', () => scrollToTimer(index));
        pageIndicator.appendChild(indicator);
    });
}

function scrollToTimer(index) {
    const timerContainer = document.getElementById('timerContainer');
    const timerPages = document.querySelectorAll('.timer-page');
    if (timerPages[index]) {
        timerContainer.scrollTo({
            top: timerPages[index].offsetTop,
            behavior: 'smooth'
        });
        // Update currentPage and page indicator after scrolling
        setTimeout(updateCurrentPage, 500); // Adjust this delay if needed
    }
}

function addTimer() {
    const index = document.querySelectorAll('.timer-page').length;
    const timerPage = createTimerPage(index);
    document.getElementById('timerContainer').appendChild(timerPage);
    timers.push(createTimer());
    updatePageIndicator();
    scrollToTimer(index);
}

function setBackgroundImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    document.body.style.backgroundImage = `url('${img.src}')`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    document.body.style.backgroundRepeat = 'no-repeat';
                    document.body.style.backgroundAttachment = 'fixed';
                    console.log('Background image set successfully');
                };
                img.onerror = function() {
                    console.error('Error loading image');
                };
                img.src = e.target.result;
            };
            reader.onerror = function() {
                console.error('Error reading file');
            };
            reader.readAsDataURL(file);
        } else {
            console.log('No file selected');
        }
    };
    input.click();
}

function toggleMenu(force) {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (force !== undefined) {
        hamburgerMenu.classList.toggle('open', force);
    } else {
        hamburgerMenu.classList.toggle('open');
    }
}

function initialize() {
    addTimer();
    
    document.getElementById('addTimerBtn').addEventListener('click', () => {
        addTimer();
        toggleMenu();
    });
    document.getElementById('addSideBySideTimerBtn').addEventListener('click', () => {
        addSideBySideTimer();
        toggleMenu();
    });
    document.getElementById('addSideBySideTimerWithoutReverseBtn').addEventListener('click', () => {
        const timerPage = createSideBySideTimerWithoutReverse();
        document.getElementById('timerContainer').appendChild(timerPage);
        updatePageIndicator();
        scrollToTimer(document.querySelectorAll('.timer-page').length - 1);
        toggleMenu(false);
    });
    document.getElementById('addBackgroundBtn').addEventListener('click', () => {
        setBackgroundImage();
        toggleMenu(false);
    });
    document.getElementById('openMenuBtn').addEventListener('click', () => toggleMenu());
    document.getElementById('closeMenuBtn').addEventListener('click', () => toggleMenu(false));
    
    // Add this line to handle clicks outside the menu
    document.addEventListener('click', handleOutsideClick);

    const timerContainer = document.getElementById('timerContainer');
    timerContainer.addEventListener('scroll', updateCurrentPage);

    // Initial update of the page indicator
    updateCurrentPage();

    document.getElementById('saveConfigBtn').addEventListener('click', () => {
        saveConfiguration();
        toggleMenu(false);
    });
    document.getElementById('loadConfigBtn').addEventListener('click', () => {
        loadConfiguration();
        toggleMenu(false);
    });

    document.getElementById('addTestSoundPageBtn').addEventListener('click', () => {
        const testSoundPage = createTestSoundPage();
        document.getElementById('timerContainer').appendChild(testSoundPage);
        updatePageIndicator();
        scrollToTimer(document.querySelectorAll('.timer-page').length - 1);
        toggleMenu(false);
    });
}

// Call initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);

function deleteTimer(timerPageOrIndex) {
    let timerPage;
    if (typeof timerPageOrIndex === 'number') {
        timerPage = document.querySelector(`.timer-page[data-index="${timerPageOrIndex}"]`);
    } else {
        timerPage = timerPageOrIndex;
    }
    
    if (timerPage) {
        timerPage.remove();
        updateTimerIndices();
        updatePageIndicator();
        if (currentPage >= document.querySelectorAll('.timer-page').length) {
            currentPage = Math.max(0, document.querySelectorAll('.timer-page').length - 1);
            scrollToTimer(currentPage);
        }
    }
}

function updateTimerIndices() {
    document.querySelectorAll('.timer-page').forEach((page, index) => {
        page.dataset.index = index;
    });
}

function updateCurrentPage() {
    const timerContainer = document.getElementById('timerContainer');
    const timerPages = document.querySelectorAll('.timer-page');
    const containerHeight = timerContainer.clientHeight;
    const scrollTop = timerContainer.scrollTop;

    let newCurrentPage = 0;
    for (let i = 0; i < timerPages.length; i++) {
        if (scrollTop < timerPages[i].offsetTop + timerPages[i].offsetHeight / 2) {
            newCurrentPage = i;
            break;
        }
    }

    if (currentPage !== newCurrentPage) {
        currentPage = newCurrentPage;
        updatePageIndicator();
    }
}

function handleOutsideClick(event) {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const openMenuBtn = document.getElementById('openMenuBtn');
    
    if (hamburgerMenu.classList.contains('open') &&
        !hamburgerMenu.contains(event.target) &&
        event.target !== openMenuBtn) {
        toggleMenu(false);
    }
}

function addSideBySideTimer() {
    const sideBySideTimerPage = createSideBySideTimerPage();
    document.getElementById('timerContainer').appendChild(sideBySideTimerPage);
    updatePageIndicator();
    scrollToTimer(document.querySelectorAll('.timer-page').length - 1);
}

function saveConfiguration() {
    const timerPages = document.querySelectorAll('.timer-page');
    const config = [];

    timerPages.forEach((page, index) => {
        const isSideBySide = page.classList.contains('side-by-side');
        const isWithoutReverse = page.classList.contains('without-reverse');
        const timerConfig = {
            type: isSideBySide ? (isWithoutReverse ? 'side-by-side-without-reverse' : 'side-by-side') : 'single',
            titles: [],
            values: []
        };

        if (isSideBySide) {
            timerConfig.titles = [
                page.querySelector('.timer-title.left').textContent,
                page.querySelector('.timer-title.right').textContent
            ];
            timerConfig.values = [
                page.querySelector('.timer.left').textContent,
                page.querySelector('.timer.right').textContent
            ];
        } else {
            timerConfig.titles = [page.querySelector('.timer-title').textContent];
            timerConfig.values = [page.querySelector('.timer').textContent];
        }

        config.push(timerConfig);
    });

    const jsonConfig = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timer_configuration.json';
    a.click();
    URL.revokeObjectURL(url);
}

function loadConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const config = JSON.parse(e.target.result);
                    applyConfiguration(config);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    alert('Invalid configuration file');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function applyConfiguration(config) {
    // Clear existing timers
    const timerContainer = document.getElementById('timerContainer');
    timerContainer.innerHTML = '';
    timers = [];

    config.forEach((timerConfig, index) => {
        if (timerConfig.type === 'single') {
            const timerPage = createTimerPage(index);
            timerContainer.appendChild(timerPage);
            timers.push(createTimer());

            const titleElement = timerPage.querySelector('.timer-title');
            const timerElement = timerPage.querySelector('.timer');
            titleElement.textContent = timerConfig.titles[0];
            timerElement.textContent = timerConfig.values[0];

            // Update the timer object
            const time = timerConfig.values[0].split(':').map(Number);
            timers[index].seconds = time[0] * 60 + time[1];
        } else if (timerConfig.type === 'side-by-side' || timerConfig.type === 'side-by-side-without-reverse') {
            const timerPage = timerConfig.type === 'side-by-side' ? 
                createSideBySideTimerPage() : createSideBySideTimerWithoutReverse();
            timerContainer.appendChild(timerPage);

            const leftTitleElement = timerPage.querySelector('.timer-title.left');
            const rightTitleElement = timerPage.querySelector('.timer-title.right');
            const leftTimerElement = timerPage.querySelector('.timer.left');
            const rightTimerElement = timerPage.querySelector('.timer.right');

            leftTitleElement.textContent = timerConfig.titles[0];
            rightTitleElement.textContent = timerConfig.titles[1];
            leftTimerElement.textContent = timerConfig.values[0];
            rightTimerElement.textContent = timerConfig.values[1];

            const leftTime = timerConfig.values[0].split(':').map(Number);
            const rightTime = timerConfig.values[1].split(':').map(Number);
            timerPage.leftTimer.seconds = leftTime[0] * 60 + leftTime[1];
            timerPage.rightTimer.seconds = rightTime[0] * 60 + rightTime[1];
        }
    });

    updatePageIndicator();
    scrollToTimer(0);
}

function createTestSoundPage() {
    const testSoundPage = document.createElement('div');
    testSoundPage.className = 'timer-page test-sound-page';
    testSoundPage.innerHTML = `
        <button class="deleteBtn" title="Delete Page">&times;</button>
        <div class="test-sound-container">
            <button class="test-sound-btn" data-sound="/timer/timer-30sec.mp3">Play 30 Sec Sound</button>
            <button class="test-sound-btn" data-sound="/timer/timer-end.mp3">Play End Sound</button>
        </div>
    `;

    testSoundPage.querySelector('.deleteBtn').addEventListener('click', () => deleteTimer(testSoundPage));

    testSoundPage.querySelectorAll('.test-sound-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const audio = new Audio(btn.dataset.sound);
            audio.play();
        });
    });

    return testSoundPage;
}