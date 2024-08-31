let timers = [];
let currentPage = 0;
let observer;

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

//////////////////////
// CREATE NEW PAGES //
//////////////////////
// Create single timer page
function createTimerPage() {
    // Create the main container for the timer page
    const timerPage = document.createElement('div');
    timerPage.className = 'timer-page';

    // Specify the type of timer page for saveConfiguration
    timerPage.dataset.type = 'single';
    
    // Set up the HTML structure for the timer page
    timerPage.innerHTML = `
        <button class="deleteBtn" title="Delete Timer">&times;</button>
        <div class="timer-title" contenteditable="true">Timer</div>
        <div class="timer" contenteditable="true">00:00</div>
        <div class="controls">
            <button class="startBtn" title="Start Timer"><i class="fas fa-play"></i></button>
            <button class="pauseBtn" title="Pause Timer"><i class="fas fa-pause"></i></button>
            <button class="resetBtn" title="Reset Timer"><i class="fas fa-undo"></i></button>
        </div>
    `;

    let seconds = 0;
    let isRunning = false;
    let interval;

    // Function to update the timer display
    function updateDisplay() {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerPage.querySelector('.timer').textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    // Function to start the timer
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            interval = setInterval(() => {
                if (seconds > 0) {
                    seconds--;
                    updateDisplay();
                    if (seconds === 30) {
                        playSound('/timer/timer-30sec.mp3');
                    } else if (seconds === 0) {
                        playSound('/timer/timer-end.mp3');
                        clearInterval(interval);
                        isRunning = false;
                    }
                }
            }, 1000);
        }
    }

    // Function to pause the timer
    function pauseTimer() {
        clearInterval(interval);
        isRunning = false;
    }

    // Function to reset the timer
    function resetTimer() {
        clearInterval(interval);
        isRunning = false;
        seconds = 0;
        updateDisplay();
    }

    // Add event listener for deleting the timer
    timerPage.querySelector('.deleteBtn').addEventListener('click', () => deleteTimer(timerPage));

    // Add event listeners for timer controls
    timerPage.querySelector('.startBtn').addEventListener('click', startTimer);
    timerPage.querySelector('.pauseBtn').addEventListener('click', pauseTimer);
    timerPage.querySelector('.resetBtn').addEventListener('click', resetTimer);
    
    // Add event listener for manual time input
    timerPage.querySelector('.timer').addEventListener('input', (e) => {
        const time = e.target.textContent.split(':').map(Number);
        seconds = time[0] * 60 + time[1];
    });

    return timerPage;
}

