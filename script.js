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
        <button class="deleteBtn">&times;</button>
        <div class="timer-title" contenteditable="true">Timer ${index + 1}</div>
        <div class="timer" contenteditable="true">00:00</div>
        <div class="controls">
            <button class="startBtn"><i class="fas fa-play"></i></button>
            <button class="pauseBtn"><i class="fas fa-pause"></i></button>
            <button class="resetBtn"><i class="fas fa-undo"></i></button>
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
        <button class="deleteBtn">&times;</button>
        <div class="timer-container">
            <div class="timer-left-space">
                <div class="timer-title left" contenteditable="true">Left Timer</div>
                <div class="timer left" contenteditable="true">00:00</div>
            </div>
            <div class="controls-space">
                <div class="controls">
                    <button class="leftBtn"><i class="fas fa-chevron-left"></i></button>
                    <button class="reverseBtn"><i class="fas fa-sync"></i></button>
                    <button class="pauseBtn"><i class="fas fa-pause"></i></button>
                    <button class="resetBtn"><i class="fas fa-undo"></i></button>
                    <button class="rightBtn"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="timer-right-space">
                <div class="timer-title right" contenteditable="true">Right Timer</div>
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