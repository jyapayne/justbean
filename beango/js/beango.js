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
const LS_SOLID_COLOR_OPACITY = 'beango_solidColorOpacity'; // New
const LS_GRADIENT_COLOR_1 = 'beango_gradientColor1';
const LS_GRADIENT_COLOR_1_OPACITY = 'beango_gradientColor1Opacity'; // New
const LS_GRADIENT_COLOR_2 = 'beango_gradientColor2';
const LS_GRADIENT_COLOR_2_OPACITY = 'beango_gradientColor2Opacity'; // New
const LS_GRADIENT_DIRECTION = 'beango_gradientDirection';
const LS_ORIGINAL_ITEMS = 'beango_originalItems'; // User's raw input
const LS_HEADER_TEXT = 'beango_headerText';
const LS_HEADER_IMAGE_URL = 'beango_headerImageUrl';
const LS_HEADER_TEXT_COLOR = 'beango_headerTextColor';
const LS_HEADER_TEXT_COLOR_OPACITY = 'beango_headerTextColorOpacity'; // New
const LS_HEADER_BG_COLOR = 'beango_headerBgColor';
const LS_HEADER_BG_OPACITY = 'beango_headerBgOpacity';
const LS_MARKED_COLOR = 'beango_markedColor';
const LS_MARKED_COLOR_OPACITY = 'beango_markedColorOpacity'; // New (replaces LS_MARKED_OPACITY)
const LS_MARKED_IMAGE_URL = 'beango_markedImageUrl';
const LS_MARKED_IMAGE_OPACITY = 'beango_markedImageOpacity'; // New
const LS_CELL_BORDER_COLOR = 'beango_cellBorderColor';
const LS_CELL_BORDER_OPACITY = 'beango_cellBorderOpacity'; // New
const LS_CELL_BG_COLOR = 'beango_cellBgColor';
const LS_CELL_BG_OPACITY = 'beango_cellBgOpacity'; // New
const LS_CELL_BG_IMAGE_URL = 'beango_cellBgImageUrl';
const LS_CELL_BG_IMAGE_OPACITY = 'beango_cellBgImageOpacity'; // New
const LS_CELL_TEXT_COLOR = 'beango_cellTextColor';
const LS_CELL_TEXT_OPACITY = 'beango_cellTextOpacity';
const LS_CELL_OUTLINE_COLOR = 'beango_cellOutlineColor';
const LS_CELL_OUTLINE_OPACITY = 'beango_cellOutlineOpacity';
const LS_CELL_OUTLINE_WIDTH = 'beango_cellOutlineWidth';
const LS_MARKED_BORDER_COLOR = 'beango_markedBorderColor';
const LS_MARKED_BORDER_OPACITY = 'beango_markedBorderOpacity'; // New
const LS_BOARD_BG_COLOR = 'beango_boardBgColor';
const LS_BOARD_BG_COLOR_OPACITY = 'beango_boardBgColorOpacity'; // New (replaces LS_BOARD_BG_OPACITY)
const LS_BOARD_BG_IMAGE_URL = 'beango_boardBgImageUrl';
const LS_MARKED_CELL_TEXT_COLOR = 'beango_markedCellTextColor';
const LS_MARKED_CELL_TEXT_OPACITY = 'beango_markedCellTextOpacity';
const LS_MARKED_CELL_OUTLINE_COLOR = 'beango_markedCellOutlineColor';
const LS_MARKED_CELL_OUTLINE_OPACITY = 'beango_markedCellOutlineOpacity';
const LS_MARKED_CELL_OUTLINE_WIDTH = 'beango_markedCellOutlineWidth';

// --- Default Values ---
const DEFAULT_SOLID_COLOR = '#ff7e5f'; // Default to first color of gradient
const DEFAULT_SOLID_COLOR_OPACITY = 100; // New
const DEFAULT_GRADIENT_COLOR_1 = '#ff7e5f'; // From main page gradient
const DEFAULT_GRADIENT_COLOR_1_OPACITY = 100; // New
const DEFAULT_GRADIENT_COLOR_2 = '#feb47b'; // From main page gradient
const DEFAULT_GRADIENT_COLOR_2_OPACITY = 100; // New
const DEFAULT_GRADIENT_DIRECTION = '135deg'; // From main page gradient
const DEFAULT_HEADER_TEXT = 'Beango!'; // REVERTED default back to Beango!
const DEFAULT_HEADER_IMAGE_URL = ''; // No default image
const DEFAULT_HEADER_TEXT_COLOR = '#15803d'; // Tailwind green-700 (approx)
const DEFAULT_HEADER_TEXT_COLOR_OPACITY = 100; // New
const DEFAULT_HEADER_BG_COLOR = '#ffffff';
const DEFAULT_HEADER_BG_OPACITY = 100;
const DEFAULT_MARKED_COLOR = '#fde047'; // Default yellow
const DEFAULT_MARKED_COLOR_OPACITY = 80; // New (replaces DEFAULT_MARKED_OPACITY)
const DEFAULT_MARKED_IMAGE_URL = '';
const DEFAULT_MARKED_IMAGE_OPACITY = 100; // New
const DEFAULT_CELL_BORDER_COLOR = '#8B4513'; // Default brown
const DEFAULT_CELL_BORDER_OPACITY = 100; // New
const DEFAULT_CELL_BG_COLOR = '#F5F5DC'; // Default beige
const DEFAULT_CELL_BG_OPACITY = 100; // New
const DEFAULT_CELL_BG_IMAGE_URL = ''; // Default no image
const DEFAULT_CELL_BG_IMAGE_OPACITY = 100; // New
const DEFAULT_CELL_TEXT_COLOR = '#000000';
const DEFAULT_CELL_TEXT_OPACITY = 100;
const DEFAULT_CELL_OUTLINE_COLOR = '#ffffff';
const DEFAULT_CELL_OUTLINE_OPACITY = 100;
const DEFAULT_CELL_OUTLINE_WIDTH = 1; // Default 1px
const DEFAULT_MARKED_BORDER_COLOR = '#ca8a04'; // Default darker yellow/orange (Tailwind yellow-600)
const DEFAULT_MARKED_BORDER_OPACITY = 100; // New
const DEFAULT_BOARD_BG_COLOR = '#ffffff'; // Default white
const DEFAULT_BOARD_BG_COLOR_OPACITY = 100; // New (replaces DEFAULT_BOARD_BG_OPACITY)
const DEFAULT_BOARD_BG_IMAGE_URL = ''; // Default no image
const DEFAULT_MARKED_CELL_TEXT_COLOR = '#000000';
const DEFAULT_MARKED_CELL_TEXT_OPACITY = 100;
const DEFAULT_MARKED_CELL_OUTLINE_COLOR = '#ffffff';
const DEFAULT_MARKED_CELL_OUTLINE_OPACITY = 100;
const DEFAULT_MARKED_CELL_OUTLINE_WIDTH = 1; // Default 1px (no outline for marked)

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