// Side-by-side timer: Create timer page
function createSideBySideTimerPage() {
    // Create the main container for the side-by-side timer page
    const timerPage = document.createElement('div');
    timerPage.className = 'timer-page side-by-side';

    // Specify the type of timer page for saveConfiguration
    timerPage.dataset.type = 'side-by-side-with-switch';
    
    // Set up the HTML structure for the side-by-side timer page
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

    // Add event listener for deleting the timer
    timerPage.querySelector('.deleteBtn').addEventListener('click', () => deleteTimer(timerPage));

    // Initialize left and right timers
    const leftTimer = { seconds: 0, isRunning: false, interval: null };
    const rightTimer = { seconds: 0, isRunning: false, interval: null };

    // Side-by-side timer: Update display
    function updateDisplay(timer, side) {
        const timerElement = timerPage.querySelector(`.timer.${side}`);
        timerElement.textContent = formatTime(timer.seconds);
    }

    // Side-by-side timer: Hide direction buttons
    function hideDirectionButtons() {
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
    }

    // Side-by-side timer: Show direction buttons
    function showDirectionButtons() {
        leftBtn.style.display = '';
        rightBtn.style.display = '';
    }

    // Side-by-side timer: Start timer
    function startTimer(timer, side) {
        if (!timer.isRunning && timer.seconds > 0) {
            timer.isRunning = true;
            timer.interval = setInterval(() => {
                if (timer.seconds > 0) {
                    timer.seconds--;
                    updateDisplay(timer, side);
                    // Play sound at 30 seconds remaining
                    if (timer.seconds === 30) {
                        playSound('/timer/timer-30sec.mp3');
                    // Play sound and switch timers at 0 seconds
                    } else if (timer.seconds === 0) {
                        playSound('/timer/timer-end.mp3');
                        clearInterval(timer.interval);
                        timer.isRunning = false;
                        // Start the other timer automatically
                        if (side === 'left') {
                            startTimer(rightTimer, 'right');
                        } else {
                            startTimer(leftTimer, 'left');
                        }
                    }
                }
            }, 1000);
            hideDirectionButtons();
        }
    }

    // Side-by-side timer: Stop timer
    function stopTimer(timer) {
        clearInterval(timer.interval);
        timer.isRunning = false;
    }

    // Side-by-side timer: Pause both timers
    function pauseTimers() {
        stopTimer(leftTimer);
        stopTimer(rightTimer);
        showDirectionButtons(); // This will unhide left and right buttons when pause is clicked
    }

    // Side-by-side timer: Reverse timers
    function reverseTimers() {
        if (leftTimer.isRunning) {
            stopTimer(leftTimer);
            startTimer(rightTimer, 'right');
        } else if (rightTimer.isRunning) {
            stopTimer(rightTimer);
            startTimer(leftTimer, 'left');
        }
    }

    // Side-by-side timer: Reset both timers
    function resetTimers() {
        [leftTimer, rightTimer].forEach((timer, index) => {
            stopTimer(timer);
            timer.seconds = 0;
            updateDisplay(timer, index === 0 ? 'left' : 'right');
        });
        showDirectionButtons();
    }

    // Get control buttons
    const controls = timerPage.querySelector('.controls');
    const leftBtn = controls.querySelector('.leftBtn');
    const reverseBtn = controls.querySelector('.reverseBtn');
    const pauseBtn = controls.querySelector('.pauseBtn');
    const resetBtn = controls.querySelector('.resetBtn');
    const rightBtn = controls.querySelector('.rightBtn');

    // Add event listeners for control buttons
    leftBtn.addEventListener('click', () => startTimer(leftTimer, 'left'));
    reverseBtn.addEventListener('click', reverseTimers);
    pauseBtn.addEventListener('click', pauseTimers);
    resetBtn.addEventListener('click', () => resetTimers());
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

// Side-by-side timer without reverse: Create timer page
function createSideBySideTimerWithoutReverse() {
    // Create the main container for the side-by-side timer page without reverse
    const timerPage = document.createElement('div');
    timerPage.className = 'timer-page side-by-side without-reverse';

    // Specify the type of timer page for saveConfiguration
    timerPage.dataset.type = 'side-by-side-without-switch';
    
    // Set up the HTML structure for the side-by-side timer page without reverse
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

    // Add event listener for deleting the timer
    timerPage.querySelector('.deleteBtn').addEventListener('click', () => deleteTimer(timerPage));

    // Initialize left and right timers
    const leftTimer = { seconds: 0, isRunning: false, interval: null };
    const rightTimer = { seconds: 0, isRunning: false, interval: null };

    // Side-by-side timer without reverse: Update display
    function updateDisplay(timer, side) {
        const timerElement = timerPage.querySelector(`.timer.${side}`);
        timerElement.textContent = formatTime(timer.seconds);
    }

    // Side-by-side timer without reverse: Start timer
    function startTimer(timer, side) {
        if (!timer.isRunning && timer.seconds > 0) {
            timer.isRunning = true;
            timer.interval = setInterval(() => {
                if (timer.seconds > 0) {
                    timer.seconds--;
                    updateDisplay(timer, side);
                    // Play sound at 30 seconds remaining
                    if (timer.seconds === 30) {
                        playSound('/timer/timer-30sec.mp3');
                    // Play sound at 0 seconds
                    } else if (timer.seconds === 0) {
                        playSound('/timer/timer-end.mp3');
                        clearInterval(timer.interval);
                        timer.isRunning = false;
                    }
                }
            }, 1000);
        }
    }

    // Side-by-side timer without reverse: Stop timer
    function stopTimer(timer) {
        clearInterval(timer.interval);
        timer.isRunning = false;
    }

    // Side-by-side timer without reverse: Pause both timers
    function pauseTimers() {
        stopTimer(leftTimer);
        stopTimer(rightTimer);
    }

    // Side-by-side timer without reverse: Reset both timers
    function resetTimers() {
        [leftTimer, rightTimer].forEach((timer, index) => {
            stopTimer(timer);
            timer.seconds = 0;
            updateDisplay(timer, index === 0 ? 'left' : 'right');
        });
    }

    // Get control buttons
    const controls = timerPage.querySelector('.controls');
    const leftBtn = controls.querySelector('.leftBtn');
    const pauseBtn = controls.querySelector('.pauseBtn');
    const resetBtn = controls.querySelector('.resetBtn');
    const rightBtn = controls.querySelector('.rightBtn');

    // Add event listeners for control buttons
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

// Test sound page: Create test sound page
function createTestSoundPage() {
    const testSoundPage = document.createElement('div');
    testSoundPage.className = 'timer-page test-sound-page';
    testSoundPage.innerHTML = `
        <button class="deleteBtn" title="Delete Page">&times;</button>
        <div class="test-sound-container">
            <button class="test-sound-btn" data-sound="/timer/timer-30sec.mp3">30 Sec Sound</button>
            <button class="test-sound-btn" data-sound="/timer/timer-end.mp3">End Sound</button>
        </div>
    `;

    // Specify the type of timer page for saveConfiguration
    testSoundPage.dataset.type = 'soundTest';

    testSoundPage.querySelector('.deleteBtn').addEventListener('click', () => deleteTimer(testSoundPage));

    testSoundPage.querySelectorAll('.test-sound-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const audio = new Audio(btn.dataset.sound);
            audio.play();
        });
    });

    return testSoundPage;
}

