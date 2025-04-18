let currentItems = []; // Holds the original list of items provided by the user
let displayedItems = []; // Holds the items currently displayed on the board
let notificationTimeout = null; // To manage hiding notifications

// --- localStorage Keys ---
const LS_BOARD_SIZE = 'beango_boardSize';
const LS_CELL_ITEMS = 'beango_cellItems'; // Original items from textarea/file
const LS_DISPLAYED_ITEMS = 'beango_displayedItems'; // Items currently shown on the board
const LS_MARKED_INDICES = 'beango_markedIndices';
const LS_CONFIG_OPEN = 'beango_configOpen'; // Changed from minimized
const LS_BACKGROUND_TYPE = 'beango_backgroundType'; // 'solid' or 'gradient'
const LS_SOLID_COLOR = 'beango_solidColor';
const LS_GRADIENT_COLOR_1 = 'beango_gradientColor1';
const LS_GRADIENT_COLOR_2 = 'beango_gradientColor2';
const LS_GRADIENT_DIRECTION = 'beango_gradientDirection';
const LS_ORIGINAL_ITEMS = 'beango_originalItems'; // User's raw input
const LS_HEADER_TYPE = 'beango_headerType'; // 'text' or 'image'
const LS_HEADER_CONTENT = 'beango_headerContent'; // Text string or Image URL
const LS_MARKED_STYLE_TYPE = 'beango_markedStyleType'; // 'color' or 'image'
const LS_MARKED_COLOR = 'beango_markedColor';
const LS_MARKED_IMAGE_URL = 'beango_markedImageUrl';
const LS_MARKED_OPACITY = 'beango_markedOpacity'; // Stored as 0-100

// --- Default Values ---
const DEFAULT_SOLID_COLOR = '#ff7e5f'; // Default to first color of gradient
const DEFAULT_GRADIENT_COLOR_1 = '#ff7e5f'; // From main page gradient
const DEFAULT_GRADIENT_COLOR_2 = '#feb47b'; // From main page gradient
const DEFAULT_GRADIENT_DIRECTION = '135deg'; // From main page gradient
const DEFAULT_HEADER_TYPE = 'text';
const DEFAULT_HEADER_TEXT = 'Beango!';
const DEFAULT_HEADER_IMAGE_URL = ''; // No default image
const DEFAULT_MARKED_STYLE_TYPE = 'color';
const DEFAULT_MARKED_COLOR = '#fde047'; // Default yellow
const DEFAULT_MARKED_IMAGE_URL = '';
const DEFAULT_MARKED_OPACITY = 80; // Default 80%

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

// --- Function to set the HTML background (solid or gradient) ---
function setBackground() {
    const backgroundType = document.querySelector('input[name="background-type"]:checked').value;
    const solidColorPicker = document.getElementById('background-color-picker');
    const gradientColor1Picker = document.getElementById('gradient-color-1');
    const gradientColor2Picker = document.getElementById('gradient-color-2');
    const gradientDirectionSelect = document.getElementById('gradient-direction');
    const htmlStyle = document.documentElement.style;
    let backgroundValue = '';

    if (backgroundType === 'solid') {
        const color = solidColorPicker.value;
        backgroundValue = color;
        htmlStyle.background = color; // Set solid color as background
        htmlStyle.backgroundRepeat = 'no-repeat';
        htmlStyle.backgroundAttachment = 'fixed';
    } else { // gradient
        const color1 = gradientColor1Picker.value;
        const color2 = gradientColor2Picker.value;
        const direction = gradientDirectionSelect.value;
        let gradientValue;
        if (direction === 'radial') {
            gradientValue = `radial-gradient(circle, ${color1}, ${color2})`;
        } else if (direction.includes('deg')) { // Handle degree values
            gradientValue = `linear-gradient(${direction}, ${color1}, ${color2})`;
        } else {
            gradientValue = `linear-gradient(${direction}, ${color1}, ${color2})`;
        }
        backgroundValue = gradientValue;
        htmlStyle.background = gradientValue;
        htmlStyle.backgroundRepeat = 'no-repeat';
        htmlStyle.backgroundAttachment = 'fixed';
    }
    htmlStyle.background = backgroundValue; // Apply the calculated background
    return backgroundValue; // Return the CSS value for injection
}