// --- Helper Function ---
function hexToRgba(hex, opacityPercent = 100) {
    // Ensure opacityPercent is a number before using it
    let numericOpacity = parseInt(opacityPercent, 10); // Try parsing
    // If parsing failed (e.g., input was not a number string) or input was null/undefined, default to 100
    if (isNaN(numericOpacity)) {
        numericOpacity = 100;
    }

    // Remove hash if it exists
    hex = hex.replace('#', '');

    // Handle short hex codes
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // Ensure hex is 6 digits
    if (hex.length !== 6) {
        console.warn(`Invalid hex color: ${hex}. Using fallback.`);
        hex = '000000'; // Default to black on error
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Clamp and normalize opacity using the correctly parsed/defaulted value
    const clampedOpacityPercent = Math.max(0, Math.min(100, numericOpacity));
    const opacity = clampedOpacityPercent / 100;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
        const opacity = parseInt(document.getElementById('background-color-opacity-slider').value, 10);
        backgroundValue = hexToRgba(color, opacity);
        htmlStyle.background = backgroundValue; // Set solid color as background
        htmlStyle.backgroundRepeat = 'no-repeat';
        htmlStyle.backgroundAttachment = 'fixed';
    } else { // gradient
        const color1 = gradientColor1Picker.value;
        const opacity1 = parseInt(document.getElementById('gradient-color-1-opacity-slider').value, 10);
        const color2 = gradientColor2Picker.value;
        const opacity2 = parseInt(document.getElementById('gradient-color-2-opacity-slider').value, 10);
        const direction = gradientDirectionSelect.value;

        const rgba1 = hexToRgba(color1, opacity1);
        const rgba2 = hexToRgba(color2, opacity2);

        let gradientValue;
        if (direction === 'radial') {
            gradientValue = `radial-gradient(circle, ${rgba1}, ${rgba2})`;
        } else { // Handles 'deg' and direction keywords
            gradientValue = `linear-gradient(${direction}, ${rgba1}, ${rgba2})`;
        }
        backgroundValue = gradientValue;
        htmlStyle.background = gradientValue;
        htmlStyle.backgroundRepeat = 'no-repeat';
        htmlStyle.backgroundAttachment = 'fixed';
    }
    // htmlStyle.background = backgroundValue; // Already set inside if/else
    return backgroundValue; // Return the CSS value for injection (might need adjustment?)
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
        localStorage.setItem(LS_SOLID_COLOR_OPACITY, document.getElementById('background-color-opacity-slider').value);
        // Optionally remove gradient keys
        localStorage.removeItem(LS_GRADIENT_COLOR_1);
        localStorage.removeItem(LS_GRADIENT_COLOR_1_OPACITY);
        localStorage.removeItem(LS_GRADIENT_COLOR_2);
        localStorage.removeItem(LS_GRADIENT_COLOR_2_OPACITY);
        localStorage.removeItem(LS_GRADIENT_DIRECTION);
    } else {
        localStorage.setItem(LS_GRADIENT_COLOR_1, document.getElementById('gradient-color-1').value);
        localStorage.setItem(LS_GRADIENT_COLOR_1_OPACITY, document.getElementById('gradient-color-1-opacity-slider').value);
        localStorage.setItem(LS_GRADIENT_COLOR_2, document.getElementById('gradient-color-2').value);
        localStorage.setItem(LS_GRADIENT_COLOR_2_OPACITY, document.getElementById('gradient-color-2-opacity-slider').value);
        localStorage.setItem(LS_GRADIENT_DIRECTION, document.getElementById('gradient-direction').value);
        // Optionally remove solid key
        localStorage.removeItem(LS_SOLID_COLOR);
        localStorage.removeItem(LS_SOLID_COLOR_OPACITY);
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
    localStorage.setItem(LS_MARKED_COLOR, document.getElementById('marked-color-picker').value);
    localStorage.setItem(LS_MARKED_COLOR_OPACITY, document.getElementById('marked-color-opacity-slider').value);
    localStorage.setItem(LS_MARKED_IMAGE_URL, document.getElementById('marked-image-url-input').value);
    localStorage.setItem(LS_MARKED_IMAGE_OPACITY, document.getElementById('marked-image-opacity-slider').value); // Save image opacity

    // Save marked border color and its opacity
    localStorage.setItem(LS_MARKED_BORDER_COLOR, document.getElementById('marked-border-color-picker').value);
    localStorage.setItem(LS_MARKED_BORDER_OPACITY, document.getElementById('marked-border-opacity-slider').value);

    // Save marked text styles
    localStorage.setItem(LS_MARKED_CELL_TEXT_COLOR, document.getElementById('marked-cell-text-color-picker').value);
    localStorage.setItem(LS_MARKED_CELL_TEXT_OPACITY, document.getElementById('marked-cell-text-opacity-slider').value);
    localStorage.setItem(LS_MARKED_CELL_OUTLINE_COLOR, document.getElementById('marked-cell-outline-color-picker').value);
    localStorage.setItem(LS_MARKED_CELL_OUTLINE_OPACITY, document.getElementById('marked-cell-outline-opacity-slider').value);
    localStorage.setItem(LS_MARKED_CELL_OUTLINE_WIDTH, document.getElementById('marked-cell-outline-width-input').value);
}

// --- Apply saved marked styles to a cell ---
function applyMarkedCellStyle(cell) {
    if (!cell) return;

    const isMarked = cell.classList.contains('marked');
    const color = localStorage.getItem(LS_MARKED_COLOR) || DEFAULT_MARKED_COLOR;
    const colorOpacity = parseInt(localStorage.getItem(LS_MARKED_COLOR_OPACITY) || DEFAULT_MARKED_COLOR_OPACITY, 10);
    const imageUrl = localStorage.getItem(LS_MARKED_IMAGE_URL) || DEFAULT_MARKED_IMAGE_URL;
    const imageOpacity = parseInt(localStorage.getItem(LS_MARKED_IMAGE_OPACITY) || DEFAULT_MARKED_IMAGE_OPACITY, 10);
    const borderColor = localStorage.getItem(LS_MARKED_BORDER_COLOR) || DEFAULT_MARKED_BORDER_COLOR;
    const borderOpacity = parseInt(localStorage.getItem(LS_MARKED_BORDER_OPACITY) || DEFAULT_MARKED_BORDER_OPACITY, 10);

    // Reset potentially conflicting styles before applying new ones
    cell.style.backgroundColor = '';
    cell.style.backgroundImage = '';
    // Don't reset border color here, let applyCellStyle handle default if unmarked

    if (isMarked) {
        // Apply marked border color + opacity
        cell.style.borderColor = hexToRgba(borderColor, borderOpacity);

        // Always apply the background color + opacity
        cell.style.backgroundColor = hexToRgba(color, colorOpacity);

        // Apply background image if URL exists via custom property
        if (imageUrl && imageUrl.trim() !== '') {
            cell.style.setProperty('--bg-image-url', `url('${imageUrl}')`);
            cell.style.setProperty('--bg-image-opacity', imageOpacity / 100);
            cell.style.backgroundSize = 'cover';
            cell.style.backgroundPosition = 'center center';
            cell.style.backgroundRepeat = 'no-repeat';
        } else {
            // Explicitly clear background image custom property
            cell.style.removeProperty('--bg-image-url');
        }

        // Apply marked text styles
        const textSpan = cell.querySelector('.bingo-cell-text');
        if (textSpan) {
            const textColor = localStorage.getItem(LS_MARKED_CELL_TEXT_COLOR) || DEFAULT_MARKED_CELL_TEXT_COLOR;
            const textOpacity = parseInt(localStorage.getItem(LS_MARKED_CELL_TEXT_OPACITY) || DEFAULT_MARKED_CELL_TEXT_OPACITY, 10);
            const outlineColor = localStorage.getItem(LS_MARKED_CELL_OUTLINE_COLOR) || DEFAULT_MARKED_CELL_OUTLINE_COLOR;
            const outlineOpacity = parseInt(localStorage.getItem(LS_MARKED_CELL_OUTLINE_OPACITY) || DEFAULT_MARKED_CELL_OUTLINE_OPACITY, 10);
            let outlineWidth = parseFloat(localStorage.getItem(LS_MARKED_CELL_OUTLINE_WIDTH));
            // Default check: // Add log before default check
            if (isNaN(outlineWidth) || outlineWidth < 0) {
                outlineWidth = DEFAULT_MARKED_CELL_OUTLINE_WIDTH;
            }

            const rgbaTextColor = hexToRgba(textColor, textOpacity);
            textSpan.style.color = rgbaTextColor; // Override default style

            if (outlineWidth > 0) {
                const rgbaOutlineColor = hexToRgba(outlineColor, outlineOpacity);
                const shadow = `
                    -${outlineWidth}px -${outlineWidth}px 0 ${rgbaOutlineColor},
                     ${outlineWidth}px -${outlineWidth}px 0 ${rgbaOutlineColor},
                    -${outlineWidth}px  ${outlineWidth}px 0 ${rgbaOutlineColor},
                     ${outlineWidth}px  ${outlineWidth}px 0 ${rgbaOutlineColor},
                     ${outlineWidth}px  0   0 ${rgbaOutlineColor},
                    -${outlineWidth}px  0   0 ${rgbaOutlineColor},
                     0   ${outlineWidth}px 0 ${rgbaOutlineColor},
                     0   -${outlineWidth}px 0 ${rgbaOutlineColor}
                `;
                textSpan.style.textShadow = shadow; // Override default style
            } else {
                textSpan.style.textShadow = "none"; // Override default style
            }
        }

    } else {
        // If unmarked, re-apply default styles (which resets bg color, bg image, border color, and TEXT styles)
        applyCellStyle(cell);
    }
}

// --- Re-apply styles to all currently marked cells ---
function refreshMarkedCellStyles() {
    const markedCells = document.querySelectorAll('#bingo-board .bingo-cell.marked');
    markedCells.forEach(cell => {
        applyMarkedCellStyle(cell); // Re-apply based on current settings
    });
}

