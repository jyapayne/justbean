let currentItems = []; // Holds the original list of items provided by the user
let displayedItems = []; // Holds the items currently displayed on the board
let notificationTimeout = null; // To manage hiding notifications

// --- localStorage Keys ---
const LS_BOARD_SIZE = 'beango_boardSize';
const LS_CELL_ITEMS = 'beango_cellItems'; // Original items from textarea/file
const LS_DISPLAYED_ITEMS = 'beango_displayedItems'; // Items currently shown on the board
const LS_MARKED_INDICES = 'beango_markedIndices';
const LS_CONFIG_OPEN = 'beango_configOpen'; // Changed from minimized
const LS_BACKGROUND_COLOR = 'beango_backgroundColor'; // New key

// --- Default Values ---
const DEFAULT_BACKGROUND_COLOR = '#F0F0F0'; // Light gray

// --- Notification Function ---
function showNotification(message, type = 'info', duration = 3000) {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) return;

    // Clear any existing timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }

    notificationArea.textContent = message;
    // Apply Tailwind classes based on type
    notificationArea.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white text-sm transition-opacity duration-300'; // Reset classes
    switch (type) {
        case 'success':
            notificationArea.classList.add('bg-green-500');
            break;
        case 'warning':
            notificationArea.classList.add('bg-yellow-500');
            break;
        case 'error':
            notificationArea.classList.add('bg-red-500');
            break;
        default: // info
            notificationArea.classList.add('bg-blue-500');
            break;
    }

    // Make it visible
    notificationArea.classList.add('opacity-100');

    // Set timeout to hide
    notificationTimeout = setTimeout(() => {
        notificationArea.classList.remove('opacity-100');
        notificationArea.classList.add('opacity-0');
    }, duration);
}

// --- Functions ---

// --- Function to set the HTML background color ---
function setBackgroundColor(color) {
    document.documentElement.style.backgroundColor = color;
}

function toggleConfig() {
    const pane = document.getElementById('config-pane');
    const isOpen = pane.classList.contains('config-pane-open');

    if (isOpen) {
        pane.classList.remove('config-pane-open');
        pane.classList.add('config-pane-closed');
        localStorage.setItem(LS_CONFIG_OPEN, 'false');
    } else {
        pane.classList.remove('config-pane-closed');
        pane.classList.add('config-pane-open');
        localStorage.setItem(LS_CONFIG_OPEN, 'true');
    }
}

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('cell-contents').value = e.target.result;
            showNotification('File loaded. Click Generate/Update to use items.', 'success');
        };
        reader.onerror = function() {
            showNotification('Error reading file.', 'error');
        };
        reader.readAsText(file);
    }
});

function getItemsFromInput() {
    const text = document.getElementById('cell-contents').value.trim();
    return text ? text.split('\n').map(item => item.trim()).filter(item => item) : [];
}

// Helper to save board state
function saveBoardState() {
    const sizeInput = document.getElementById('board-size');
    const size = sizeInput ? parseInt(sizeInput.value, 10) : 5; // Default to 5 if input missing
    const markedIndices = getMarkedIndices();

    localStorage.setItem(LS_BOARD_SIZE, size);
    localStorage.setItem(LS_CELL_ITEMS, JSON.stringify(currentItems)); // Save original items
    localStorage.setItem(LS_DISPLAYED_ITEMS, JSON.stringify(displayedItems)); // Save displayed items
    localStorage.setItem(LS_MARKED_INDICES, JSON.stringify(markedIndices));
}