// Timer management: Add single timer when site is loaded
function addTimer() {
    const index = document.querySelectorAll('.timer-page').length;
    const timerPage = createTimerPage(index);
    document.getElementById('timerContainer').appendChild(timerPage);
    updatePageIndicator();
    scrollToTimer(index);
}
//////////////////////
// CREATE NEW PAGES //
//////////////////////

// Navigation: Update page indicator
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

// Navigation: Scroll to specific timer
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

// Menu: Toggle menu visibility
function toggleMenu(force) {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (force !== undefined) {
        hamburgerMenu.classList.toggle('open', force);
    } else {
        hamburgerMenu.classList.toggle('open');
    }
}

// Initialization: Set up event listeners and initial state
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

// Timer management: Delete timer
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

// Timer management: Update timer indices
function updateTimerIndices() {
    document.querySelectorAll('.timer-page').forEach((page, index) => {
        page.dataset.index = index;
    });
}

// Navigation: Update current page
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

// Menu: Handle clicks outside the menu
function handleOutsideClick(event) {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const openMenuBtn = document.getElementById('openMenuBtn');
    
    if (hamburgerMenu.classList.contains('open') &&
        !hamburgerMenu.contains(event.target) &&
        event.target !== openMenuBtn) {
        toggleMenu(false);
    }
}

// Timer management: Add side-by-side timer
function addSideBySideTimer() {
    const sideBySideTimerPage = createSideBySideTimerPage();
    document.getElementById('timerContainer').appendChild(sideBySideTimerPage);
    updatePageIndicator();
    scrollToTimer(document.querySelectorAll('.timer-page').length - 1);
}

/////////////////////////////////
// SAVE AND LOAD CONFIGURATION //
/////////////////////////////////

function saveConfiguration() {
    const pages = document.querySelectorAll('.timer-page');
    const config = [];

    pages.forEach(page => {
        const pageType = page.dataset.type;
        const timers = [];
        const titles = [];

        // Collecting timer values and titles based on the type
        page.querySelectorAll('.timer').forEach(timer => {
            timers.push(timer.textContent.trim());
        });
        page.querySelectorAll('.timer-title').forEach(title => {
            titles.push(title.textContent.trim());
        });

        config.push({
            type: pageType,
            timers: timers,
            titles: titles
        });
    });

    const configJSON = JSON.stringify(config);
    downloadJSON(configJSON, 'timer-config.json');
}