// --- Save current header settings to localStorage ---
function saveHeaderSettings() {
    localStorage.setItem(LS_HEADER_TEXT, document.getElementById('header-text-input').value);
    localStorage.setItem(LS_HEADER_IMAGE_URL, document.getElementById('header-image-url-input').value);
    localStorage.setItem(LS_HEADER_TEXT_COLOR, document.getElementById('header-text-color-picker').value);
    localStorage.setItem(LS_HEADER_TEXT_COLOR_OPACITY, document.getElementById('header-text-color-opacity-slider').value);
    // Save header background
    localStorage.setItem(LS_HEADER_BG_COLOR, document.getElementById('header-bg-color-picker').value);
    localStorage.setItem(LS_HEADER_BG_OPACITY, document.getElementById('header-bg-opacity-slider').value);
}

// --- Function to apply header background style ---
function applyHeaderBgStyle() {
    const headerElement = document.getElementById('board-header');
    if (!headerElement) return;

    const bgColor = localStorage.getItem(LS_HEADER_BG_COLOR) || DEFAULT_HEADER_BG_COLOR;
    const opacity = parseInt(localStorage.getItem(LS_HEADER_BG_OPACITY) || DEFAULT_HEADER_BG_OPACITY, 10);

    headerElement.style.backgroundColor = hexToRgba(bgColor, opacity);
}

// --- Function to update the header display ---
function updateHeaderDisplay() {
    // Read text, applying default ONLY if the key is missing
    let headerText = localStorage.getItem(LS_HEADER_TEXT);
    if (headerText === null) { // Check if key exists
        headerText = DEFAULT_HEADER_TEXT; // Apply default only if key missing
    }
    // Read image URL, applying default if missing OR empty (standard || pattern)
    const headerImageUrl = localStorage.getItem(LS_HEADER_IMAGE_URL) || DEFAULT_HEADER_IMAGE_URL;
    const headerContainer = document.getElementById("custom-header-content");

    if (!headerContainer) return;

    // Clear existing content
    headerContainer.innerHTML = "";

    let hasText = headerText && headerText.trim() !== "";
    let hasCustomImage = headerImageUrl && headerImageUrl.trim() !== "";

    // Add text if it exists
    if (hasText) {
        const h1 = document.createElement("h1");
        h1.className = "text-4xl font-bold"; // Keep other styles
        h1.textContent = headerText;
        let headerTextColor = localStorage.getItem(LS_HEADER_TEXT_COLOR);
        if (headerTextColor === null) { // Check if key exists before applying default
            headerTextColor = DEFAULT_HEADER_TEXT_COLOR;
        }
        let headerTextOpacity = localStorage.getItem(LS_HEADER_TEXT_COLOR_OPACITY);
         if (headerTextOpacity === null) {
             headerTextOpacity = DEFAULT_HEADER_TEXT_COLOR_OPACITY;
         }
        h1.style.color = hexToRgba(headerTextColor, parseInt(headerTextOpacity, 10));
        headerContainer.appendChild(h1);
    }

    // Add custom image if URL exists
    if (hasCustomImage) {
        const img = document.createElement("img");
        img.src = headerImageUrl;
        img.alt = "Custom Header Image";
        img.className = "max-h-16 max-w-full object-contain"; // Adjust size as needed
        img.onerror = () => {
            img.remove(); // Remove broken image placeholder
            showNotification("Could not load custom header image.", "warning");
            // If there was no text either, maybe add bean?
            if (!hasText && !document.getElementById("bean")) {
                 addDefaultBean(headerContainer);
            }
        };
        headerContainer.appendChild(img);
    }
    // If there is NO text and NO custom image, add the default bean
    else if (!hasText) {
        addDefaultBean(headerContainer);
    }
    // Implicitly, if there IS text but NO custom image, nothing else is added here
    // (the bean is not automatically added alongside text anymore unless specified by lack of custom image AND lack of text)
}

// Helper to add the default bean image
function addDefaultBean(container) {
    const img = document.createElement('img');
    img.id = 'bean';
    img.src = '../bean.svg';
    img.alt = 'Bean';
    img.className = 'w-16 h-16 cursor-pointer'; // Use consistent size
    img.onclick = explodeBeans;
    container.appendChild(img);
}

// --- Save current default cell style settings to localStorage ---
function saveCellStyleSettings() {
    localStorage.setItem(LS_CELL_BORDER_COLOR, document.getElementById('cell-border-color-picker').value);
    localStorage.setItem(LS_CELL_BORDER_OPACITY, document.getElementById('cell-border-opacity-slider').value);
    localStorage.setItem(LS_CELL_BG_COLOR, document.getElementById('cell-background-color-picker').value);
    localStorage.setItem(LS_CELL_BG_OPACITY, document.getElementById('cell-background-opacity-slider').value);
    localStorage.setItem(LS_CELL_BG_IMAGE_URL, document.getElementById('cell-background-image-url-input').value);
    localStorage.setItem(LS_CELL_BG_IMAGE_OPACITY, document.getElementById('cell-background-image-opacity-slider').value); // Save image opacity
    // Save text styles
    localStorage.setItem(LS_CELL_TEXT_COLOR, document.getElementById('cell-text-color-picker').value);
    localStorage.setItem(LS_CELL_TEXT_OPACITY, document.getElementById('cell-text-opacity-slider').value);
    localStorage.setItem(LS_CELL_OUTLINE_COLOR, document.getElementById('cell-outline-color-picker').value);
    localStorage.setItem(LS_CELL_OUTLINE_OPACITY, document.getElementById('cell-outline-opacity-slider').value);
    localStorage.setItem(LS_CELL_OUTLINE_WIDTH, document.getElementById('cell-outline-width-input').value);
}

// --- Apply saved default cell styles to a cell ---
function applyCellStyle(cell) {
    if (!cell || cell.classList.contains('marked')) return; // Only apply to non-marked cells

    // Borders
    const borderColor = localStorage.getItem(LS_CELL_BORDER_COLOR) || DEFAULT_CELL_BORDER_COLOR;
    const borderOpacity = parseInt(localStorage.getItem(LS_CELL_BORDER_OPACITY) || DEFAULT_CELL_BORDER_OPACITY, 10);
    cell.style.borderColor = hexToRgba(borderColor, borderOpacity);

    // Background Color / Image
    const bgColor = localStorage.getItem(LS_CELL_BG_COLOR) || DEFAULT_CELL_BG_COLOR;
    const bgOpacity = parseInt(localStorage.getItem(LS_CELL_BG_OPACITY) || DEFAULT_CELL_BG_OPACITY, 10);
    const bgImageUrl = localStorage.getItem(LS_CELL_BG_IMAGE_URL) || DEFAULT_CELL_BG_IMAGE_URL;
    const bgImageOpacity = parseInt(localStorage.getItem(LS_CELL_BG_IMAGE_OPACITY) || DEFAULT_CELL_BG_IMAGE_OPACITY, 10);
    cell.style.opacity = ''; // Reset direct opacity

    if (bgImageUrl) {
        cell.style.setProperty('--bg-image-url', `url('${bgImageUrl}')`);
        cell.style.setProperty('--bg-image-opacity', bgImageOpacity / 100); // Set image opacity property
        cell.style.backgroundColor = hexToRgba(bgColor, bgOpacity);
    } else {
        cell.style.removeProperty('--bg-image-url'); // NEW: Remove CSS custom property
        cell.style.removeProperty('--bg-image-opacity'); // Remove image opacity property
        cell.style.backgroundColor = hexToRgba(bgColor, bgOpacity);
    }

    // Text Styles
    const textSpan = cell.querySelector('.bingo-cell-text');
    if (textSpan) {
        const textColor = localStorage.getItem(LS_CELL_TEXT_COLOR) || DEFAULT_CELL_TEXT_COLOR;
        const textOpacity = parseInt(localStorage.getItem(LS_CELL_TEXT_OPACITY) || DEFAULT_CELL_TEXT_OPACITY, 10);
        const outlineColor = localStorage.getItem(LS_CELL_OUTLINE_COLOR) || DEFAULT_CELL_OUTLINE_COLOR;
        const outlineOpacity = parseInt(localStorage.getItem(LS_CELL_OUTLINE_OPACITY) || DEFAULT_CELL_OUTLINE_OPACITY, 10);
        let outlineWidth = parseFloat(localStorage.getItem(LS_CELL_OUTLINE_WIDTH));
        if (isNaN(outlineWidth) || outlineWidth < 0) outlineWidth = DEFAULT_CELL_OUTLINE_WIDTH;

        const rgbaTextColor = hexToRgba(textColor, textOpacity);
        textSpan.style.color = rgbaTextColor;
        textSpan.style.setProperty('--cell-text-color', rgbaTextColor);

        if (outlineWidth > 0) {
            const rgbaOutlineColor = hexToRgba(outlineColor, outlineOpacity);
            // Create outline using multiple text shadows
            const shadow = `
                -${outlineWidth}px -${outlineWidth}px 0 ${rgbaOutlineColor},
                 ${outlineWidth}px -${outlineWidth}px 0 ${rgbaOutlineColor},
                -${outlineWidth}px  ${outlineWidth}px 0 ${rgbaOutlineColor},
                 ${outlineWidth}px  ${outlineWidth}px 0 ${rgbaOutlineColor},
                 ${outlineWidth}px  0   0 ${rgbaOutlineColor},
                -${outlineWidth}px  0   0 ${rgbaOutlineColor},
                 0   ${outlineWidth}px 0 ${rgbaOutlineColor},
                 0   -${outlineWidth}px 0 ${rgbaOutlineColor}
            `;
            textSpan.style.textShadow = shadow;
            textSpan.style.setProperty('--cell-text-outline', shadow);
        } else {
            textSpan.style.textShadow = 'none';
            textSpan.style.removeProperty('--cell-text-outline');
        }
    }
}