function generateBoard() {
    const sizeInput = document.getElementById('board-size');
    const size = parseInt(sizeInput.value, 10);
    if (isNaN(size) || size < 1) {
        showNotification("Please enter a valid board size (minimum 1).", 'warning');
        return;
    }
    sizeInput.value = size; // Ensure value reflects parsed int

    // Get items from input and store them as the canonical list
    currentItems = getItemsFromInput();
    localStorage.setItem(LS_CELL_ITEMS, JSON.stringify(currentItems)); // Save original items immediately

    const requiredItems = size * size;
    let itemsForBoard = [...currentItems]; // Start with a copy of original items
    let notificationMessage = 'Board generated successfully!';
    let notificationType = 'success';

    if (itemsForBoard.length < requiredItems) {
        const diff = requiredItems - itemsForBoard.length;
        notificationMessage = `Warning: Needed ${requiredItems} items, found ${itemsForBoard.length}. Padding with ${diff} placeholder(s).`;
        notificationType = 'warning';
        for (let i = 0; i < diff; i++) {
            itemsForBoard.push(`Placeholder ${i+1}`);
        }
        // Update currentItems if placeholders were added, so randomize uses them too
        currentItems = [...itemsForBoard];
        localStorage.setItem(LS_CELL_ITEMS, JSON.stringify(currentItems));
    } else if (itemsForBoard.length > requiredItems) {
        notificationMessage = `Info: Found ${itemsForBoard.length} items, randomly selecting ${requiredItems}.`;
        notificationType = 'info';
        itemsForBoard = shuffleArray(itemsForBoard).slice(0, requiredItems);
        // Update currentItems to reflect the selected subset
        currentItems = [...itemsForBoard];
        localStorage.setItem(LS_CELL_ITEMS, JSON.stringify(currentItems));
    }

    // Shuffle the items specifically for display
    displayedItems = shuffleArray([...itemsForBoard]);

    const board = document.getElementById('bingo-board');
    board.innerHTML = ''; // Clear previous board
    board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;

    displayedItems.forEach((item, index) => {
        const cell = document.createElement('div');
        cell.classList.add('bingo-cell', 'cursor-pointer');
        cell.textContent = item;
        cell.dataset.index = index; // Add index for saving marks
        cell.onclick = () => selectCell(cell);
        board.appendChild(cell);
    });

    clearMarks(false); // Clear previous marks visually but don't save yet
    equalizeCellSizes(); // Add this call
    saveBoardState(); // Save the newly generated state
    showNotification(notificationMessage, notificationType);

    // Reload the page to ensure correct rendering based on saved state
    location.reload();
}

function randomizeBoard() {
    const storedItemsRaw = localStorage.getItem(LS_CELL_ITEMS);
    const sizeRaw = localStorage.getItem(LS_BOARD_SIZE);

    if (!storedItemsRaw || !sizeRaw) {
         showNotification("Cannot randomize: Board state not found. Please generate the board first.", 'warning');
         return;
    }

    const storedItems = JSON.parse(storedItemsRaw);
    const size = parseInt(sizeRaw, 10);
    const requiredItems = size * size;

    if (storedItems.length < requiredItems) {
        showNotification(`Cannot randomize: Not enough items saved (${storedItems.length}/${requiredItems}). Please generate the board again.`, 'warning');
        return;
    }

    // Ensure we use the correct set if placeholders were added or items were sliced
     let itemsToShuffle = [...storedItems];
     if (itemsToShuffle.length > requiredItems) {
         // This case implies items were sliced during generation, which is stored in currentItems
         // Randomizing should still use the items that *could* be on the board
          itemsToShuffle = itemsToShuffle.slice(0, requiredItems);

     } else if (itemsToShuffle.length < requiredItems) {
        // This case shouldn't happen if generateBoard saved padded items
         showNotification("Cannot randomize: Item count mismatch. Please regenerate the board.", 'error');
         return;
     }

    displayedItems = shuffleArray([...itemsToShuffle]); // Shuffle the items for display

    const board = document.getElementById('bingo-board');
    const cells = board.querySelectorAll('.bingo-cell');

    if (cells.length !== displayedItems.length) {
        showNotification("Cannot randomize: Board size mismatch. Please generate the board again.", 'error');
        return;
    }

    cells.forEach((cell, index) => {
        cell.textContent = displayedItems[index];
        cell.classList.remove('bg-yellow-300', 'ring-2', 'ring-blue-500'); // Clear marks visually
    });

    clearMarks(false); // Clear visual marks
    saveBoardState(); // Save the new randomized state (including cleared marks)
    showNotification('Board randomized!', 'success');
}

function selectCell(cell) {
    cell.classList.toggle('marked'); // Toggle the dedicated 'marked' class
    saveBoardState(); // Save updated marks immediately after click
}