// --- Function to manage visibility of background controls ---
function toggleBackgroundControls() {
    const backgroundType = document.querySelector('input[name="background-type"]:checked').value;
    const solidSettings = document.getElementById('solid-color-settings');
    const gradientSettings = document.getElementById('gradient-color-settings');

    if (backgroundType === 'solid') {
        solidSettings.style.display = 'block';
        gradientSettings.style.display = 'none';
    } else {
        solidSettings.style.display = 'none';
        gradientSettings.style.display = 'block';
    }
}

// --- Save current background settings to localStorage ---
function saveBackgroundSettings() {
    const backgroundType = document.querySelector('input[name="background-type"]:checked').value;
    localStorage.setItem(LS_BACKGROUND_TYPE, backgroundType);

    if (backgroundType === 'solid') {
        localStorage.setItem(LS_SOLID_COLOR, document.getElementById('background-color-picker').value);
        // Optionally remove gradient keys to keep localStorage clean
        localStorage.removeItem(LS_GRADIENT_COLOR_1);
        localStorage.removeItem(LS_GRADIENT_COLOR_2);
        localStorage.removeItem(LS_GRADIENT_DIRECTION);
    } else {
        localStorage.setItem(LS_GRADIENT_COLOR_1, document.getElementById('gradient-color-1').value);
        localStorage.setItem(LS_GRADIENT_COLOR_2, document.getElementById('gradient-color-2').value);
        localStorage.setItem(LS_GRADIENT_DIRECTION, document.getElementById('gradient-direction').value);
        // Optionally remove solid key
        localStorage.removeItem(LS_SOLID_COLOR);
    }
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

// --- Save current marked style settings to localStorage ---
function saveMarkedStyleSettings() {
    const styleType = document.querySelector('input[name="marked-style-type"]:checked').value;
    localStorage.setItem(LS_MARKED_STYLE_TYPE, styleType);

    if (styleType === 'color') {
        localStorage.setItem(LS_MARKED_COLOR, document.getElementById('marked-color-picker').value);
        // Optionally remove image URL if switching to color
        // localStorage.removeItem(LS_MARKED_IMAGE_URL);
    } else { // image
        localStorage.setItem(LS_MARKED_IMAGE_URL, document.getElementById('marked-image-url-input').value);
        // Optionally remove color if switching to image
        // localStorage.removeItem(LS_MARKED_COLOR);
    }
    // Always save opacity
    let opacity = parseInt(document.getElementById('marked-opacity-input').value, 10);
    if (isNaN(opacity) || opacity < 0) opacity = 0;
    if (opacity > 100) opacity = 100;
    localStorage.setItem(LS_MARKED_OPACITY, opacity);
}

// --- Function to manage visibility of marked style controls ---
function toggleMarkedStyleInputs() {
    const styleType = document.querySelector('input[name="marked-style-type"]:checked').value;
    const colorSettings = document.getElementById('marked-color-settings');
    const imageSettings = document.getElementById('marked-image-settings');

    if (styleType === 'color') {
        colorSettings.style.display = 'block';
        imageSettings.style.display = 'none';
    } else { // image
        colorSettings.style.display = 'none';
        imageSettings.style.display = 'block';
    }
    // Opacity input is always visible
}

// --- Apply saved marked styles to a cell ---
function applyMarkedCellStyle(cell) {
    if (!cell) return;

    const isMarked = cell.classList.contains('marked');
    const styleType = localStorage.getItem(LS_MARKED_STYLE_TYPE) || DEFAULT_MARKED_STYLE_TYPE;
    const opacityValue = (parseInt(localStorage.getItem(LS_MARKED_OPACITY), 10) || DEFAULT_MARKED_OPACITY) / 100;

    // Reset styles first
    cell.style.backgroundColor = ''; // Use CSS default
    cell.style.backgroundImage = '';
    cell.style.backgroundSize = '';
    cell.style.backgroundPosition = '';
    cell.style.backgroundRepeat = '';
    cell.style.opacity = ''; // Use CSS default

    if (isMarked) {
        cell.style.opacity = opacityValue;

        if (styleType === 'color') {
            const color = localStorage.getItem(LS_MARKED_COLOR) || DEFAULT_MARKED_COLOR;
            cell.style.backgroundColor = color;
        } else { // image
            const imageUrl = localStorage.getItem(LS_MARKED_IMAGE_URL) || DEFAULT_MARKED_IMAGE_URL;
            if (imageUrl) {
                cell.style.backgroundImage = `url('${imageUrl}')`;
                cell.style.backgroundSize = 'cover'; // Or 'contain', 'auto', etc.
                cell.style.backgroundPosition = 'center center';
                cell.style.backgroundRepeat = 'no-repeat';
                // Set a fallback background color in case the image fails to load or is transparent
                cell.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // Slightly visible white
            } else {
                // Fallback to default color if image URL is empty
                cell.style.backgroundColor = DEFAULT_MARKED_COLOR;
            }
        }
    } else {
        // If unmarked, ensure all styles are fully reset (already done above)
    }
}

// --- Re-apply styles to all currently marked cells ---
function refreshMarkedCellStyles() {
    const markedCells = document.querySelectorAll('#bingo-board .bingo-cell.marked');
    markedCells.forEach(cell => {
        applyMarkedCellStyle(cell); // Re-apply based on current settings
    });
}

// Helper to save board state
function saveBoardState() {
    const sizeInput = document.getElementById('board-size');
    const size = sizeInput ? parseInt(sizeInput.value, 10) : 5; // Default to 5 if input missing
    const markedIndices = getMarkedIndices();
    const originalUserItems = getItemsFromInput(); // Get current text from textarea

    localStorage.setItem(LS_BOARD_SIZE, size);
    localStorage.setItem(LS_CELL_ITEMS, JSON.stringify(currentItems)); // Save items potentially on board (padded/sliced)
    localStorage.setItem(LS_DISPLAYED_ITEMS, JSON.stringify(displayedItems)); // Save displayed items
    localStorage.setItem(LS_MARKED_INDICES, JSON.stringify(markedIndices));
    localStorage.setItem(LS_ORIGINAL_ITEMS, JSON.stringify(originalUserItems)); // Save user's raw input from textarea
    saveBackgroundSettings(); // Save background settings from inputs
    saveHeaderSettings(); // Save header settings from inputs
    saveMarkedStyleSettings(); // Save marked cell style settings
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
    const originalUserItems = getItemsFromInput();
    // localStorage.setItem(LS_ORIGINAL_ITEMS, JSON.stringify(originalUserItems)); // Moved to saveBoardState

    const requiredItems = size * size;
    let itemsForBoard = [...originalUserItems]; // Start with a copy of the user's raw input
    let notificationMessage = 'Board generated successfully!';
    let notificationType = 'success';

    if (itemsForBoard.length < requiredItems) {
        const diff = requiredItems - itemsForBoard.length;
        notificationMessage = `Warning: Needed ${requiredItems} items, found ${itemsForBoard.length}. Padding with ${diff} placeholder(s).`;
        notificationType = 'warning';
        for (let i = 0; i < diff; i++) {
            itemsForBoard.push(`Placeholder ${i+1}`);
        }
        // currentItems will now hold the padded list for the board
        currentItems = [...itemsForBoard];
    } else if (itemsForBoard.length > requiredItems) {
        notificationMessage = `Info: Found ${itemsForBoard.length} items, randomly selecting ${requiredItems}.`;
        notificationType = 'info';
        itemsForBoard = shuffleArray(itemsForBoard).slice(0, requiredItems);
        // currentItems will now hold the selected subset for the board
        currentItems = [...itemsForBoard];
    } else {
        // If exact number, currentItems are the same as originalUserItems
        currentItems = [...originalUserItems];
    }

    // Save the items that are actually available for the board (potentially padded/sliced)
    // localStorage.setItem(LS_CELL_ITEMS, JSON.stringify(currentItems)); // Moved to saveBoardState

    // Shuffle the items specifically for display (use currentItems which has the right size)
    displayedItems = shuffleArray([...currentItems]);

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

    clearMarks(false); // Clear previous marks visually AND their styles, but don't save yet
    equalizeCellSizes(); // Add this call
    // saveBoardState(); // REMOVED first call - Save the newly generated board state (size, items, displayed, marks)

    // Explicitly save background settings before reload - NO, save everything together
    // saveBackgroundSettings();

    // Get the new background value and inject a style override before reload
    const newBackgroundValue = setBackground(); // Apply and get value
    let overrideStyle = document.getElementById('background-override-style');
    if (!overrideStyle) {
        overrideStyle = document.createElement('style');
        overrideStyle.id = 'background-override-style';
        document.head.appendChild(overrideStyle);
    }
    // Use !important to try and force application during reload flash
    overrideStyle.textContent = `html { background: ${newBackgroundValue} !important; background-repeat: no-repeat !important; background-attachment: fixed !important; }`;

    showNotification(notificationMessage, notificationType);

    // *** Save the complete final state just before reload ***
    saveBoardState(); // Includes size, items, displayed, marks, original items, background, header, marked style

    // Reload the page to ensure correct rendering based on saved state
    location.reload();

    // Reset global variables
    currentItems = [];
    displayedItems = [];

    // Reset form inputs
    document.getElementById('board-size').value = 5; // Default size
    document.getElementById('cell-contents').value = '';
    document.getElementById('file-input').value = ''; // Clear file input

    // Reset background inputs to defaults
    document.querySelector('input[name="background-type"][value="gradient"]').checked = true; // Default to gradient
    document.getElementById('background-color-picker').value = DEFAULT_SOLID_COLOR;
    document.getElementById('gradient-color-1').value = DEFAULT_GRADIENT_COLOR_1;
    document.getElementById('gradient-color-2').value = DEFAULT_GRADIENT_COLOR_2;
    document.getElementById('gradient-direction').value = DEFAULT_GRADIENT_DIRECTION;
    toggleBackgroundControls(); // Ensure correct controls are visible

    // Reset header inputs to defaults
    document.querySelector('input[name="header-type"][value="text"]').checked = true;
    document.getElementById('header-text-input').value = DEFAULT_HEADER_TEXT;
    document.getElementById('header-image-url-input').value = DEFAULT_HEADER_IMAGE_URL;
    toggleHeaderInputs(); // Ensure correct header inputs are visible
    updateHeaderDisplay(); // Apply default header display

    // Reset marked style inputs to defaults
    document.querySelector('input[name="marked-style-type"][value="color"]').checked = true;
    document.getElementById('marked-color-picker').value = DEFAULT_MARKED_COLOR;
    document.getElementById('marked-image-url-input').value = DEFAULT_MARKED_IMAGE_URL;
    document.getElementById('marked-opacity-input').value = DEFAULT_MARKED_OPACITY;
    toggleMarkedStyleInputs(); // Ensure correct marked style inputs are visible
    refreshMarkedCellStyles(); // Apply default styles (which is none, effectively)

    // Clear the board display
    const boardHeader = document.getElementById('board-header');
    if (boardHeader) boardHeader.style.maxWidth = '';

    setBackground(); // Apply default background
    showNotification('Settings and board reset.', 'success');
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
    applyMarkedCellStyle(cell);   // Apply/remove styles based on new state and settings
    saveBoardState(); // Save updated marks immediately after click
}

function clearMarks(save = true) {
    const cells = document.querySelectorAll('#bingo-board .bingo-cell');
    cells.forEach(cell => {
        if (cell.classList.contains('marked')) {
            cell.classList.remove('marked');
            applyMarkedCellStyle(cell); // Reset styles for this cell
        }
        // Ensure styles are reset even if class was somehow missing
        applyMarkedCellStyle(cell);
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
    // Clear localStorage relevant ONLY to the board structure/content
    localStorage.removeItem(LS_BOARD_SIZE);
    localStorage.removeItem(LS_CELL_ITEMS); // The items configured for the board (padded/sliced)
    localStorage.removeItem(LS_DISPLAYED_ITEMS); // The current layout
    localStorage.removeItem(LS_MARKED_INDICES);
    localStorage.removeItem(LS_ORIGINAL_ITEMS); // User's raw input

    // DO NOT clear these:
    // localStorage.removeItem(LS_CONFIG_OPEN);
    // localStorage.removeItem(LS_BACKGROUND_TYPE);
    // localStorage.removeItem(LS_SOLID_COLOR);
    // localStorage.removeItem(LS_GRADIENT_COLOR_1);
    // localStorage.removeItem(LS_GRADIENT_COLOR_2);
    // localStorage.removeItem(LS_GRADIENT_DIRECTION);
    // localStorage.removeItem(LS_HEADER_TYPE);
    // localStorage.removeItem(LS_HEADER_CONTENT);
    // localStorage.removeItem(LS_MARKED_STYLE_TYPE);
    // localStorage.removeItem(LS_MARKED_COLOR);
    // localStorage.removeItem(LS_MARKED_IMAGE_URL);
    // localStorage.removeItem(LS_MARKED_OPACITY);

    // Reset global variables for board content
    currentItems = [];
    displayedItems = [];

    // Reset ONLY board-related form inputs
    document.getElementById('board-size').value = 5; // Default size
    document.getElementById('cell-contents').value = '';
    document.getElementById('file-input').value = ''; // Clear file input

    // DO NOT reset background inputs
    // DO NOT reset header inputs
    // DO NOT reset marked style inputs

    // Clear the board display
    const board = document.getElementById('bingo-board');
    board.innerHTML = '<div class="bingo-cell">Board Reset. Generate a new board!</div>';
    board.style.gridTemplateColumns = ''; // Clear grid style
    board.style.gridAutoRows = ''; // Also clear gridAutoRows

    // Reset container width to default
    const boardContainer = document.getElementById('bingo-board-container');
    const boardHeader = document.getElementById('board-header');
    if (boardContainer) boardContainer.style.maxWidth = ''; // Let it resize naturally or via equalize
    if (boardHeader) boardHeader.style.maxWidth = ''; // Let it resize naturally or via equalize
    // Call equalize after potentially changing board content/size
    equalizeCellSizes();

    // DO NOT reset background - keep current style
    // setBackground();
    // DO NOT reset header display - keep current style
    // updateHeaderDisplay();
    // DO NOT refresh marked styles - keep current style
    // refreshMarkedCellStyles();

    showNotification('Board settings reset. Generate a new board to apply.', 'success');
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
    const savedOriginalItemsText = localStorage.getItem(LS_ORIGINAL_ITEMS);
    const savedHeaderType = localStorage.getItem(LS_HEADER_TYPE) || DEFAULT_HEADER_TYPE;
    const savedHeaderContent = localStorage.getItem(LS_HEADER_CONTENT) || (savedHeaderType === 'text' ? DEFAULT_HEADER_TEXT : DEFAULT_HEADER_IMAGE_URL);
    const savedMarkedStyleType = localStorage.getItem(LS_MARKED_STYLE_TYPE) || DEFAULT_MARKED_STYLE_TYPE;
    const savedMarkedColor = localStorage.getItem(LS_MARKED_COLOR) || DEFAULT_MARKED_COLOR;
    const savedMarkedImageUrl = localStorage.getItem(LS_MARKED_IMAGE_URL) || DEFAULT_MARKED_IMAGE_URL;
    const savedMarkedOpacity = localStorage.getItem(LS_MARKED_OPACITY) || DEFAULT_MARKED_OPACITY;

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
                // Apply dynamic styles AFTER adding the class
                applyMarkedCellStyle(cell);
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

    // --- Restore Background Settings ---
    const savedBackgroundType = localStorage.getItem(LS_BACKGROUND_TYPE) || 'gradient'; // Default to gradient
    const savedSolidColor = localStorage.getItem(LS_SOLID_COLOR) || DEFAULT_SOLID_COLOR;
    const savedGradientColor1 = localStorage.getItem(LS_GRADIENT_COLOR_1) || DEFAULT_GRADIENT_COLOR_1;
    const savedGradientColor2 = localStorage.getItem(LS_GRADIENT_COLOR_2) || DEFAULT_GRADIENT_COLOR_2;
    const savedGradientDirection = localStorage.getItem(LS_GRADIENT_DIRECTION) || DEFAULT_GRADIENT_DIRECTION;

    // Set radio button
    document.querySelector(`input[name="background-type"][value="${savedBackgroundType}"]`).checked = true;

    // Set input values
    document.getElementById('background-color-picker').value = savedSolidColor;
    document.getElementById('gradient-color-1').value = savedGradientColor1;
    document.getElementById('gradient-color-2').value = savedGradientColor2;
    document.getElementById('gradient-direction').value = savedGradientDirection;

    // Show/hide controls and apply background
    toggleBackgroundControls();
    setBackground();
    // --- End Restore Background Settings ---

    // --- Restore Header Settings ---
    document.querySelector(`input[name="header-type"][value="${savedHeaderType}"]`).checked = true;
    if (savedHeaderType === 'text') {
        document.getElementById('header-text-input').value = savedHeaderContent;
    } else {
        document.getElementById('header-image-url-input').value = savedHeaderContent;
    }
    toggleHeaderInputs(); // Show/hide the correct input fields
    updateHeaderDisplay(); // Apply the loaded header
    // --- End Restore Header Settings ---

    // --- Restore Marked Style Settings ---
    document.querySelector(`input[name="marked-style-type"][value="${savedMarkedStyleType}"]`).checked = true;
    document.getElementById('marked-color-picker').value = savedMarkedColor;
    document.getElementById('marked-image-url-input').value = savedMarkedImageUrl;
    document.getElementById('marked-opacity-input').value = savedMarkedOpacity;
    toggleMarkedStyleInputs(); // Show/hide correct inputs
    // Styles are applied during board creation loop above
    // --- End Restore Marked Style Settings ---

    // Restore the textarea with the original user input if available
    if (savedOriginalItemsText) {
        try {
            const originalItems = JSON.parse(savedOriginalItemsText);
            document.getElementById('cell-contents').value = originalItems.join('\n');
        } catch (e) {
            showNotification('Error parsing saved original items.', 'error');
            localStorage.removeItem(LS_ORIGINAL_ITEMS);
             // Fallback to cell items if original fails
             if (savedItemsText) {
                 try {
                     document.getElementById('cell-contents').value = JSON.parse(savedItemsText).join('\n');
                 } catch { /* ignore inner error */ }
             }
        }
    } else if (savedItemsText) {
         // If no original items saved, use the cell items as fallback for textarea
         try {
              document.getElementById('cell-contents').value = JSON.parse(savedItemsText).join('\n');
         } catch (e) {
             // Already handled loading currentItems above, just ensure textarea is cleared on error
             document.getElementById('cell-contents').value = '';
         }
    }

    // Update container width based on loaded size - REMOVED
    // updateBoardContainerMaxWidth(size);
    // updateBoardContainerMaxWidth(size, '#board-header');
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

// --- Consolidated Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Load state first thing
    loadFromLocalStorage();

    // --- Add Event Listeners for Background Controls ---
    document.querySelectorAll('input[name="background-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            toggleBackgroundControls();
            setBackground();
            saveBackgroundSettings();
        });
    });
    document.getElementById('background-color-picker').addEventListener('input', () => {
        setBackground();
        saveBackgroundSettings();
    });
    document.getElementById('gradient-color-1').addEventListener('input', () => {
        setBackground();
        saveBackgroundSettings();
    });
    document.getElementById('gradient-color-2').addEventListener('input', () => {
        setBackground();
        saveBackgroundSettings();
    });
    document.getElementById('gradient-direction').addEventListener('change', () => {
        setBackground();
        saveBackgroundSettings();
    });

    // --- Add Event Listeners for Header Controls ---
    document.querySelectorAll('input[name="header-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            toggleHeaderInputs();
            saveHeaderSettings();       // Save the new type first
            updateHeaderDisplay(); // Then update display from saved state
        });
    });
    document.getElementById('header-text-input').addEventListener('input', () => {
        saveHeaderSettings();       // Save the new text first
        updateHeaderDisplay(); // Then update display from saved state
    });
    document.getElementById('header-image-url-input').addEventListener('input', () => {
        saveHeaderSettings();       // Save the new URL first
        updateHeaderDisplay(); // Then update display from saved state
    });

    // --- Add Event Listeners for Marked Style Controls ---
    document.querySelectorAll('input[name="marked-style-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            toggleMarkedStyleInputs();
            saveMarkedStyleSettings(); // Save the new setting
            refreshMarkedCellStyles(); // Update existing marked cells
        });
    });
    document.getElementById('marked-color-picker').addEventListener('input', () => {
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById('marked-image-url-input').addEventListener('input', () => {
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById('marked-opacity-input').addEventListener('input', () => {
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });

    // --- Other Listeners ---
    window.addEventListener('resize', equalizeCellSizes);
    equalizeCellSizes(); // Initial call after load
});

// --- Save current header settings to localStorage ---
function saveHeaderSettings() {
    const headerType = document.querySelector('input[name="header-type"]:checked').value;
    localStorage.setItem(LS_HEADER_TYPE, headerType);

    if (headerType === 'text') {
        localStorage.setItem(LS_HEADER_CONTENT, document.getElementById('header-text-input').value);
    } else { // image
        localStorage.setItem(LS_HEADER_CONTENT, document.getElementById('header-image-url-input').value);
    }
}

// --- Function to manage visibility of header controls ---
function toggleHeaderInputs() {
    const headerType = document.querySelector('input[name="header-type"]:checked').value;
    const textSettings = document.getElementById('header-text-settings');
    const imageSettings = document.getElementById('header-image-settings');

    if (headerType === 'text') {
        textSettings.style.display = 'block';
        imageSettings.style.display = 'none';
    } else { // image
        textSettings.style.display = 'none';
        imageSettings.style.display = 'block';
    }
}

// --- Function to update the header display ---
function updateHeaderDisplay() {
    const headerType = localStorage.getItem(LS_HEADER_TYPE) || DEFAULT_HEADER_TYPE;
    const headerContent = localStorage.getItem(LS_HEADER_CONTENT) || (headerType === 'text' ? DEFAULT_HEADER_TEXT : DEFAULT_HEADER_IMAGE_URL);
    const headerContainer = document.getElementById('custom-header-content');

    if (!headerContainer) return;

    // Clear existing content
    headerContainer.innerHTML = '';

    if (headerType === 'text') {
        // Create H1 for text
        const h1 = document.createElement('h1');
        h1.className = 'text-4xl font-bold text-green-800';
        h1.textContent = headerContent || DEFAULT_HEADER_TEXT; // Fallback to default text
        headerContainer.appendChild(h1);

        // Create and add bean image
        const img = document.createElement('img');
        img.id = 'bean';
        img.src = '../bean.svg';
        img.alt = 'Bean';
        img.className = 'w-16 h-16 cursor-pointer'; // Updated class for size
        img.onclick = explodeBeans;
        headerContainer.appendChild(img);
    } else { // image
        if (headerContent) {
            // Create img for custom image URL
            const img = document.createElement('img');
            img.src = headerContent;
            img.alt = 'Custom Header Image';
            // Add some basic styling for the custom image - adjust as needed
            img.className = 'max-h-20 max-w-full object-contain'; // Limit height, allow natural width up to container
            img.onerror = () => { // Handle broken image links
                headerContainer.innerHTML = ''; // Clear the broken image attempt
                const errorText = document.createElement('p');
                errorText.textContent = 'Could not load header image.';
                errorText.className = 'text-red-500 text-sm';
                headerContainer.appendChild(errorText);
                 // Optionally revert to default text header on error
                 // localStorage.setItem(LS_HEADER_TYPE, DEFAULT_HEADER_TYPE);
                 // localStorage.setItem(LS_HEADER_CONTENT, DEFAULT_HEADER_TEXT);
                 // updateHeaderDisplay();
            };
            headerContainer.appendChild(img);
        } else {
             // If image type is selected but URL is empty, show default text header
            const h1 = document.createElement('h1');
            h1.className = 'text-4xl font-bold text-green-800';
            h1.textContent = DEFAULT_HEADER_TEXT;
            headerContainer.appendChild(h1);
            const beanImg = document.createElement('img');
            beanImg.id = 'bean';
            beanImg.src = '../bean.svg';
            beanImg.alt = 'Bean';
            beanImg.className = 'w-16 h-16 cursor-pointer';
            beanImg.onclick = explodeBeans;
            headerContainer.appendChild(beanImg);
        }
    }
}