// --- Re-apply default styles to all non-marked cells ---
function refreshCellStyles() {
    const cells = document.querySelectorAll('#bingo-board .bingo-cell:not(.marked)');
    cells.forEach(cell => {
        applyCellStyle(cell); // Re-apply based on current settings
    });
}

// --- Save board background settings to localStorage ---
function saveBoardBgSettings() {
    localStorage.setItem(LS_BOARD_BG_COLOR, document.getElementById('board-bg-color-picker').value);
    localStorage.setItem(LS_BOARD_BG_IMAGE_URL, document.getElementById('board-bg-image-url-input').value);
    localStorage.setItem(LS_BOARD_BG_COLOR_OPACITY, document.getElementById('board-bg-color-opacity-slider').value); // Use new ID & key
}

// --- Apply board background style ---
function applyBoardBgStyle() {
    const container = document.getElementById('bingo-board-container');
    if (!container) return;

    const bgColor = localStorage.getItem(LS_BOARD_BG_COLOR) || DEFAULT_BOARD_BG_COLOR;
    const bgImageUrl = localStorage.getItem(LS_BOARD_BG_IMAGE_URL) || DEFAULT_BOARD_BG_IMAGE_URL;
    const opacityValue = parseInt(localStorage.getItem(LS_BOARD_BG_COLOR_OPACITY) || DEFAULT_BOARD_BG_COLOR_OPACITY, 10);

    // Apply opacity - REMOVED direct opacity setting
    // container.style.opacity = opacityValue;

    // Apply background image or color
    if (bgImageUrl) {
        container.style.backgroundImage = `url('${bgImageUrl}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center center';
        container.style.backgroundRepeat = 'no-repeat';
        // Apply background color with its opacity as fallback / see-through
        container.style.backgroundColor = hexToRgba(bgColor, opacityValue);
    } else {
        container.style.backgroundImage = 'none';
        container.style.backgroundColor = hexToRgba(bgColor, opacityValue);
    }
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
    saveCellStyleSettings(); // Save default cell style settings
    saveBoardBgSettings(); // Save board background settings
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

    const board = document.getElementById("bingo-board");
    board.innerHTML = ""; // Clear previous board
    board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;

    displayedItems.forEach((item, index) => {
        const cell = document.createElement("div");
        cell.classList.add("bingo-cell", "cursor-pointer");
        // cell.textContent = item; // OLD WAY
        cell.dataset.index = index; // Add index for saving marks
        cell.onclick = () => selectCell(cell);
        applyCellStyle(cell); // Apply default styles upon creation

        // NEW: Create span for text content
        const textSpan = document.createElement("span");
        textSpan.classList.add("bingo-cell-text");
        textSpan.textContent = item;
        cell.appendChild(textSpan);

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
    document.getElementById('background-color-opacity-slider').value = DEFAULT_SOLID_COLOR_OPACITY;
    document.getElementById('gradient-color-1').value = DEFAULT_GRADIENT_COLOR_1;
    document.getElementById('gradient-color-1-opacity-slider').value = DEFAULT_GRADIENT_COLOR_1_OPACITY;
    document.getElementById('gradient-color-2').value = DEFAULT_GRADIENT_COLOR_2;
    document.getElementById('gradient-color-2-opacity-slider').value = DEFAULT_GRADIENT_COLOR_2_OPACITY;
    document.getElementById('gradient-direction').value = DEFAULT_GRADIENT_DIRECTION;
    toggleBackgroundControls(); // Ensure correct controls are visible

    // Reset header inputs to defaults
    document.getElementById('header-text-input').value = DEFAULT_HEADER_TEXT;
    document.getElementById('header-image-url-input').value = DEFAULT_HEADER_IMAGE_URL;
    document.getElementById('header-text-color-picker').value = DEFAULT_HEADER_TEXT_COLOR;
    document.getElementById('header-text-color-opacity-slider').value = DEFAULT_HEADER_TEXT_COLOR_OPACITY;
    updateHeaderDisplay(); // Apply default header display

    // Reset marked style inputs to defaults
    document.getElementById('marked-color-picker').value = DEFAULT_MARKED_COLOR;
    document.getElementById('marked-color-opacity-slider').value = DEFAULT_MARKED_COLOR_OPACITY;
    document.getElementById('marked-image-url-input').value = DEFAULT_MARKED_IMAGE_URL;
    document.getElementById('marked-border-color-picker').value = DEFAULT_MARKED_BORDER_COLOR;
    document.getElementById('marked-border-opacity-slider').value = DEFAULT_MARKED_BORDER_OPACITY;
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

    const board = document.getElementById("bingo-board");
    const cells = board.querySelectorAll(".bingo-cell");

    if (cells.length !== displayedItems.length) {
        showNotification("Cannot randomize: Board size mismatch. Please generate the board again.", 'error');
        return;
    }

    cells.forEach((cell, index) => {
        // cell.textContent = displayedItems[index]; // OLD WAY
        // NEW: Update or create text span
        let textSpan = cell.querySelector(".bingo-cell-text");
        if (!textSpan) { // Should exist, but create if missing
            textSpan = document.createElement("span");
            textSpan.classList.add("bingo-cell-text");
            cell.innerHTML =
            cell.appendChild(textSpan);
        }
        textSpan.textContent = displayedItems[index];

        cell.classList.remove("marked"); // Clear marks visually
        applyMarkedCellStyle(cell); // Reset marked styles (which also calls applyCellStyle)
    });

    // Explicitly remove any existing highlights BEFORE clearing the search input
    const currentlyHighlighted = board.querySelectorAll('.bingo-cell.highlighted');
    currentlyHighlighted.forEach(cell => cell.classList.remove('highlighted'));

    clearSearch(); // Clear search highlights and input
    clearMarks(false); // Clear visual marks
    saveBoardState(); // Save the new randomized state (including cleared marks)
    showNotification('Board randomized!', 'success');
}

function selectCell(cell) {
    cell.classList.toggle("marked"); // Toggle the dedicated 'marked' class
    applyMarkedCellStyle(cell); // Apply/remove styles based on new state and settings
    saveBoardState(); // RE-ADD: Save updated marks immediately after click
}

function clearMarks(save = true) {
    const cells = document.querySelectorAll('#bingo-board .bingo-cell');
    cells.forEach(cell => {
        if (cell.classList.contains('marked')) {
            cell.classList.remove('marked');
            applyMarkedCellStyle(cell); // Reset styles for this cell
        }
        // Ensure styles are reset even if class was somehow missing
        applyCellStyle(cell); // Ensure default styles are correct after potential mark removal
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

// --- Function to reset ONLY board content/structure settings ---
function resetSettings() {
    // Clear localStorage relevant ONLY to the board structure/content
    localStorage.removeItem(LS_BOARD_SIZE);
    localStorage.removeItem(LS_CELL_ITEMS); // The items configured for the board (padded/sliced)
    localStorage.removeItem(LS_DISPLAYED_ITEMS); // The current layout
    localStorage.removeItem(LS_MARKED_INDICES);
    localStorage.removeItem(LS_ORIGINAL_ITEMS); // User's raw input

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

// --- Function to reset ALL application settings ---
function resetAllSettings() {
    if (confirm('Are you sure you want to reset ALL settings (styles, header, board content, etc.) to their defaults? This cannot be undone.')) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('beango_')) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`Removed setting: ${key}`); // Optional: log removed keys
        });

        showNotification('Resetting all settings to defaults...', 'warning', 1500); // Show brief message before reload

        // Use a short delay before reload to ensure the notification is visible
        setTimeout(() => {
             location.reload();
        }, 1600); // Slightly longer than notification duration
    }
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

// --- Clear Search Input and Highlights ---
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = ''; // Clear the input field
        // Trigger the input event listener to ensure highlights are removed
        searchInput.dispatchEvent(new Event('input'));
    }
    // It's technically redundant to remove the class here now, as the
    // event listener triggered above should handle it, but it doesn't hurt.
    const highlightedCells = document.querySelectorAll('#bingo-board .bingo-cell.highlighted');
    highlightedCells.forEach(cell => {
        cell.classList.remove('highlighted'); // Remove highlight class
    });
}

// --- Load State on Page Load ---
function loadFromLocalStorage() {
    const savedSize = localStorage.getItem(LS_BOARD_SIZE) || "5"; // Default to 5
    const savedItemsText = localStorage.getItem(LS_CELL_ITEMS);
    const savedDisplayedItems = localStorage.getItem(LS_DISPLAYED_ITEMS);
    const savedMarkedIndices = localStorage.getItem(LS_MARKED_INDICES);
    const configIsOpen = localStorage.getItem(LS_CONFIG_OPEN) === "true";
    const savedOriginalItemsText = localStorage.getItem(LS_ORIGINAL_ITEMS);
    // Load header text, applying default ONLY if key is missing
    let savedHeaderText = localStorage.getItem(LS_HEADER_TEXT);
    if (savedHeaderText === null) { // Check if key exists
        savedHeaderText = DEFAULT_HEADER_TEXT; // Apply default only if key missing
    }
    const savedHeaderImageUrl = localStorage.getItem(LS_HEADER_IMAGE_URL) || DEFAULT_HEADER_IMAGE_URL;
    let savedHeaderTextColor = localStorage.getItem(LS_HEADER_TEXT_COLOR);
    if (savedHeaderTextColor === null) {
        savedHeaderTextColor = DEFAULT_HEADER_TEXT_COLOR;
    }
    const savedHeaderTextOpacity = localStorage.getItem(LS_HEADER_TEXT_COLOR_OPACITY) || DEFAULT_HEADER_TEXT_COLOR_OPACITY;
    const savedHeaderBgColor = localStorage.getItem(LS_HEADER_BG_COLOR) || DEFAULT_HEADER_BG_COLOR;
    const savedHeaderBgOpacity = localStorage.getItem(LS_HEADER_BG_OPACITY) || DEFAULT_HEADER_BG_OPACITY;
    const savedMarkedColor = localStorage.getItem(LS_MARKED_COLOR) || DEFAULT_MARKED_COLOR;
    const savedMarkedColorOpacity = localStorage.getItem(LS_MARKED_COLOR_OPACITY) || DEFAULT_MARKED_COLOR_OPACITY;
    const savedMarkedImageUrl = localStorage.getItem(LS_MARKED_IMAGE_URL) || DEFAULT_MARKED_IMAGE_URL;
    const savedMarkedImageOpacity = localStorage.getItem(LS_MARKED_IMAGE_OPACITY) || DEFAULT_MARKED_IMAGE_OPACITY;
    console.log(`LOAD: LS_MARKED_IMAGE_OPACITY = ${localStorage.getItem(LS_MARKED_IMAGE_OPACITY)}, using: ${savedMarkedImageOpacity}`); // DEBUG LOG
    const savedCellBorderColor = localStorage.getItem(LS_CELL_BORDER_COLOR) || DEFAULT_CELL_BORDER_COLOR;
    const savedCellBorderOpacity = localStorage.getItem(LS_CELL_BORDER_OPACITY) || DEFAULT_CELL_BORDER_OPACITY;
    const savedCellBgColor = localStorage.getItem(LS_CELL_BG_COLOR) || DEFAULT_CELL_BG_COLOR;
    const savedCellBgOpacity = localStorage.getItem(LS_CELL_BG_OPACITY) || DEFAULT_CELL_BG_OPACITY;
    const savedCellBgImageUrl = localStorage.getItem(LS_CELL_BG_IMAGE_URL) || DEFAULT_CELL_BG_IMAGE_URL;
    const savedCellBgImageOpacity = localStorage.getItem(LS_CELL_BG_IMAGE_OPACITY) || DEFAULT_CELL_BG_IMAGE_OPACITY;
    console.log(`LOAD: LS_CELL_BG_IMAGE_OPACITY = ${localStorage.getItem(LS_CELL_BG_IMAGE_OPACITY)}, using: ${savedCellBgImageOpacity}`); // DEBUG LOG
    const savedCellTextColor = localStorage.getItem(LS_CELL_TEXT_COLOR) || DEFAULT_CELL_TEXT_COLOR;
    const savedCellTextOpacity = localStorage.getItem(LS_CELL_TEXT_OPACITY) || DEFAULT_CELL_TEXT_OPACITY;
    const savedCellOutlineColor = localStorage.getItem(LS_CELL_OUTLINE_COLOR) || DEFAULT_CELL_OUTLINE_COLOR;
    const savedCellOutlineOpacity = localStorage.getItem(LS_CELL_OUTLINE_OPACITY) || DEFAULT_CELL_OUTLINE_OPACITY;
    const savedCellOutlineWidth = localStorage.getItem(LS_CELL_OUTLINE_WIDTH) || DEFAULT_CELL_OUTLINE_WIDTH;
    const savedMarkedBorderColor = localStorage.getItem(LS_MARKED_BORDER_COLOR) || DEFAULT_MARKED_BORDER_COLOR;
    const savedMarkedBorderOpacity = localStorage.getItem(LS_MARKED_BORDER_OPACITY) || DEFAULT_MARKED_BORDER_OPACITY;
    const savedMarkedCellTextColor = localStorage.getItem(LS_MARKED_CELL_TEXT_COLOR) || DEFAULT_MARKED_CELL_TEXT_COLOR;
    const savedMarkedCellTextOpacity = localStorage.getItem(LS_MARKED_CELL_TEXT_OPACITY) || DEFAULT_MARKED_CELL_TEXT_OPACITY;
    const savedMarkedCellOutlineColor = localStorage.getItem(LS_MARKED_CELL_OUTLINE_COLOR) || DEFAULT_MARKED_CELL_OUTLINE_COLOR;
    const savedMarkedCellOutlineOpacity = localStorage.getItem(LS_MARKED_CELL_OUTLINE_OPACITY) || DEFAULT_MARKED_CELL_OUTLINE_OPACITY;
    const savedMarkedCellOutlineWidth = localStorage.getItem(LS_MARKED_CELL_OUTLINE_WIDTH) || DEFAULT_MARKED_CELL_OUTLINE_WIDTH;
    const savedBoardBgColor = localStorage.getItem(LS_BOARD_BG_COLOR) || DEFAULT_BOARD_BG_COLOR;
    const savedBoardBgColorOpacity = localStorage.getItem(LS_BOARD_BG_COLOR_OPACITY) || DEFAULT_BOARD_BG_COLOR_OPACITY;
    const savedBoardBgImageUrl = localStorage.getItem(LS_BOARD_BG_IMAGE_URL) || DEFAULT_BOARD_BG_IMAGE_URL;

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
            // *** ADDED: Restore currentItems as well ***
            if (savedItemsText) {
                 try {
                     currentItems = JSON.parse(savedItemsText);
                     if (!Array.isArray(currentItems)) {
                         console.warn('Loaded LS_CELL_ITEMS was not an array, resetting.');
                         currentItems = [];
                     }
                 } catch (e) {
                     showNotification('Error parsing saved cell item pool (LS_CELL_ITEMS). Board may not randomize correctly.', 'warning');
                     currentItems = []; // Reset on parse error
                 }
            } else {
                 // If LS_CELL_ITEMS doesn't exist but LS_DISPLAYED_ITEMS does, it's an inconsistent state.
                 // We could try to reconstruct currentItems from displayedItems, but it might lack padding/slicing info.
                 // For now, log a warning and reset currentItems.
                 console.warn('Inconsistent state: LS_DISPLAYED_ITEMS exists but LS_CELL_ITEMS is missing. Randomization might fail.');
                 currentItems = [];
            }
            // *** END ADDED section ***
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
            const cell = document.createElement("div");
            cell.classList.add("bingo-cell", "cursor-pointer");
            // cell.textContent = item; // OLD WAY
            cell.dataset.index = index; // Ensure index is set for loading marks correctly
            cell.onclick = () => selectCell(cell);
            // applyCellStyle(cell); // Apply default cell style first <-- MOVED DOWN

            // NEW: Create span for text content
            const textSpan = document.createElement("span");
            textSpan.classList.add("bingo-cell-text");
            textSpan.textContent = item;
            cell.appendChild(textSpan);

            applyCellStyle(cell); // <-- MOVED HERE: Apply styles AFTER text span exists

            if (markedIndices.includes(index)) {
                cell.classList.add("marked"); // Apply saved mark using 'marked' class
                // Apply dynamic marked styles AFTER adding the class and default styles
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
    const savedSolidColorOpacity = localStorage.getItem(LS_SOLID_COLOR_OPACITY) || DEFAULT_SOLID_COLOR_OPACITY;
    const savedGradientColor1 = localStorage.getItem(LS_GRADIENT_COLOR_1) || DEFAULT_GRADIENT_COLOR_1;
    const savedGradientColor1Opacity = localStorage.getItem(LS_GRADIENT_COLOR_1_OPACITY) || DEFAULT_GRADIENT_COLOR_1_OPACITY;
    const savedGradientColor2 = localStorage.getItem(LS_GRADIENT_COLOR_2) || DEFAULT_GRADIENT_COLOR_2;
    const savedGradientColor2Opacity = localStorage.getItem(LS_GRADIENT_COLOR_2_OPACITY) || DEFAULT_GRADIENT_COLOR_2_OPACITY;
    const savedGradientDirection = localStorage.getItem(LS_GRADIENT_DIRECTION) || DEFAULT_GRADIENT_DIRECTION;

    // Set radio button
    document.querySelector(`input[name="background-type"][value="${savedBackgroundType}"]`).checked = true;

    // Set input values
    document.getElementById('background-color-picker').value = savedSolidColor;
    document.getElementById('background-color-opacity-slider').value = savedSolidColorOpacity;
    document.getElementById('gradient-color-1').value = savedGradientColor1;
    document.getElementById('gradient-color-1-opacity-slider').value = savedGradientColor1Opacity;
    document.getElementById('gradient-color-2').value = savedGradientColor2;
    document.getElementById('gradient-color-2-opacity-slider').value = savedGradientColor2Opacity;
    document.getElementById('gradient-direction').value = savedGradientDirection;

    // Show/hide controls and apply background
    toggleBackgroundControls();
    setBackground();
    // --- End Restore Background Settings ---

    // --- Restore Header Settings ---
    document.getElementById('header-text-input').value = savedHeaderText;
    document.getElementById('header-image-url-input').value = savedHeaderImageUrl;
    document.getElementById('header-text-color-picker').value = savedHeaderTextColor;
    document.getElementById('header-text-color-opacity-slider').value = savedHeaderTextOpacity;
    if(document.getElementById('header-text-color-opacity-value')) document.getElementById('header-text-color-opacity-value').textContent = savedHeaderTextOpacity; // Update display span
    // Restore header background inputs
    document.getElementById('header-bg-color-picker').value = savedHeaderBgColor;
    document.getElementById('header-bg-opacity-slider').value = savedHeaderBgOpacity;
    if(document.getElementById('header-bg-opacity-value')) document.getElementById('header-bg-opacity-value').textContent = savedHeaderBgOpacity;
    applyHeaderBgStyle(); // Apply header background style
    updateHeaderDisplay(); // Apply the loaded header content
    // --- End Restore Header Settings ---

    // --- Restore Marked Style Settings ---
    document.getElementById('marked-color-picker').value = savedMarkedColor;
    document.getElementById('marked-color-opacity-slider').value = savedMarkedColorOpacity;
    if(document.getElementById('marked-color-opacity-value')) document.getElementById('marked-color-opacity-value').textContent = savedMarkedColorOpacity;
    document.getElementById('marked-image-url-input').value = savedMarkedImageUrl;
    const markedImageOpacitySlider = document.getElementById('marked-image-opacity-slider');
    const markedImageOpacityValueSpan = document.getElementById('marked-image-opacity-value');
    if (markedImageOpacitySlider) markedImageOpacitySlider.value = savedMarkedImageOpacity;
    if (markedImageOpacityValueSpan) markedImageOpacityValueSpan.textContent = savedMarkedImageOpacity;

    document.getElementById('marked-border-color-picker').value = savedMarkedBorderColor;
    const markedBorderOpacitySlider = document.getElementById('marked-border-opacity-slider');
    const markedBorderOpacityValueSpan = document.getElementById('marked-border-opacity-value');
    if (markedBorderOpacitySlider) markedBorderOpacitySlider.value = savedMarkedBorderOpacity;
    if (markedBorderOpacityValueSpan) markedBorderOpacityValueSpan.textContent = savedMarkedBorderOpacity;

    // Restore marked text styles
    document.getElementById('marked-cell-text-color-picker').value = savedMarkedCellTextColor;
    const markedCellTextOpacitySlider = document.getElementById('marked-cell-text-opacity-slider');
    const markedCellTextOpacityValueSpan = document.getElementById('marked-cell-text-opacity-value');
    if (markedCellTextOpacitySlider) markedCellTextOpacitySlider.value = savedMarkedCellTextOpacity;
    if (markedCellTextOpacityValueSpan) markedCellTextOpacityValueSpan.textContent = savedMarkedCellTextOpacity;

    document.getElementById('marked-cell-outline-color-picker').value = savedMarkedCellOutlineColor;
    const markedCellOutlineOpacitySlider = document.getElementById('marked-cell-outline-opacity-slider');
    const markedCellOutlineOpacityValueSpan = document.getElementById('marked-cell-outline-opacity-value');
    if (markedCellOutlineOpacitySlider) markedCellOutlineOpacitySlider.value = savedMarkedCellOutlineOpacity;
    if (markedCellOutlineOpacityValueSpan) markedCellOutlineOpacityValueSpan.textContent = savedMarkedCellOutlineOpacity;

    document.getElementById('marked-cell-outline-width-input').value = savedMarkedCellOutlineWidth;

    refreshMarkedCellStyles(); // Apply the loaded marked styles
    // --- End Restore Marked Style Settings ---

    // --- Restore Default Cell Style Settings ---
    document.getElementById('cell-border-color-picker').value = savedCellBorderColor;
    const cellBorderOpacitySlider = document.getElementById('cell-border-opacity-slider');
    const cellBorderOpacityValueSpan = document.getElementById('cell-border-opacity-value');
    if (cellBorderOpacitySlider) cellBorderOpacitySlider.value = savedCellBorderOpacity;
    if (cellBorderOpacityValueSpan) cellBorderOpacityValueSpan.textContent = savedCellBorderOpacity;

    document.getElementById('cell-background-color-picker').value = savedCellBgColor;
    const cellBackgroundOpacitySlider = document.getElementById('cell-background-opacity-slider');
    const cellBackgroundOpacityValueSpan = document.getElementById('cell-background-opacity-value');
    if (cellBackgroundOpacitySlider) cellBackgroundOpacitySlider.value = savedCellBgOpacity;
    if (cellBackgroundOpacityValueSpan) cellBackgroundOpacityValueSpan.textContent = savedCellBgOpacity;

    document.getElementById('cell-background-image-url-input').value = savedCellBgImageUrl;
    const cellBackgroundImageOpacitySlider = document.getElementById('cell-background-image-opacity-slider');
    const cellBackgroundImageOpacityValueSpan = document.getElementById('cell-background-image-opacity-value');
    if (cellBackgroundImageOpacitySlider) cellBackgroundImageOpacitySlider.value = savedCellBgImageOpacity;
    if (cellBackgroundImageOpacityValueSpan) cellBackgroundImageOpacityValueSpan.textContent = savedCellBgImageOpacity;

    // Restore text styles
    document.getElementById('cell-text-color-picker').value = savedCellTextColor;
    const cellTextOpacitySlider = document.getElementById('cell-text-opacity-slider');
    const cellTextOpacityValueSpan = document.getElementById('cell-text-opacity-value');
    if (cellTextOpacitySlider) cellTextOpacitySlider.value = savedCellTextOpacity;
    if (cellTextOpacityValueSpan) cellTextOpacityValueSpan.textContent = savedCellTextOpacity;
    document.getElementById('cell-outline-color-picker').value = savedCellOutlineColor;
    const cellOutlineOpacitySlider = document.getElementById('cell-outline-opacity-slider');
    const cellOutlineOpacityValueSpan = document.getElementById('cell-outline-opacity-value');
    if (cellOutlineOpacitySlider) cellOutlineOpacitySlider.value = savedCellOutlineOpacity;
    if (cellOutlineOpacityValueSpan) cellOutlineOpacityValueSpan.textContent = savedCellOutlineOpacity;
    document.getElementById('cell-outline-width-input').value = savedCellOutlineWidth;

    // Styles are applied during board creation loop above
    // --- End Restore Default Cell Style Settings ---

    // --- Restore Board Background Settings ---
    document.getElementById('board-bg-color-picker').value = savedBoardBgColor;
    document.getElementById('board-bg-image-url-input').value = savedBoardBgImageUrl;
    document.getElementById('board-bg-color-opacity-slider').value = savedBoardBgColorOpacity;
    const boardBgOpacitySlider = document.getElementById('board-bg-color-opacity-slider');
    const boardBgOpacityValueSpan = document.getElementById('board-bg-color-opacity-value');
    if (boardBgOpacitySlider) boardBgOpacitySlider.value = savedBoardBgColorOpacity;
    if (boardBgOpacityValueSpan) boardBgOpacityValueSpan.textContent = savedBoardBgColorOpacity;
    applyBoardBgStyle(); // Apply loaded style
    // --- End Restore Board Background Settings ---

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

    // --- Add Event Listeners for Default Cell Style Controls ---
    document.getElementById('cell-border-color-picker').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles(); // Update all non-marked cells
    });
    document.getElementById('cell-border-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('cell-border-opacity-value')) document.getElementById('cell-border-opacity-value').textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles(); // Update all non-marked cells
    });
    document.getElementById('cell-background-color-picker').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-background-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('cell-background-opacity-value')) document.getElementById('cell-background-opacity-value').textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-background-image-url-input').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });

    // --- Add Event Listeners for Text Style Controls ---
    document.getElementById('cell-text-color-picker').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-text-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('cell-text-opacity-value')) document.getElementById('cell-text-opacity-value').textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-outline-color-picker').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-outline-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('cell-outline-opacity-value')) document.getElementById('cell-outline-opacity-value').textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-outline-width-input').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });

    // --- Add Event Listeners for Board Background Controls ---
    document.getElementById('board-bg-color-picker').addEventListener('input', () => {
        saveBoardBgSettings();
        applyBoardBgStyle();
    });
    document.getElementById('board-bg-image-url-input').addEventListener('input', () => {
        saveBoardBgSettings();
        applyBoardBgStyle();
    });
    document.getElementById('board-bg-color-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('board-bg-color-opacity-value')) document.getElementById('board-bg-color-opacity-value').textContent = e.target.value;
        saveBoardBgSettings();
        applyBoardBgStyle();
    });

    // --- Search Listener ---
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const cells = document.querySelectorAll('#bingo-board .bingo-cell');

            // Split search term into words
            const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);

            cells.forEach(cell => {
                const textSpan = cell.querySelector('.bingo-cell-text');
                let isMatch = false;
                if (textSpan && searchWords.length > 0) {
                    const cellText = textSpan.textContent.trim().toLowerCase();
                    // Check if ALL search words are included in the cell text
                    isMatch = searchWords.every(word => cellText.includes(word));
                }

                // Add or remove highlight based on match status
                if (isMatch) {
                    cell.classList.add('highlighted');
                } else {
                    cell.classList.remove('highlighted');
                }
            });
        });
    }

    // --- Other Listeners ---
    window.addEventListener('resize', equalizeCellSizes);
    equalizeCellSizes(); // Initial call after load

    // --- Add Event Listeners for Marked Text Style Controls ---
    document.getElementById("marked-cell-text-color-picker").addEventListener("input", () => {
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById("marked-cell-text-opacity-slider").addEventListener("input", (e) => {
        if(document.getElementById("marked-cell-text-opacity-value")) document.getElementById("marked-cell-text-opacity-value").textContent = e.target.value;
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById("marked-cell-outline-color-picker").addEventListener("input", () => {
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById("marked-cell-outline-opacity-slider").addEventListener("input", (e) => {
        if(document.getElementById("marked-cell-outline-opacity-value")) document.getElementById("marked-cell-outline-opacity-value").textContent = e.target.value;
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById("marked-cell-outline-width-input").addEventListener("input", () => {
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });

    // --- Add Event Listeners for Default Cell Style Controls ---
    document.getElementById("cell-border-color-picker").addEventListener("input", () => {
        saveCellStyleSettings();
        refreshCellStyles(); // Update all non-marked cells
    });
    document.getElementById("cell-border-opacity-slider").addEventListener("input", (e) => {
        if(document.getElementById("cell-border-opacity-value")) document.getElementById("cell-border-opacity-value").textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles(); // Update all non-marked cells
    });
    document.getElementById("cell-background-color-picker").addEventListener("input", () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById("cell-background-opacity-slider").addEventListener("input", (e) => {
        if(document.getElementById("cell-background-opacity-value")) document.getElementById("cell-background-opacity-value").textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById("cell-background-image-url-input").addEventListener("input", () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById("cell-text-color-picker").addEventListener("input", () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById("cell-text-opacity-slider").addEventListener("input", (e) => {
        if(document.getElementById("cell-text-opacity-value")) document.getElementById("cell-text-opacity-value").textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById("cell-outline-color-picker").addEventListener("input", () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById("cell-outline-opacity-slider").addEventListener("input", (e) => {
        if(document.getElementById("cell-outline-opacity-value")) document.getElementById("cell-outline-opacity-value").textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById("cell-outline-width-input").addEventListener("input", () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });

    clearSearch(); // Clear search highlights and input
    clearMarks(false); // Clear visual marks
    saveBoardState(); // Save the new randomized state (including cleared marks)
}

// --- Function to make all cells square and equal size ---
function equalizeCellSizes() {
    const board = document.getElementById("bingo-board");
    const cells = board?.querySelectorAll(".bingo-cell");
    if (!board || !cells || cells.length === 0) return;

    let size = 0;
    const sizeInput = document.getElementById("board-size");
    const sizeFromInput = sizeInput ? parseInt(sizeInput.value, 10) : 0;

    if (sizeFromInput && !isNaN(sizeFromInput) && sizeFromInput > 0) {
        size = sizeFromInput;
    } else {
        try {
            const gridStyle = window.getComputedStyle(board).gridTemplateColumns;
            const parts = gridStyle.split(" ");
            if (parts.length > 0 && parts[0] !== "none") {
                size = parts.length;
            }
        } catch (e) {
            console.error(
                "Could not determine grid size from styles or input.",
                e
            );
        }
    }

    if (size <= 0) {
        // Attempt to get size from a potentially existing grid setup if possible
        try {
            const gridStyle = window.getComputedStyle(board).gridTemplateColumns;
            const parts = gridStyle.split(" ");
            if (parts.length > 0 && parts[0] !== "none") {
                size = parts.length;
            }
        } catch {
            /* ignore */
        }
        if (size <= 0) {
            console.error("Failed to determine grid size.");
            showNotification("Cannot determine valid grid size. Please generate board again.", "warning");
            return; // Cannot proceed
        }
    }

    const gap = 4; // From CSS: .bingo-board { gap: 4px; }
    const minCellSize = 100; // Minimum width/height for a cell
    let maxWidthNeeded = 0;
    let maxHeightNeeded = 0;

    // 1. Reset grid sizing to allow natural measurement of cell content
    board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`; // Use fractions initially
    board.style.gridAutoRows = "auto"; // Auto height

    // 2. Force reflow to apply the reset styles before measuring
    void board.offsetHeight;

    // 3. First pass: Find the max width and max height based on actual rendered content
    cells.forEach((cell) => {
        // Reset any explicit cell styles (shouldn\'t be needed, but safe)
        cell.style.width = "";
        cell.style.height = "";

        // Measure the cell\'s natural dimensions after reflow
        const width = cell.offsetWidth;
        const height = cell.offsetHeight;
        maxWidthNeeded = Math.max(maxWidthNeeded, width);
        maxHeightNeeded = Math.max(maxHeightNeeded, height);
    });

    // 4. Determine the target size for square cells
    const targetSize = Math.max(maxWidthNeeded, maxHeightNeeded, minCellSize);

    // 5. Apply the calculated fixed size back to the grid
    board.style.gridTemplateColumns = `repeat(${size}, ${targetSize}px)`;
    board.style.gridAutoRows = `${targetSize}px`; // Make cells square

    // 6. Calculate total board width needed for the container
    const containerPadding = 32; // Based on p-4 class on #bingo-board-container (1rem = 16px, left + right = 32px)
    const totalWidth = targetSize * size + gap * (size - 1) + containerPadding;

    // 7. Update container max-width
    const boardContainer = document.getElementById("bingo-board-container");
    const boardHeader = document.getElementById("board-header");

    if (boardContainer) {
        boardContainer.style.maxWidth = `${totalWidth}px`;
    }
    if (boardHeader) {
        // Keep header consistent with board container width
        boardHeader.style.maxWidth = `${totalWidth}px`;
    }
}

function explodeBeans() {
    const container = document.querySelector('#custom-header-content');
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
    document.getElementById('background-color-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('background-color-opacity-value')) document.getElementById('background-color-opacity-value').textContent = e.target.value;
        setBackground();
        saveBackgroundSettings();
    });
    document.getElementById('gradient-color-1').addEventListener('input', () => {
        setBackground();
        saveBackgroundSettings();
    });
     document.getElementById('gradient-color-1-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('gradient-color-1-opacity-value')) document.getElementById('gradient-color-1-opacity-value').textContent = e.target.value;
        setBackground();
        saveBackgroundSettings();
    });
     document.getElementById('gradient-color-2').addEventListener('input', () => {
        setBackground();
        saveBackgroundSettings();
    });
      document.getElementById('gradient-color-2-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('gradient-color-2-opacity-value')) document.getElementById('gradient-color-2-opacity-value').textContent = e.target.value;
        setBackground();
        saveBackgroundSettings();
    });
     document.getElementById('gradient-direction').addEventListener('change', () => {
        setBackground();
        saveBackgroundSettings();
    });

    // --- Add Event Listeners for Header Controls ---
    document.getElementById('header-text-input').addEventListener('input', () => {
        saveHeaderSettings();       // Save the new text first
        updateHeaderDisplay(); // Then update display from saved state
    });
    document.getElementById('header-image-url-input').addEventListener('input', () => {
        saveHeaderSettings();       // Save the new URL first
        updateHeaderDisplay(); // Then update display from saved state
    });
    document.getElementById('header-text-color-picker').addEventListener('input', () => {
        saveHeaderSettings();
        updateHeaderDisplay();
    });
    document.getElementById('header-text-color-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('header-text-color-opacity-value')) document.getElementById('header-text-color-opacity-value').textContent = e.target.value;
        saveHeaderSettings();
        updateHeaderDisplay();
    });
    document.getElementById('header-bg-color-picker').addEventListener('input', () => {
        saveHeaderSettings();
        applyHeaderBgStyle();
    });
    document.getElementById('header-bg-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('header-bg-opacity-value')) document.getElementById('header-bg-opacity-value').textContent = e.target.value;
        saveHeaderSettings();
        applyHeaderBgStyle();
    });

    // --- Add Event Listeners for Marked Style Controls ---
    document.getElementById('marked-color-picker').addEventListener('input', () => {
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById('marked-color-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('marked-color-opacity-value')) document.getElementById('marked-color-opacity-value').textContent = e.target.value;
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById('marked-image-url-input').addEventListener('input', () => {
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById('marked-image-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('marked-image-opacity-value')) document.getElementById('marked-image-opacity-value').textContent = e.target.value;
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
    document.getElementById('marked-border-color-picker').addEventListener('input', () => {
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });
     document.getElementById('marked-border-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('marked-border-opacity-value')) document.getElementById('marked-border-opacity-value').textContent = e.target.value;
        saveMarkedStyleSettings();
        refreshMarkedCellStyles();
    });

    // --- Add Event Listeners for Default Cell Style Controls ---
    document.getElementById('cell-border-color-picker').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles(); // Update all non-marked cells
    });
    document.getElementById('cell-border-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('cell-border-opacity-value')) document.getElementById('cell-border-opacity-value').textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles(); // Update all non-marked cells
    });
    document.getElementById('cell-background-color-picker').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-background-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('cell-background-opacity-value')) document.getElementById('cell-background-opacity-value').textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-background-image-url-input').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-background-image-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('cell-background-image-opacity-value')) document.getElementById('cell-background-image-opacity-value').textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });

    // --- Add Event Listeners for Text Style Controls ---
    document.getElementById('cell-text-color-picker').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-text-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('cell-text-opacity-value')) document.getElementById('cell-text-opacity-value').textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-outline-color-picker').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-outline-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('cell-outline-opacity-value')) document.getElementById('cell-outline-opacity-value').textContent = e.target.value;
        saveCellStyleSettings();
        refreshCellStyles();
    });
    document.getElementById('cell-outline-width-input').addEventListener('input', () => {
        saveCellStyleSettings();
        refreshCellStyles();
    });

    // --- Add Event Listeners for Board Background Controls ---
    document.getElementById('board-bg-color-picker').addEventListener('input', () => {
        saveBoardBgSettings();
        applyBoardBgStyle();
    });
    document.getElementById('board-bg-image-url-input').addEventListener('input', () => {
        saveBoardBgSettings();
        applyBoardBgStyle();
    });
    document.getElementById('board-bg-color-opacity-slider').addEventListener('input', (e) => {
        if(document.getElementById('board-bg-color-opacity-value')) document.getElementById('board-bg-color-opacity-value').textContent = e.target.value;
        saveBoardBgSettings();
        applyBoardBgStyle();
    });

    // --- Search Listener ---
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const cells = document.querySelectorAll('#bingo-board .bingo-cell');

            // Split search term into words
            const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);

            cells.forEach(cell => {
                const textSpan = cell.querySelector('.bingo-cell-text');
                let isMatch = false;
                if (textSpan && searchWords.length > 0) {
                    const cellText = textSpan.textContent.trim().toLowerCase();
                    // Check if ALL search words are included in the cell text
                    isMatch = searchWords.every(word => cellText.includes(word));
                }

                // Add or remove highlight based on match status
                if (isMatch) {
                    cell.classList.add('highlighted');
                } else {
                    cell.classList.remove('highlighted');
                }
            });
        });
    }

    // --- Other Listeners ---
    window.addEventListener('resize', equalizeCellSizes);
    equalizeCellSizes(); // Initial call after load
});