function downloadJSON(json, filename) {
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function loadConfiguration() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const config = JSON.parse(e.target.result);
                restorePages(config);
            };
            reader.readAsText(file);
        }
    };

    fileInput.click();
}

function restorePages(config) {
    // Clear the existing pages
    const timerContainer = document.getElementById('timerContainer');
    timerContainer.innerHTML = '';

    config.forEach(pageConfig => {
        let page;

        // Create the page based on its type
        if (pageConfig.type === 'single') {
            page = createTimerPage();
            restoreSingleTimerPage(page, pageConfig);
        } else if (pageConfig.type === 'side-by-side-with-switch') {
            page = createSideBySideTimerPage();
            restoreSideBySideTimerPage(page, pageConfig, true);
        } else if (pageConfig.type === 'side-by-side-without-switch') {
            page = createSideBySideTimerWithoutReverse();
            restoreSideBySideTimerPage(page, pageConfig, false);
        } else if (pageConfig.type === 'soundTest') {
            page = createTestSoundPage();
            // No timers to restore for the sound test page
        }

        timerContainer.appendChild(page);
    });
}

// Restore a single timer page
function restoreSingleTimerPage(page, config) {
    let seconds = parseTime(config.timers[0]);
    let isRunning = false;
    let interval;

    const updateDisplay = () => {
        page.querySelector('.timer').textContent = formatTime(seconds);
    };

    const startTimer = () => {
        if (!isRunning && seconds > 0) {
            isRunning = true;
            interval = setInterval(() => {
                if (seconds > 0) {
                    seconds--;
                    updateDisplay();
                    if (seconds === 30) {
                        playSound('/timer/timer-30sec.mp3');
                    } else if (seconds === 0) {
                        playSound('/timer/timer-end.mp3');
                        clearInterval(interval);
                        isRunning = false;
                    }
                }
            }, 1000);
        }
    };

    const pauseTimer = () => {
        clearInterval(interval);
        isRunning = false;
    };

    const resetTimer = () => {
        clearInterval(interval);
        isRunning = false;
        seconds = 0;
        updateDisplay();
    };

    page.querySelector('.timer').textContent = formatTime(seconds);
    page.querySelector('.timer-title').textContent = config.titles[0];

    // Re-attach the event listeners
    page.querySelector('.startBtn').addEventListener('click', startTimer);
    page.querySelector('.pauseBtn').addEventListener('click', pauseTimer);
    page.querySelector('.resetBtn').addEventListener('click', resetTimer);

    page.querySelector('.timer').addEventListener('input', (e) => {
        const time = e.target.textContent.split(':').map(Number);
        seconds = (time[0] || 0) * 60 + (time[1] || 0);
    });
}