function clearMarks(save = true) {
    const cells = document.querySelectorAll('#bingo-board .bingo-cell');
    cells.forEach(cell => {
        cell.classList.remove('marked', 'ring-2', 'ring-blue-500'); // Use 'marked' class
    });
    if (save) {
        saveBoardState(); // Save cleared marks
        showNotification('Marks cleared.', 'info');
    }
}

// Fisher-Yates (aka Knuth) Shuffle Algorithm
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Function to reset settings and clear board
function resetSettings() {
    // Clear localStorage relevant to the board
    localStorage.removeItem(LS_BOARD_SIZE);
    localStorage.removeItem(LS_CELL_ITEMS);
    localStorage.removeItem(LS_DISPLAYED_ITEMS);
    localStorage.removeItem(LS_MARKED_INDICES);
    // Optionally reset config pane state too?
    // localStorage.removeItem(LS_CONFIG_OPEN);
    localStorage.removeItem(LS_BACKGROUND_COLOR); // Remove saved color

    // Reset global variables
    currentItems = [];
    displayedItems = [];

    // Reset form inputs
    document.getElementById('board-size').value = 5; // Default size
    document.getElementById('cell-contents').value = '';
    document.getElementById('file-input').value = ''; // Clear file input
    document.getElementById('background-color-picker').value = DEFAULT_BACKGROUND_COLOR; // Reset color picker

    // Clear the board display
    const board = document.getElementById('bingo-board');
    board.innerHTML = '<div class="bingo-cell">Settings Reset. Generate a new board!</div>';
    board.style.gridTemplateColumns = ''; // Clear grid style
    board.style.gridAutoRows = ''; // Also clear gridAutoRows

    // Reset container width to default - REMOVED
    // updateBoardContainerMaxWidth(5); // Assuming 5 is the default size
    // updateBoardContainerMaxWidth(5, '#board-header');
    // Also clear any inline max-width set by equalizeCellSizes
    const boardContainer = document.getElementById('bingo-board-container');
    const boardHeader = document.getElementById('board-header');
    if (boardContainer) boardContainer.style.maxWidth = '';
    if (boardHeader) boardHeader.style.maxWidth = '';

    setBackgroundColor(DEFAULT_BACKGROUND_COLOR); // Reset background color
    showNotification('Settings and board reset.', 'success');
}

// --- Helper to get indices of marked cells ---
function getMarkedIndices() {
    const markedCells = document.querySelectorAll('#bingo-board .bingo-cell.marked');
    const indices = [];
    markedCells.forEach(cell => {
        // Ensure dataset.index exists and is a valid number
        if (cell.dataset && typeof cell.dataset.index !== 'undefined') {
            const index = parseInt(cell.dataset.index, 10);
            if (!isNaN(index)) {
                indices.push(index);
            }
        } else {
            console.warn('Marked cell found without a valid data-index:', cell);
        }
    });
    return indices;
}