// --- Settings Import/Export ---
function exportSettings() {
    const settingsToExport = {};
    const prefix = 'beango_';

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
            try {
                settingsToExport[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                settingsToExport[key] = localStorage.getItem(key);
            }
        }
    }

    if (Object.keys(settingsToExport).length === 0) {
        showNotification('No settings found to export.', 'warning');
        return;
    }

    const settingsJson = JSON.stringify(settingsToExport, null, 2); // Pretty print JSON
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    // Suggest a filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-'); // YYYY-MM-DD-HH-MM-SS
    a.download = `beango-settings-${timestamp}.json`;

    // Append the link to the body (required for Firefox), click it, and remove it
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Release the object URL
    URL.revokeObjectURL(url);

    showNotification('Settings export download started.', 'success');

    // Keep the textarea update as a visual confirmation/alternative
    const textarea = document.getElementById('settings-json');
    if (textarea) {
        textarea.value = settingsJson;
    }
}

function importSettings() {
    // Create a temporary file input element
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.accept = '.json,.txt'; // Accept JSON or text files
    tempInput.style.display = 'none'; // Hide the element

    tempInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) {
            return; // No file selected
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            let parsedSettings;

            try {
                parsedSettings = JSON.parse(fileContent);
                if (typeof parsedSettings !== 'object' || parsedSettings === null) {
                    throw new Error('Imported file does not contain a valid JSON object.');
                }
            } catch (err) {
                showNotification(`Error parsing settings file: ${err.message}`, 'error');
                return;
            }

            // Confirmation before overwriting
            if (confirm('Importing settings from this file will OVERWRITE your current settings and reload the page. Are you sure?')) {
                const prefix = 'beango_';
                const keysToRemove = [];

                // 1. Clear existing settings
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(prefix)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));

                // 2. Import new settings
                let importCount = 0;
                for (const key in parsedSettings) {
                    if (key.startsWith(prefix) && parsedSettings.hasOwnProperty(key) && parsedSettings[key] !== undefined && parsedSettings[key] !== null) {
                        const value = parsedSettings[key];
                        const valueToStore = (typeof value === 'object') ? JSON.stringify(value) : String(value);
                        localStorage.setItem(key, valueToStore);
                        importCount++;
                    } else {
                        console.warn(`Skipping import for invalid key or value: ${key}`);
                    }
                }

                showNotification(`Successfully imported ${importCount} settings from ${file.name}. Reloading...`, 'success', 1500);

                setTimeout(() => {
                    location.reload();
                }, 1600);
            }
        };

        reader.onerror = function() {
            showNotification('Error reading the selected file.', 'error');
        };

        reader.readAsText(file); // Read the file as text

        // Clean up the temporary input element
        document.body.removeChild(tempInput);
    });

    // Append to body and trigger click to open file dialog
    document.body.appendChild(tempInput);
    tempInput.click();
}