// Restore a side-by-side timer page (with or without switch)
// Restore a side-by-side timer page (with or without switch)
function restoreSideBySideTimerPage(page, config, hasSwitch) {
    const leftTimer = { seconds: parseTime(config.timers[0]), isRunning: false, interval: null };
    const rightTimer = { seconds: parseTime(config.timers[1]), isRunning: false, interval: null };

    const updateDisplay = (timer, side) => {
        page.querySelector(`.timer.${side}`).textContent = formatTime(timer.seconds);
    };

    const startTimer = (timer, side) => {
        if (!timer.isRunning && timer.seconds > 0) {
            timer.isRunning = true;
            timer.interval = setInterval(() => {
                if (timer.seconds > 0) {
                    timer.seconds--;
                    updateDisplay(timer, side);
                    if (timer.seconds === 30) {
                        playSound('/timer/timer-30sec.mp3');
                    } else if (timer.seconds === 0) {
                        playSound('/timer/timer-end.mp3');
                        clearInterval(timer.interval);
                        timer.isRunning = false;
                        if (hasSwitch && side === 'left') {
                            startTimer(rightTimer, 'right');
                        } else if (hasSwitch && side === 'right') {
                            startTimer(leftTimer, 'left');
                        }
                    }
                }
            }, 1000);
            if (hasSwitch) hideDirectionButtons(page);
        }
    };

    const stopTimer = (timer) => {
        clearInterval(timer.interval);
        timer.isRunning = false;
    };

    const resetTimers = () => {
        [leftTimer, rightTimer].forEach((timer, index) => {
            stopTimer(timer);
            timer.seconds = 0;
            updateDisplay(timer, index === 0 ? 'left' : 'right');
        });
        if (hasSwitch) showDirectionButtons(page);
    };

    const reverseTimers = () => {
        if (leftTimer.isRunning) {
            stopTimer(leftTimer);
            startTimer(rightTimer, 'right');
        } else if (rightTimer.isRunning) {
            stopTimer(rightTimer);
            startTimer(leftTimer, 'left');
        }
    };

    page.querySelector('.timer.left').textContent = formatTime(leftTimer.seconds);
    page.querySelector('.timer.right').textContent = formatTime(rightTimer.seconds);
    page.querySelector('.timer-title.left').textContent = config.titles[0];
    page.querySelector('.timer-title.right').textContent = config.titles[1];

    const controls = page.querySelector('.controls');
    const leftBtn = controls.querySelector('.leftBtn');
    const reverseBtn = hasSwitch ? controls.querySelector('.reverseBtn') : null;
    const pauseBtn = controls.querySelector('.pauseBtn');
    const resetBtn = controls.querySelector('.resetBtn');
    const rightBtn = controls.querySelector('.rightBtn');

    // Attach event listeners
    leftBtn.addEventListener('click', () => startTimer(leftTimer, 'left'));
    if (hasSwitch && reverseBtn) {
        reverseBtn.addEventListener('click', reverseTimers);
    }
    pauseBtn.addEventListener('click', () => {
        stopTimer(leftTimer);
        stopTimer(rightTimer);
        if (hasSwitch) showDirectionButtons(page);
    });
    resetBtn.addEventListener('click', resetTimers);
    rightBtn.addEventListener('click', () => startTimer(rightTimer, 'right'));

    page.querySelectorAll('.timer').forEach((timerElement, index) => {
        timerElement.addEventListener('input', (e) => {
            const time = e.target.textContent.split(':').map(Number);
            const timer = index === 0 ? leftTimer : rightTimer;
            timer.seconds = (time[0] || 0) * 60 + (time[1] || 0);
            updateDisplay(timer, index === 0 ? 'left' : 'right');
        });
    });

    page.leftTimer = leftTimer;
    page.rightTimer = rightTimer;
}


function reverseTimers(leftTimer, rightTimer, page) {
    stopTimer(leftTimer); // Ensure the currently running timer is stopped before switching
    stopTimer(rightTimer);
    
    if (leftTimer.isRunning) {
        stopTimer(leftTimer);
        startTimer(rightTimer, 'right');
    } else if (rightTimer.isRunning) {
        stopTimer(rightTimer);
        startTimer(leftTimer, 'left');
    }
}

function hideDirectionButtons(page) {
    const controls = page.querySelector('.controls');
    controls.querySelector('.leftBtn').style.display = 'none';
    controls.querySelector('.rightBtn').style.display = 'none';
}

function showDirectionButtons(page) {
    const controls = page.querySelector('.controls');
    controls.querySelector('.leftBtn').style.display = '';
    controls.querySelector('.rightBtn').style.display = '';
}

function parseTime(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
}


/////////////////////////////////
// SAVE AND LOAD CONFIGURATION //
/////////////////////////////////

/////////////////////
// AUDIO FUNCTIONS //
/////////////////////

function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play();
}

/////////////////////
// AUDIO FUNCTIONS //
/////////////////////

// Function to set the background image from a file
function setBackgroundImageFromFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        document.body.style.backgroundImage = `url(${e.target.result})`;
    };
    
    reader.readAsDataURL(file);
}

// Event listener for the background button
document.getElementById('addBackgroundBtn').addEventListener('click', function() {
    document.getElementById('backgroundImageInput').click();
});

// Event listener for file input
document.getElementById('backgroundImageInput').addEventListener('change', function() {
    const file = this.files[0];
    
    if (file) {
        setBackgroundImageFromFile(file);
    }
});