// --- Load State on Page Load ---
function loadFromLocalStorage() {
    const savedSize = localStorage.getItem(LS_BOARD_SIZE) || '5'; // Default to 5
    const savedItemsText = localStorage.getItem(LS_CELL_ITEMS);
    const savedDisplayedItems = localStorage.getItem(LS_DISPLAYED_ITEMS);
    const savedMarkedIndices = localStorage.getItem(LS_MARKED_INDICES);
    const configIsOpen = localStorage.getItem(LS_CONFIG_OPEN) === 'true';
    const savedBackgroundColor = localStorage.getItem(LS_BACKGROUND_COLOR);

    // Restore Config Pane State
    const pane = document.getElementById('config-pane');
    if (configIsOpen) {
        pane.classList.remove('config-pane-closed');
        pane.classList.add('config-pane-open');
    } else {
        pane.classList.remove('config-pane-open');
        pane.classList.add('config-pane-closed');
    }

    // Restore Config Inputs
    const size = parseInt(savedSize, 10); // Parse size here
    document.getElementById('board-size').value = savedSize;

    // Restore Background Color
    const colorPicker = document.getElementById('background-color-picker');
    if (savedBackgroundColor) {
        colorPicker.value = savedBackgroundColor;
        setBackgroundColor(savedBackgroundColor);
    } else {
        colorPicker.value = DEFAULT_BACKGROUND_COLOR;
        setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
    }

    // Update container width based on loaded size - REMOVED
    // updateBoardContainerMaxWidth(size);
    // updateBoardContainerMaxWidth(size, '#board-header');

    if (savedItemsText) {
        try {
            currentItems = JSON.parse(savedItemsText); // Restore original items array
            document.getElementById('cell-contents').value = currentItems.join('\n');
        } catch (e) {
            showNotification('Error parsing saved items. Resetting items.', 'error');
            localStorage.removeItem(LS_CELL_ITEMS);
            currentItems = [];
            document.getElementById('cell-contents').value = '';
        }
    }

    // Restore Board only if essential data exists
    if (savedDisplayedItems) {
        try {
            displayedItems = JSON.parse(savedDisplayedItems); // Restore displayed items array
        } catch (e) {
             showNotification('Error parsing saved board state. Please generate again.', 'error');
             localStorage.removeItem(LS_DISPLAYED_ITEMS);
             localStorage.removeItem(LS_MARKED_INDICES);
             displayedItems = [];
             document.getElementById('bingo-board').innerHTML = '<div class="bingo-cell">Error loading board. Generate New.</div>';
             return; // Stop board restore
        }

        const requiredItems = size * size;

        // Check if the loaded data is consistent
        if (!Array.isArray(displayedItems) || displayedItems.length !== requiredItems) {
            showNotification("Saved board data mismatch. Please generate again.", 'warning');
             localStorage.removeItem(LS_DISPLAYED_ITEMS);
             localStorage.removeItem(LS_MARKED_INDICES);
             document.getElementById('bingo-board').innerHTML = '<div class="bingo-cell">Data Mismatch. Generate New.</div>';
             return; // Stop loading the board state
        }

        const board = document.getElementById('bingo-board');
        board.innerHTML = ''; // Clear placeholder
        board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;

        const markedIndices = savedMarkedIndices ? JSON.parse(savedMarkedIndices) : [];

        displayedItems.forEach((item, index) => {
            const cell = document.createElement('div');
            cell.classList.add('bingo-cell', 'cursor-pointer');
            cell.textContent = item;
            cell.dataset.index = index; // Ensure index is set for loading marks correctly
            cell.onclick = () => selectCell(cell);
            if (markedIndices.includes(index)) {
                cell.classList.add('marked'); // Apply saved mark using 'marked' class
            }
            board.appendChild(cell);
        });
        equalizeCellSizes(); // Add this call
    } else {
         // If no saved board state, show the default message
         const board = document.getElementById('bingo-board');
         // Check if board div exists and has no children before adding message
         if (board && board.children.length === 0) {
             board.innerHTML = '<div class="bingo-cell">Generate a board using the config panel!</div>';
         }
    }
}

// --- Helper to manage board container width --- DEPRECATED
/* function updateBoardContainerMaxWidth(size, element = '#bingo-board-container') {
    const container = document.querySelector(element);

    if (!container) return;

    // Remove existing max-w classes
    const classList = container.classList;
    const existingMaxWidthClasses = Array.from(classList).filter(cls => cls.startsWith('max-w-'));
    classList.remove(...existingMaxWidthClasses);

    // Determine and add the new max-w class
    let maxWidthClass = 'max-w-2xl'; // Default for 5x5
    if (size <= 3) {
        maxWidthClass = 'max-w-lg';
    } else if (size === 4) {
        maxWidthClass = 'max-w-xl';
    } else if (size === 5) {
        maxWidthClass = 'max-w-2xl';
    } else if (size === 6) {
        maxWidthClass = 'max-w-3xl';
    } else if (size === 7) {
        maxWidthClass = 'max-w-4xl';
    } else if (size >= 8) {
        maxWidthClass = 'max-w-5xl'; // Cap here, rely on scroll for larger
    }
    container.classList.add(maxWidthClass);
} */

