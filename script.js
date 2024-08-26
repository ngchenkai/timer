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
                if (timers[index].seconds === 30) {
                    console.log('Timer hit 30 seconds, playing warning sound');
                    play30SecWarningSound();
                }
                if (timers[index].seconds === 0) {
                    playTimerSound();
                    clearInterval(timers[index].interval);
                    timers[index].isRunning = false;
                    console.log(`Timer ${index + 1} finished!`);
                }
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
    console.log(`Creating side-by-side timer page`);
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
    
    const leftTimer = createTimer();
    const rightTimer = createTimer();

    timerPage.querySelector('.leftBtn').addEventListener('click', () => startTimer(leftTimer, timerPage, 'left'));
    timerPage.querySelector('.rightBtn').addEventListener('click', () => startTimer(rightTimer, timerPage, 'right'));
    timerPage.querySelector('.pauseBtn').addEventListener('click', () => pauseTimers(leftTimer, rightTimer));
    timerPage.querySelector('.resetBtn').addEventListener('click', () => resetTimers(leftTimer, rightTimer, timerPage));
    timerPage.querySelector('.reverseBtn').addEventListener('click', () => reverseTimers(leftTimer, rightTimer, timerPage));

    return timerPage;
}

function createSideBySideTimerWithoutReverse() {
    console.log(`Creating side-by-side timer without reverse`);
    const timerPage = document.createElement('div');
    timerPage.className = 'timer-page side-by-side without-reverse';
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

    const leftTimer = { seconds: 0, isRunning: false, interval: null };
    const rightTimer = { seconds: 0, isRunning: false, interval: null };

    function updateDisplay(timer, side) {
        const timerElement = timerPage.querySelector(`.timer.${side}`);
        const formattedTime = formatTime(timer.seconds);
        timerElement.textContent = formattedTime;
        timerElement.style.color = timer.seconds < 10 ? 'red' : '';
        if (timer.seconds === 0) {
            playTimerSound();
        }
    }

    function startTimer(timer, side) {
        if (!timer.isRunning && timer.seconds > 0) {
            timer.isRunning = true;
            timer.interval = setInterval(() => {
                if (timer.seconds > 0) {
                    timer.seconds--;
                    updateDisplay(timer, side);
                    if (timer.seconds === 30) {
                        play30SecWarningSound();
                    }
                    if (timer.seconds === 0) {
                        playTimerSound();
                        clearInterval(timer.interval);
                        timer.isRunning = false;
                        // Start the other timer automatically (for side-by-side with reverse)
                        if (side === 'left' && rightTimer.seconds > 0) {
                            startTimer(rightTimer, 'right');
                        } else if (side === 'right' && leftTimer.seconds > 0) {
                            startTimer(leftTimer, 'left');
                        }
                    }
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
    console.log(`Page indicator updated. Total indicators: ${timerPages.length}`);
}

function scrollToBottom() {
    const timerContainer = document.getElementById('timerContainer');
    setTimeout(() => {
        timerContainer.scrollTo({
            top: timerContainer.scrollHeight,
            behavior: 'smooth'
        });
        // Update currentPage and page indicator after scrolling
        setTimeout(() => {
            currentPage = timers.length - 1;
            updatePageIndicator();
        }, 500);
    }, 0);
}

function scrollToTimer(index) {
    const timerContainer = document.getElementById('timerContainer');
    const timerPages = document.querySelectorAll('.timer-page');
    if (timerPages[index]) {
        setTimeout(() => {
            timerPages[index].scrollIntoView({ behavior: 'smooth' });
            // Update currentPage and page indicator after scrolling
            setTimeout(() => {
                currentPage = index;
                updatePageIndicator();
            }, 500);
        }, 0);
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
// te
function startTimer(timer, timerPage, side) {
    if (!timer.isRunning) {
        timer.isRunning = true;
        timer.interval = setInterval(() => {
            if (timer.seconds > 0) {
                timer.seconds--;
                updateDisplay(timer, timerPage, side);
                if (timer.seconds === 0) {
                    clearInterval(timer.interval);
                    timer.isRunning = false;
                    playTimerSound();
                }
            }
        }, 1000);
    }
}

function pauseTimers(leftTimer, rightTimer) {
    [leftTimer, rightTimer].forEach(timer => {
        if (timer.isRunning) {
            clearInterval(timer.interval);
            timer.isRunning = false;
        }
    });
}

function resetTimers(leftTimer, rightTimer, timerPage) {
    [leftTimer, rightTimer].forEach(timer => {
        clearInterval(timer.interval);
        timer.isRunning = false;
        timer.seconds = 1; // Reset to 1 second (00:01)
    });
    updateDisplay(leftTimer, timerPage, 'left');
    updateDisplay(rightTimer, timerPage, 'right');
}

function reverseTimers(leftTimer, rightTimer, timerPage) {
    const leftSeconds = leftTimer.seconds;
    const leftIsRunning = leftTimer.isRunning;
    
    leftTimer.seconds = rightTimer.seconds;
    leftTimer.isRunning = rightTimer.isRunning;
    
    rightTimer.seconds = leftSeconds;
    rightTimer.isRunning = leftIsRunning;
    
    updateDisplay(leftTimer, timerPage, 'left');
    updateDisplay(rightTimer, timerPage, 'right');
}

function updateDisplay(timer, timerPage, side) {
    const timerElement = timerPage.querySelector(`.timer.${side}`);
    const formattedTime = formatTime(timer.seconds);
    timerElement.textContent = formattedTime;
    timerElement.style.color = timer.seconds < 10 ? 'red' : '';
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function initialize() {
    // Add the default side-by-side timer without reverse button
    const defaultTimer = createSideBySideTimerWithoutReverse();
    document.getElementById('timerContainer').appendChild(defaultTimer);
    updatePageIndicator();

    document.getElementById('addSideBySideTimerBtn').addEventListener('click', () => {
        addSideBySideTimer();
        toggleMenu();
    });
    document.getElementById('addSideBySideTimerWithoutReverseBtn').addEventListener('click', () => {
        addSideBySideTimerWithoutReverse();
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
}

// Call initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);

function toggleMenu(force) {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (force !== undefined) {
        hamburgerMenu.classList.toggle('open', force);
    } else {
        hamburgerMenu.classList.toggle('open');
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

function updateCurrentPage() {
    const timerContainer = document.getElementById('timerContainer');
    const timerPages = document.querySelectorAll('.timer-page');
    const containerRect = timerContainer.getBoundingClientRect();

    let newCurrentPage = 0;
    for (let i = 0; i < timerPages.length; i++) {
        const timerRect = timerPages[i].getBoundingClientRect();
        if (timerRect.top >= containerRect.top) {
            newCurrentPage = i;
            break;
        }
    }

    if (currentPage !== newCurrentPage) {
        currentPage = newCurrentPage;
        updatePageIndicator();
    }
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

function playTimerSound() {
    const audio = document.getElementById('timerSound');
    if (!audio) {
        return;
    }
    audio.play().then(() => {
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 3000);
    }).catch(error => {
        console.error('Error playing audio:', error);
    });
}

function play30SecWarningSound() {
    const audio = document.getElementById('timer30SecSound');
    if (!audio) {
        console.error('30-second warning audio element not found');
        return;
    }
    audio.play().catch(error => {
        console.error('Error playing 30-second warning audio:', error);
    });
}