// --- Function to make all cells square and equal size ---
function equalizeCellSizes() {
    const board = document.getElementById('bingo-board');
    const cells = board?.querySelectorAll('.bingo-cell');
    if (!board || !cells || cells.length === 0) return;

    // Try to determine grid size (number of columns) more reliably
    let size = 0;
    const sizeInput = document.getElementById('board-size');
    const sizeFromInput = sizeInput ? parseInt(sizeInput.value, 10) : 0;

    if (sizeFromInput && !isNaN(sizeFromInput) && sizeFromInput > 0) {
        size = sizeFromInput;
    } else {
        // Fallback: try parsing from computed style if input is bad/missing
        try {
            const gridStyle = window.getComputedStyle(board).gridTemplateColumns;
            const parts = gridStyle.split(' ');
            if (parts.length > 0 && parts[0] !== 'none') {
                size = parts.length;
            }
        } catch (e) {
            console.error("Could not determine grid size from styles or input.", e);
        }
    }

    if (size <= 0) {
        showNotification('Cannot determine valid grid size. Using default or previous.', 'warning');
        // Attempt to get size from a potentially existing grid setup if possible
        try {
             const gridStyle = window.getComputedStyle(board).gridTemplateColumns;
             const parts = gridStyle.split(' ');
             if (parts.length > 0 && parts[0] !== 'none') {
                 size = parts.length;
             }
        } catch { /* ignore */ }
        if (size <= 0) {
             console.error("Failed to determine grid size.");
             return; // Cannot proceed
        }
    }


    let maxDimension = 0;
    const gap = 4; // From CSS: .bingo-board { gap: 4px; }

    // 1. Reset grid sizing to allow natural measurement of cell content
    board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`; // Use fractions initially
    board.style.gridAutoRows = 'auto'; // Auto height

    // 2. Force reflow to apply the reset styles before measuring
    void board.offsetHeight;

    // 3. First pass: Find the largest dimension based on actual rendered content
    cells.forEach(cell => {
        // Reset any explicit cell styles (shouldn't be needed, but safe)
        cell.style.width = '';
        cell.style.height = '';

        // Measure the cell's natural dimensions after reflow
        const width = cell.offsetWidth;
        const height = cell.offsetHeight;
        maxDimension = Math.max(maxDimension, width, height);
    });

     // Ensure a minimum size for very small content or empty cells
    const targetSize = Math.max(maxDimension, 120); // Use 120px minimum

    // 4. Apply the calculated fixed size back to the grid
    board.style.gridTemplateColumns = `repeat(${size}, ${targetSize}px)`;
    board.style.gridAutoRows = `${targetSize}px`; // Make cells square

    // 5. Calculate total board width needed for the container
    const containerPadding = 32; // Based on p-4 class (1rem = 16px, left + right = 32px)
    // Use targetSize for the calculation
    const totalWidth = (targetSize * size) + (gap * (size - 1)) + containerPadding;

    // Update container max-width
    const boardContainer = document.getElementById('bingo-board-container');
    const boardHeader = document.getElementById('board-header');

    if (boardContainer) {
        boardContainer.style.maxWidth = `${totalWidth}px`;
    }
    if (boardHeader) {
        // Keep header consistent with board container width
        boardHeader.style.maxWidth = `${totalWidth}px`;
    }
}

function explodeBeans() {
    const container = document.querySelector('.centered');
    for (let i = 0; i < 20; i++) {
        const newBean = document.createElement('img');
        newBean.src = '../bean.svg';
        newBean.style.position = 'absolute';
        newBean.style.width = '25px';
        newBean.style.height = '25px';
        newBean.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
        newBean.style.opacity = '0';

        // Initial position at the center of the img tag
        newBean.style.transform = 'translate(100px, 0) scale(0.5)';

        container.appendChild(newBean);

        // Random position around the original bean
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 100 + 50+100;

        // Trigger the animation
        setTimeout(() => {
            newBean.style.opacity = '1';
            newBean.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(1)`;
        }, 0);

        // Remove the bean after animation
        setTimeout(() => {
            newBean.style.opacity = '0';
            setTimeout(() => {
                container.removeChild(newBean);
            }, 1000);
        }, 1000);
    }
}

// --- Event Listener for Page Load & Color Picker ---
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();

    // Add listener for the color picker
    const colorPicker = document.getElementById('background-color-picker');
    if (colorPicker) {
        colorPicker.addEventListener('input', (event) => {
            const newColor = event.target.value;
            setBackgroundColor(newColor);
            localStorage.setItem(LS_BACKGROUND_COLOR, newColor);
        });
    }
});
