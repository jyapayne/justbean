import * as vars from './variables.js';
import { showNotification, hexToRgba, setupInputListener, setupOpacitySliderListener, _restoreOpacitySetting, _restoreColorPickerSetting, _restoreInputSetting } from './utils.js';

let currentItems = []; // Holds the original list of items provided by the user
let displayedItems = []; // Holds the items currently displayed on the board

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
    localStorage.setItem(vars.LS_BACKGROUND_TYPE, backgroundType);

    if (backgroundType === 'solid') {
        localStorage.setItem(vars.LS_SOLID_COLOR, document.getElementById('background-color-picker').value);
        localStorage.setItem(vars.LS_SOLID_COLOR_OPACITY, document.getElementById('background-color-opacity-slider').value);
        // Optionally remove gradient keys
        localStorage.removeItem(vars.LS_GRADIENT_COLOR_1);
        localStorage.removeItem(vars.LS_GRADIENT_COLOR_1_OPACITY);
        localStorage.removeItem(vars.LS_GRADIENT_COLOR_2);
        localStorage.removeItem(vars.LS_GRADIENT_COLOR_2_OPACITY);
        localStorage.removeItem(vars.LS_GRADIENT_DIRECTION);
    } else {
        localStorage.setItem(vars.LS_GRADIENT_COLOR_1, document.getElementById('gradient-color-1').value);
        localStorage.setItem(vars.LS_GRADIENT_COLOR_1_OPACITY, document.getElementById('gradient-color-1-opacity-slider').value);
        localStorage.setItem(vars.LS_GRADIENT_COLOR_2, document.getElementById('gradient-color-2').value);
        localStorage.setItem(vars.LS_GRADIENT_COLOR_2_OPACITY, document.getElementById('gradient-color-2-opacity-slider').value);
        localStorage.setItem(vars.LS_GRADIENT_DIRECTION, document.getElementById('gradient-direction').value);
        // Optionally remove solid key
        localStorage.removeItem(vars.LS_SOLID_COLOR);
        localStorage.removeItem(vars.LS_SOLID_COLOR_OPACITY);
    }
}

export function toggleConfig() {
    const pane = document.getElementById('config-pane');
    const isOpen = pane.classList.contains('config-pane-open');

    if (isOpen) {
        pane.classList.remove('config-pane-open');
        pane.classList.add('config-pane-closed');
        localStorage.setItem(vars.LS_CONFIG_OPEN, 'false');
    } else {
        pane.classList.remove('config-pane-closed');
        pane.classList.add('config-pane-open');
        localStorage.setItem(vars.LS_CONFIG_OPEN, 'true');
    }
}

document.getElementById('file-input').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('cell-contents').value = e.target.result;
            showNotification('File loaded. Click Generate/Update to use items.', 'success');
        };
        reader.onerror = function () {
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
    localStorage.setItem(vars.LS_MARKED_COLOR, document.getElementById('marked-color-picker').value);
    localStorage.setItem(vars.LS_MARKED_COLOR_OPACITY, document.getElementById('marked-color-opacity-slider').value);
    localStorage.setItem(vars.LS_MARKED_IMAGE_URL, document.getElementById('marked-image-url-input').value);
    localStorage.setItem(vars.LS_MARKED_IMAGE_OPACITY, document.getElementById('marked-image-opacity-slider').value); // Save image opacity

    // Save marked border color and its opacity
    localStorage.setItem(vars.LS_MARKED_BORDER_COLOR, document.getElementById('marked-border-color-picker').value);
    localStorage.setItem(vars.LS_MARKED_BORDER_OPACITY, document.getElementById('marked-border-opacity-slider').value);
    // Save marked border width
    localStorage.setItem(vars.LS_MARKED_BORDER_WIDTH, document.getElementById('marked-border-width-input').value);

    // Save marked text styles
    localStorage.setItem(vars.LS_MARKED_CELL_TEXT_COLOR, document.getElementById('marked-cell-text-color-picker').value);
    localStorage.setItem(vars.LS_MARKED_CELL_TEXT_OPACITY, document.getElementById('marked-cell-text-opacity-slider').value);
    localStorage.setItem(vars.LS_MARKED_CELL_OUTLINE_COLOR, document.getElementById('marked-cell-outline-color-picker').value);
    localStorage.setItem(vars.LS_MARKED_CELL_OUTLINE_OPACITY, document.getElementById('marked-cell-outline-opacity-slider').value);
    localStorage.setItem(vars.LS_MARKED_CELL_OUTLINE_WIDTH, document.getElementById('marked-cell-outline-width-input').value);
}

// --- Apply saved marked styles to a cell ---
function applyMarkedCellStyle(cell) {
    if (!cell) return;

    const isMarked = cell.classList.contains('marked');
    const color = localStorage.getItem(vars.LS_MARKED_COLOR) || vars.DEFAULT_MARKED_COLOR;
    const colorOpacity = parseInt(localStorage.getItem(vars.LS_MARKED_COLOR_OPACITY) || vars.DEFAULT_MARKED_COLOR_OPACITY, 10);
    const imageUrl = localStorage.getItem(vars.LS_MARKED_IMAGE_URL) || vars.DEFAULT_MARKED_IMAGE_URL;
    const imageOpacity = parseInt(localStorage.getItem(vars.LS_MARKED_IMAGE_OPACITY) || vars.DEFAULT_MARKED_IMAGE_OPACITY, 10);
    const borderColor = localStorage.getItem(vars.LS_MARKED_BORDER_COLOR) || vars.DEFAULT_MARKED_BORDER_COLOR;
    const borderOpacity = parseInt(localStorage.getItem(vars.LS_MARKED_BORDER_OPACITY) || vars.DEFAULT_MARKED_BORDER_OPACITY, 10);

    // Reset potentially conflicting styles before applying new ones
    cell.style.backgroundColor = '';
    cell.style.backgroundImage = '';
    // Don't reset border color here, let applyCellStyle handle default if unmarked

    if (isMarked) {
        // Apply marked border color + opacity
        cell.style.borderColor = hexToRgba(borderColor, borderOpacity);
        // Apply marked border width
        let markedBorderWidth = parseInt(localStorage.getItem(vars.LS_MARKED_BORDER_WIDTH) || vars.DEFAULT_MARKED_BORDER_WIDTH, 10);
        if (isNaN(markedBorderWidth) || markedBorderWidth < 0) { // Add check for NaN and negative
            markedBorderWidth = vars.DEFAULT_MARKED_BORDER_WIDTH;
        }
        cell.style.borderWidth = `${markedBorderWidth}px`;

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
            const textColor = localStorage.getItem(vars.LS_MARKED_CELL_TEXT_COLOR) || vars.DEFAULT_MARKED_CELL_TEXT_COLOR;
            const textOpacity = parseInt(localStorage.getItem(vars.LS_MARKED_CELL_TEXT_OPACITY) || vars.DEFAULT_MARKED_CELL_TEXT_OPACITY, 10);
            const outlineColor = localStorage.getItem(vars.LS_MARKED_CELL_OUTLINE_COLOR) || vars.DEFAULT_MARKED_CELL_OUTLINE_COLOR;
            const outlineOpacity = parseInt(localStorage.getItem(vars.LS_MARKED_CELL_OUTLINE_OPACITY) || vars.DEFAULT_MARKED_CELL_OUTLINE_OPACITY, 10);
            let outlineWidth = parseFloat(localStorage.getItem(vars.LS_MARKED_CELL_OUTLINE_WIDTH));
            // Default check: // Add log before default check
            if (isNaN(outlineWidth) || outlineWidth < 0) {
                outlineWidth = vars.DEFAULT_MARKED_CELL_OUTLINE_WIDTH;
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
    localStorage.setItem(vars.LS_HEADER_TEXT, document.getElementById('header-text-input').value);
    localStorage.setItem(vars.LS_HEADER_IMAGE_URL, document.getElementById('header-image-url-input').value);
    localStorage.setItem(vars.LS_HEADER_TEXT_COLOR, document.getElementById('header-text-color-picker').value);
    localStorage.setItem(vars.LS_HEADER_TEXT_COLOR_OPACITY, document.getElementById('header-text-color-opacity-slider').value);
    localStorage.setItem(vars.LS_HEADER_TEXT_FONT_SIZE, document.getElementById('header-text-font-size-input').value); // Save font size
    localStorage.setItem(vars.LS_HEADER_TEXT_FONT_FAMILY, document.getElementById('header-text-font-family-select').value); // Save font family
    // Save header background
    localStorage.setItem(vars.LS_HEADER_BG_COLOR, document.getElementById('header-bg-color-picker').value);
    localStorage.setItem(vars.LS_HEADER_BG_OPACITY, document.getElementById('header-bg-opacity-slider').value);
    // Save header text outline
    localStorage.setItem(vars.LS_HEADER_TEXT_OUTLINE_COLOR, document.getElementById('header-text-outline-color-picker').value);
    localStorage.setItem(vars.LS_HEADER_TEXT_OUTLINE_OPACITY, document.getElementById('header-text-outline-opacity-slider').value);
    localStorage.setItem(vars.LS_HEADER_TEXT_OUTLINE_WIDTH, document.getElementById('header-text-outline-width-input').value);
    // Save header font style
    localStorage.setItem(vars.LS_HEADER_TEXT_STYLE_ITALIC, document.getElementById('header-text-style-italic').checked);
    localStorage.setItem(vars.LS_HEADER_TEXT_STYLE_BOLD, document.getElementById('header-text-style-bold').checked);
}

// --- Function to apply header background style ---
function applyHeaderBgStyle() {
    const headerElement = document.getElementById('board-header');
    if (!headerElement) return;

    const bgColor = localStorage.getItem(vars.LS_HEADER_BG_COLOR) || vars.DEFAULT_HEADER_BG_COLOR;
    const opacity = parseInt(localStorage.getItem(vars.LS_HEADER_BG_OPACITY) || vars.DEFAULT_HEADER_BG_OPACITY, 10);

    headerElement.style.backgroundColor = hexToRgba(bgColor, opacity);
}

// --- Function to update the header display ---
function updateHeaderDisplay() {
    // Read text, applying default ONLY if the key is missing
    let headerText = localStorage.getItem(vars.LS_HEADER_TEXT);
    if (headerText === null) { // Check if key exists
        headerText = vars.DEFAULT_HEADER_TEXT; // Apply default only if key missing
    }
    // Read image URL: use stored value if key exists, otherwise use default
    let headerImageUrl = localStorage.getItem(vars.LS_HEADER_IMAGE_URL);
    if (headerImageUrl === null) { // Check if key exists in localStorage
        headerImageUrl = vars.DEFAULT_HEADER_IMAGE_URL; // Apply default ONLY if key is missing
    }
    const headerContainer = document.getElementById("custom-header-content");

    if (!headerContainer) return;

    // Clear existing content
    headerContainer.innerHTML = "";

    // Get default color and opacity
    let headerTextColor = localStorage.getItem(vars.LS_HEADER_TEXT_COLOR);
    if (headerTextColor === null) { // Check if key exists before applying default
        headerTextColor = vars.DEFAULT_HEADER_TEXT_COLOR;
    }
    let headerTextOpacity = localStorage.getItem(vars.LS_HEADER_TEXT_COLOR_OPACITY);
    if (headerTextOpacity === null) {
        headerTextOpacity = vars.DEFAULT_HEADER_TEXT_COLOR_OPACITY;
    }
    let headerStyleItalic = localStorage.getItem(vars.LS_HEADER_TEXT_STYLE_ITALIC) === 'true'; // Convert string to boolean
    let headerStyleBold = localStorage.getItem(vars.LS_HEADER_TEXT_STYLE_BOLD) === 'true'; // Convert string to boolean
    const rgbaDefaultColor = hexToRgba(headerTextColor, parseInt(headerTextOpacity, 10));

    // Get outline settings
    let headerOutlineColor = localStorage.getItem(vars.LS_HEADER_TEXT_OUTLINE_COLOR);
    if (headerOutlineColor === null) headerOutlineColor = vars.DEFAULT_HEADER_TEXT_OUTLINE_COLOR;
    let headerOutlineOpacity = localStorage.getItem(vars.LS_HEADER_TEXT_OUTLINE_OPACITY);
    if (headerOutlineOpacity === null) headerOutlineOpacity = vars.DEFAULT_HEADER_TEXT_OUTLINE_OPACITY;
    let headerOutlineWidth = parseFloat(localStorage.getItem(vars.LS_HEADER_TEXT_OUTLINE_WIDTH));
    if (isNaN(headerOutlineWidth) || headerOutlineWidth < 0) {
        headerOutlineWidth = vars.DEFAULT_HEADER_TEXT_OUTLINE_WIDTH;
    }

    let hasText = headerText && headerText.trim() !== "";
    // Determine if we are currently using the default bean URL
    let isUsingDefaultBeanUrl = headerImageUrl === vars.DEFAULT_HEADER_IMAGE_URL;
    // Determine if there is a custom image (non-empty URL that isn't the default bean)
    let hasCustomImage = headerImageUrl && headerImageUrl.trim() !== "" && !isUsingDefaultBeanUrl;

    // Add text if it exists
    if (hasText) {
        const h1 = document.createElement("h1");
        // Remove default text-4xl and font-bold, apply font size/family/style/weight via style
        // h1.className = "";
        // Get and apply font size
        let headerFontSize = parseInt(localStorage.getItem(vars.LS_HEADER_TEXT_FONT_SIZE), 10);
        if (isNaN(headerFontSize) || headerFontSize <= 0) {
            headerFontSize = vars.DEFAULT_HEADER_TEXT_FONT_SIZE;
        }
        h1.style.fontSize = `${headerFontSize}px`; // Apply font size
        // Get and apply font family
        const headerFontFamily = localStorage.getItem(vars.LS_HEADER_TEXT_FONT_FAMILY) || vars.DEFAULT_HEADER_TEXT_FONT_FAMILY;
        h1.style.fontFamily = headerFontFamily; // Apply font family

        // Apply font style and weight
        h1.style.fontStyle = headerStyleItalic ? 'italic' : 'normal';
        h1.style.fontWeight = headerStyleBold ? 'bold' : 'normal';

        h1.style.color = rgbaDefaultColor; // Apply default color+opacity to H1
        // Apply outline to H1
        if (headerOutlineWidth > 0) {
            const rgbaOutlineColor = hexToRgba(headerOutlineColor, parseInt(headerOutlineOpacity, 10));
            const shadow = `
                -${headerOutlineWidth}px -${headerOutlineWidth}px 0 ${rgbaOutlineColor},
                 ${headerOutlineWidth}px -${headerOutlineWidth}px 0 ${rgbaOutlineColor},
                -${headerOutlineWidth}px  ${headerOutlineWidth}px 0 ${rgbaOutlineColor},
                 ${headerOutlineWidth}px  ${headerOutlineWidth}px 0 ${rgbaOutlineColor},
                 ${headerOutlineWidth}px  0   0 ${rgbaOutlineColor},
                -${headerOutlineWidth}px  0   0 ${rgbaOutlineColor},
                 0   ${headerOutlineWidth}px 0 ${rgbaOutlineColor},
                 0   -${headerOutlineWidth}px 0 ${rgbaOutlineColor}
            `;
            h1.style.textShadow = shadow;
        } else {
            h1.style.textShadow = "none";
        }

        // Split the header text by spaces, but keep the spaces as separate elements
        const parts = headerText.trim().split(/(\s+)/);

        parts.forEach(part => {
            if (!part) return; // Skip empty parts resulting from split

            if (part.match(/^\s+$/)) {
                // If the part is only whitespace, add it as a text node to preserve spacing
                h1.appendChild(document.createTextNode(part));
            } else {
                // Check if the part matches the Word[color] pattern exactly
                // Regex: Start (^), Word (\S+?), literal \[, capture color ([^\\\]]+?), literal \], End ($)
                const tagMatch = part.match(/^(\S+?)\[([^\]]+?)\]$/);
                if (tagMatch) {
                    const word = tagMatch[1];
                    const color = tagMatch[2].trim(); // Extract and trim color
                    const span = document.createElement("span");
                    span.textContent = word; // Only the word part
                    if (color) { // Check if color is not empty after trim
                        span.style.color = color; // Apply specific color
                    }
                    // If color was empty or invalid, it inherits the default from h1
                    h1.appendChild(span);
                } else {
                    // Part is just a regular word (or doesn't match the pattern)
                    const span = document.createElement("span");
                    span.textContent = part; // Add the whole part as is
                    // Inherits default color and outline from h1
                    h1.appendChild(span);
                }
            }
        });

        headerContainer.appendChild(h1);
    }

    // Add custom image if URL exists and it's not the default bean URL
    if (hasCustomImage) {
        // create a div and an image element
        const div = document.createElement('div');
        const img = document.createElement('img');
        div.id = 'header-image-container';
        img.id = 'header-image';
        img.src = headerImageUrl;
        img.alt = "Custom Header Image";
        img.className = "max-h-16 max-w-full object-contain"; // Adjust size as needed
        img.onerror = () => {
            img.remove(); // Remove broken image placeholder
            showNotification("Could not load custom header image.", "warning");
            // No fallback logic here. If custom image fails, it's just gone.
        };
        div.appendChild(img);
        headerContainer.appendChild(div);
    }
    // If there is NO text and NO custom image, AND we ended up using the default bean URL, add the default bean
    else if (!hasText && !hasCustomImage && isUsingDefaultBeanUrl) {
        addDefaultBean(headerContainer);
    }
    // Implicitly, if there IS text but NO custom image, nothing else is added here.
    // If the user set the URL to "", hasCustomImage will be false, and isUsingDefaultBeanUrl will be false, so nothing is added.
}

// Helper to add the default bean image
function addDefaultBean(container) {
    // create a div and an image element
    const div = document.createElement('div');
    const img = document.createElement('img');
    div.id = 'bean-container';
    img.id = 'bean';
    img.src = '/bean.svg';
    img.alt = 'Bean';
    img.className = 'w-16 h-16 cursor-pointer'; // Use consistent size
    img.onclick = (event) => explodeBeans(event);
    div.appendChild(img);
    container.appendChild(div);
}

// --- Save current default cell style settings to localStorage ---
function saveCellStyleSettings() {
    localStorage.setItem(vars.LS_CELL_BORDER_COLOR, document.getElementById('cell-border-color-picker').value);
    localStorage.setItem(vars.LS_CELL_BORDER_OPACITY, document.getElementById('cell-border-opacity-slider').value);
    localStorage.setItem(vars.LS_CELL_BORDER_WIDTH, document.getElementById('cell-border-width-input').value);
    localStorage.setItem(vars.LS_CELL_BG_COLOR, document.getElementById('cell-background-color-picker').value);
    localStorage.setItem(vars.LS_CELL_BG_OPACITY, document.getElementById('cell-background-opacity-slider').value);
    localStorage.setItem(vars.LS_CELL_BG_IMAGE_URL, document.getElementById('cell-background-image-url-input').value);
    localStorage.setItem(vars.LS_CELL_BG_IMAGE_OPACITY, document.getElementById('cell-background-image-opacity-slider').value); // Save image opacity
    // Save text styles
    localStorage.setItem(vars.LS_CELL_TEXT_COLOR, document.getElementById('cell-text-color-picker').value);
    localStorage.setItem(vars.LS_CELL_TEXT_OPACITY, document.getElementById('cell-text-opacity-slider').value);
    localStorage.setItem(vars.LS_CELL_OUTLINE_COLOR, document.getElementById('cell-outline-color-picker').value);
    localStorage.setItem(vars.LS_CELL_OUTLINE_OPACITY, document.getElementById('cell-outline-opacity-slider').value);
    localStorage.setItem(vars.LS_CELL_OUTLINE_WIDTH, document.getElementById('cell-outline-width-input').value);
}

// --- Apply saved default cell styles to a cell ---
function applyCellStyle(cell) {
    if (!cell || cell.classList.contains('marked')) return; // Only apply to non-marked cells

    // Borders
    const borderColor = localStorage.getItem(vars.LS_CELL_BORDER_COLOR) || vars.DEFAULT_CELL_BORDER_COLOR;
    const borderOpacity = parseInt(localStorage.getItem(vars.LS_CELL_BORDER_OPACITY) || vars.DEFAULT_CELL_BORDER_OPACITY, 10);
    cell.style.borderColor = hexToRgba(borderColor, borderOpacity);
    // Apply border width
    let borderWidth = parseInt(localStorage.getItem(vars.LS_CELL_BORDER_WIDTH) || vars.DEFAULT_CELL_BORDER_WIDTH, 10);
    if (isNaN(borderWidth) || borderWidth < 0) { // Add check for NaN and negative
        borderWidth = vars.DEFAULT_CELL_BORDER_WIDTH;
    }
    cell.style.borderWidth = `${borderWidth}px`;

    // Background Color / Image
    const bgColor = localStorage.getItem(vars.LS_CELL_BG_COLOR) || vars.DEFAULT_CELL_BG_COLOR;
    const bgOpacity = parseInt(localStorage.getItem(vars.LS_CELL_BG_OPACITY) || vars.DEFAULT_CELL_BG_OPACITY, 10);
    const bgImageUrl = localStorage.getItem(vars.LS_CELL_BG_IMAGE_URL) || vars.DEFAULT_CELL_BG_IMAGE_URL;
    const bgImageOpacity = parseInt(localStorage.getItem(vars.LS_CELL_BG_IMAGE_OPACITY) || vars.DEFAULT_CELL_BG_IMAGE_OPACITY, 10);
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
        const textColor = localStorage.getItem(vars.LS_CELL_TEXT_COLOR) || vars.DEFAULT_CELL_TEXT_COLOR;
        const textOpacity = parseInt(localStorage.getItem(vars.LS_CELL_TEXT_OPACITY) || vars.DEFAULT_CELL_TEXT_OPACITY, 10);
        const outlineColor = localStorage.getItem(vars.LS_CELL_OUTLINE_COLOR) || vars.DEFAULT_CELL_OUTLINE_COLOR;
        const outlineOpacity = parseInt(localStorage.getItem(vars.LS_CELL_OUTLINE_OPACITY) || vars.DEFAULT_CELL_OUTLINE_OPACITY, 10);
        let outlineWidth = parseFloat(localStorage.getItem(vars.LS_CELL_OUTLINE_WIDTH));
        if (isNaN(outlineWidth) || outlineWidth < 0) outlineWidth = vars.DEFAULT_CELL_OUTLINE_WIDTH;

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
    localStorage.setItem(vars.LS_BOARD_BG_COLOR, document.getElementById('board-bg-color-picker').value);
    localStorage.setItem(vars.LS_BOARD_BG_IMAGE_URL, document.getElementById('board-bg-image-url-input').value);
    localStorage.setItem(vars.LS_BOARD_BG_COLOR_OPACITY, document.getElementById('board-bg-color-opacity-slider').value); // Use new ID & key
    localStorage.setItem(vars.LS_BOARD_BG_IMAGE_OPACITY, document.getElementById('board-bg-image-opacity-slider').value); // NEW
}

// --- Apply board background style ---
function applyBoardBgStyle() {
    const container = document.getElementById('bingo-board-container');
    if (!container) return;

    const bgColor = localStorage.getItem(vars.LS_BOARD_BG_COLOR) || vars.DEFAULT_BOARD_BG_COLOR;
    const bgImageUrl = localStorage.getItem(vars.LS_BOARD_BG_IMAGE_URL) || vars.DEFAULT_BOARD_BG_IMAGE_URL;
    const bgColorOpacity = parseInt(localStorage.getItem(vars.LS_BOARD_BG_COLOR_OPACITY) || vars.DEFAULT_BOARD_BG_COLOR_OPACITY, 10);
    const bgImageOpacity = parseInt(localStorage.getItem(vars.LS_BOARD_BG_IMAGE_OPACITY) || vars.DEFAULT_BOARD_BG_IMAGE_OPACITY, 10); // NEW

    // Apply background color directly to the container
    container.style.backgroundColor = hexToRgba(bgColor, bgColorOpacity);

    // Apply background image via CSS variables for the pseudo-element
    if (bgImageUrl && bgImageUrl.trim() !== '') {
        container.style.setProperty('--board-bg-image-url', `url('${bgImageUrl}')`);
        container.style.setProperty('--board-bg-image-opacity', bgImageOpacity / 100);
    } else {
        container.style.removeProperty('--board-bg-image-url');
        container.style.removeProperty('--board-bg-image-opacity');
    }
}

// Helper to save board state
function saveBoardState() {
    const sizeInput = document.getElementById('board-size');
    const size = sizeInput ? parseInt(sizeInput.value, 10) : 5; // Default to 5 if input missing
    const markedIndices = getMarkedIndices();
    const originalUserItems = getItemsFromInput(); // Get current text from textarea

    localStorage.setItem(vars.LS_BOARD_SIZE, size);
    localStorage.setItem(vars.LS_CELL_ITEMS, JSON.stringify(currentItems)); // Save items potentially on board (padded/sliced)
    localStorage.setItem(vars.LS_DISPLAYED_ITEMS, JSON.stringify(displayedItems)); // Save displayed items
    localStorage.setItem(vars.LS_MARKED_INDICES, JSON.stringify(markedIndices));
    localStorage.setItem(vars.LS_ORIGINAL_ITEMS, JSON.stringify(originalUserItems)); // Save user's raw input from textarea
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
    // localStorage.setItem(vars.LS_ORIGINAL_ITEMS, JSON.stringify(originalUserItems)); // Moved to saveBoardState

    const requiredItems = size * size;
    let itemsForBoard = [...originalUserItems]; // Start with a copy of the user's raw input
    let notificationMessage = 'Board generated successfully!';
    let notificationType = 'success';

    if (itemsForBoard.length < requiredItems) {
        const diff = requiredItems - itemsForBoard.length;
        notificationMessage = `Warning: Needed ${requiredItems} items, found ${itemsForBoard.length}. Padding with ${diff} placeholder(s).`;
        notificationType = 'warning';
        for (let i = 0; i < diff; i++) {
            itemsForBoard.push(`Placeholder ${i + 1}`);
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
    // localStorage.setItem(vars.LS_CELL_ITEMS, JSON.stringify(currentItems)); // Moved to saveBoardState

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

}

function randomizeBoard() {
    const storedItemsRaw = localStorage.getItem(vars.LS_CELL_ITEMS);
    const sizeRaw = localStorage.getItem(vars.LS_BOARD_SIZE);

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
            // applyMarkedCellStyle(cell); // Redundant call removed
            // Apply default style ONLY to the cell just unmarked
            applyCellStyle(cell);
        }
        // Ensure styles are reset even if class was somehow missing
        // applyCellStyle(cell); // REMOVED Unconditional call
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
    localStorage.removeItem(vars.LS_BOARD_SIZE);
    localStorage.removeItem(vars.LS_CELL_ITEMS); // The items configured for the board (padded/sliced)
    localStorage.removeItem(vars.LS_DISPLAYED_ITEMS); // The current layout
    localStorage.removeItem(vars.LS_MARKED_INDICES);
    localStorage.removeItem(vars.LS_ORIGINAL_ITEMS); // User's raw input

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
export function resetAllSettings() {
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

function loadPaneState(configIsOpen) {
    const pane = document.getElementById('config-pane');
    if (configIsOpen) {
        pane.classList.remove('config-pane-closed');
        pane.classList.add('config-pane-open');
    } else {
        pane.classList.remove('config-pane-open');
        pane.classList.add('config-pane-closed');
    }
}

function generateDefaultBoard() {
    // --- No saved board state, GENERATE DEFAULT board ---
    console.log('No saved board state found. Generating default 5x5 board.');
    const defaultSize = 5;
    currentItems = [...vars.DEFAULT_SAMPLE_ITEMS]; // Set global variable
    displayedItems = shuffleArray([...vars.DEFAULT_SAMPLE_ITEMS]); // Set global variable
    const originalItems = [...vars.DEFAULT_SAMPLE_ITEMS]; // For text area

    const board = document.getElementById('bingo-board');
    board.innerHTML = ''; // Clear placeholder or previous error message
    board.style.gridTemplateColumns = `repeat(${defaultSize}, minmax(0, 1fr))`;

    // Update UI inputs to reflect default
    document.getElementById('board-size').value = defaultSize;
    document.getElementById('cell-contents').value = originalItems.join('\n');

    displayedItems.forEach((item, index) => {
        const cell = document.createElement("div");
        cell.classList.add("bingo-cell", "cursor-pointer");
        cell.dataset.index = index;
        cell.onclick = () => selectCell(cell);

        const textSpan = document.createElement("span");
        textSpan.classList.add("bingo-cell-text");
        textSpan.textContent = item;
        cell.appendChild(textSpan);

        applyCellStyle(cell); // Apply default styles

        // No marked cells on default board
        board.appendChild(cell);
    });

    // Save this default state immediately
    saveBoardState();
    showNotification('Generated default 5x5 board.', 'info');
    // --- End GENERATE DEFAULT board ---
}

function generateBoardFromSavedState(savedDisplayedItems, savedItemsText, savedMarkedIndices, size) {

    console.log("Found saved board state. Loading..."); // Log loading source
    try {
        displayedItems = JSON.parse(savedDisplayedItems); // Restore displayed items array
        // *** ADDED: Restore currentItems as well ***
        if (savedItemsText) {
            try {
                currentItems = JSON.parse(savedItemsText);
                if (!Array.isArray(currentItems)) {
                    console.warn('Loaded vars.LS_CELL_ITEMS was not an array, resetting.');
                    currentItems = [];
                }
            } catch (e) {
                showNotification('Error parsing saved cell item pool (vars.LS_CELL_ITEMS). Board may not randomize correctly.', 'warning');
                currentItems = []; // Reset on parse error
            }
        } else {
            // If vars.LS_CELL_ITEMS doesn't exist but vars.LS_DISPLAYED_ITEMS does, it's an inconsistent state.
            console.warn('Inconsistent state: vars.LS_DISPLAYED_ITEMS exists but vars.LS_CELL_ITEMS is missing. Randomization might fail.');
            currentItems = [];
        }
        // *** END ADDED section ***
    } catch (e) {
        showNotification('Error parsing saved board state. Please generate again.', 'error');
        localStorage.removeItem(vars.LS_DISPLAYED_ITEMS);
        localStorage.removeItem(vars.LS_MARKED_INDICES);
        localStorage.removeItem(vars.LS_CELL_ITEMS); // Also remove potentially corrupted items
        displayedItems = [];
        currentItems = []; // Also reset currentItems
        document.getElementById('bingo-board').innerHTML = '<div class="bingo-cell">Error loading board. Generate New.</div>';
        // Don't return yet, let style loading proceed with defaults
    }

    const requiredItems = size * size;

    // Check if the loaded data is consistent
    if (!Array.isArray(displayedItems) || displayedItems.length !== requiredItems) {
        showNotification("Saved board data mismatch. Please generate again.", 'warning');
        localStorage.removeItem(vars.LS_DISPLAYED_ITEMS);
        localStorage.removeItem(vars.LS_MARKED_INDICES);
        localStorage.removeItem(vars.LS_CELL_ITEMS);
        displayedItems = [];
        currentItems = [];
        document.getElementById('bingo-board').innerHTML = '<div class="bingo-cell">Data Mismatch. Generate New.</div>';
        // Don't return yet
    } else {
        // --- Populate board from SAVED state ---
        const board = document.getElementById('bingo-board');
        board.innerHTML = ''; // Clear placeholder
        board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;

        const markedIndices = savedMarkedIndices ? JSON.parse(savedMarkedIndices) : [];

        displayedItems.forEach((item, index) => {
            const cell = document.createElement("div");
            cell.classList.add("bingo-cell", "cursor-pointer");
            cell.dataset.index = index;
            cell.onclick = () => selectCell(cell);

            const textSpan = document.createElement("span");
            textSpan.classList.add("bingo-cell-text");
            textSpan.textContent = item;
            cell.appendChild(textSpan);

            applyCellStyle(cell); // Apply default styles first

            if (markedIndices.includes(index)) {
                cell.classList.add("marked");
                applyMarkedCellStyle(cell); // Apply marked styles if needed
            }
            board.appendChild(cell);
        });
    }
    // --- End populate board from SAVED state ---
}

function restoreBackgroundSettings() {
    // --- Restore Background Settings ---
    const savedBackgroundType = localStorage.getItem(vars.LS_BACKGROUND_TYPE) || 'gradient'; // Default to gradient
    const savedSolidColor = localStorage.getItem(vars.LS_SOLID_COLOR) || vars.DEFAULT_SOLID_COLOR;
    const savedSolidColorOpacity = localStorage.getItem(vars.LS_SOLID_COLOR_OPACITY) || vars.DEFAULT_SOLID_COLOR_OPACITY;
    const savedGradientColor1 = localStorage.getItem(vars.LS_GRADIENT_COLOR_1) || vars.DEFAULT_GRADIENT_COLOR_1;
    const savedGradientColor1Opacity = localStorage.getItem(vars.LS_GRADIENT_COLOR_1_OPACITY) || vars.DEFAULT_GRADIENT_COLOR_1_OPACITY;
    const savedGradientColor2 = localStorage.getItem(vars.LS_GRADIENT_COLOR_2) || vars.DEFAULT_GRADIENT_COLOR_2;
    const savedGradientColor2Opacity = localStorage.getItem(vars.LS_GRADIENT_COLOR_2_OPACITY) || vars.DEFAULT_GRADIENT_COLOR_2_OPACITY;
    const savedGradientDirection = localStorage.getItem(vars.LS_GRADIENT_DIRECTION) || vars.DEFAULT_GRADIENT_DIRECTION;

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
}

function restoreHeaderSettings(savedHeaderText, savedHeaderImageUrl, savedHeaderTextColor, savedHeaderTextOpacity, savedHeaderBgColor, savedHeaderBgOpacity,
    savedHeaderOutlineColor, savedHeaderOutlineOpacity, savedHeaderOutlineWidth, savedHeaderFontSize, savedHeaderFontFamily,
    savedHeaderStyleItalic, savedHeaderStyleBold) {
    _restoreInputSetting('header-text-input', savedHeaderText);
    // if the header image is the default bean, then add the explodeBeans function to the onclick event
    _restoreInputSetting('header-image-url-input', savedHeaderImageUrl);
    _restoreColorPickerSetting('header-text-color-picker', savedHeaderTextColor);
    _restoreOpacitySetting('header-text-color-opacity-slider', 'header-text-color-opacity-value', savedHeaderTextOpacity);
    // Restore header font size input
    _restoreInputSetting('header-text-font-size-input', savedHeaderFontSize);
    // Restore header font family select
    _restoreInputSetting('header-text-font-family-select', savedHeaderFontFamily);
    // Restore header background inputs
    _restoreColorPickerSetting('header-bg-color-picker', savedHeaderBgColor);
    _restoreOpacitySetting('header-bg-opacity-slider', 'header-bg-opacity-value', savedHeaderBgOpacity);
    // Restore header text outline inputs
    _restoreColorPickerSetting('header-text-outline-color-picker', savedHeaderOutlineColor);
    _restoreOpacitySetting('header-text-outline-opacity-slider', 'header-text-outline-opacity-value', savedHeaderOutlineOpacity);
    _restoreInputSetting('header-text-outline-width-input', savedHeaderOutlineWidth);
    // Restore header font style checkboxes
    _restoreCheckboxSetting('header-text-style-italic', savedHeaderStyleItalic);
    _restoreCheckboxSetting('header-text-style-bold', savedHeaderStyleBold);

    applyHeaderBgStyle(); // Apply header background style
    updateHeaderDisplay(); // Apply the loaded header content
}

function restoreMarkedStyleSettings(savedMarkedColor, savedMarkedColorOpacity, savedMarkedImageUrl, savedMarkedImageOpacity, savedMarkedBorderColor, savedMarkedBorderOpacity, savedMarkedCellTextColor, savedMarkedCellTextOpacity, savedMarkedCellOutlineColor, savedMarkedCellOutlineOpacity, savedMarkedCellOutlineWidth, savedMarkedBorderWidth) {
    // Marked Color
    _restoreColorPickerSetting('marked-color-picker', savedMarkedColor);
    _restoreOpacitySetting('marked-color-opacity-slider', 'marked-color-opacity-value', savedMarkedColorOpacity);

    // Marked Image
    _restoreInputSetting('marked-image-url-input', savedMarkedImageUrl);
    _restoreOpacitySetting('marked-image-opacity-slider', 'marked-image-opacity-value', savedMarkedImageOpacity);

    // Marked Border
    _restoreColorPickerSetting('marked-border-color-picker', savedMarkedBorderColor);
    _restoreOpacitySetting('marked-border-opacity-slider', 'marked-border-opacity-value', savedMarkedBorderOpacity);
    // Save marked border width
    _restoreInputSetting('marked-border-width-input', savedMarkedBorderWidth);

    // Marked Text Color
    _restoreColorPickerSetting('marked-cell-text-color-picker', savedMarkedCellTextColor);
    _restoreOpacitySetting('marked-cell-text-opacity-slider', 'marked-cell-text-opacity-value', savedMarkedCellTextOpacity);

    // Marked Text Outline
    _restoreColorPickerSetting('marked-cell-outline-color-picker', savedMarkedCellOutlineColor);
    _restoreOpacitySetting('marked-cell-outline-opacity-slider', 'marked-cell-outline-opacity-value', savedMarkedCellOutlineOpacity);
    _restoreInputSetting('marked-cell-outline-width-input', savedMarkedCellOutlineWidth);
}


function restoreCellStyleSettings(savedCellBorderColor, savedCellBorderOpacity, savedCellBgColor, savedCellBgOpacity, savedCellBgImageUrl, savedCellBgImageOpacity, savedCellTextColor, savedCellTextOpacity, savedCellOutlineColor, savedCellOutlineOpacity, savedCellOutlineWidth, savedCellBorderWidth) {
    // Border
    _restoreColorPickerSetting('cell-border-color-picker', savedCellBorderColor);
    _restoreOpacitySetting('cell-border-opacity-slider', 'cell-border-opacity-value', savedCellBorderOpacity);
    // Apply border width
    _restoreInputSetting('cell-border-width-input', savedCellBorderWidth);

    // Background Color
    _restoreColorPickerSetting('cell-background-color-picker', savedCellBgColor);
    _restoreOpacitySetting('cell-background-opacity-slider', 'cell-background-opacity-value', savedCellBgOpacity);

    // Background Image
    _restoreInputSetting('cell-background-image-url-input', savedCellBgImageUrl);
    _restoreOpacitySetting('cell-background-image-opacity-slider', 'cell-background-image-opacity-value', savedCellBgImageOpacity);

    // Text Color
    _restoreColorPickerSetting('cell-text-color-picker', savedCellTextColor);
    _restoreOpacitySetting('cell-text-opacity-slider', 'cell-text-opacity-value', savedCellTextOpacity);

    // Outline Color
    _restoreColorPickerSetting('cell-outline-color-picker', savedCellOutlineColor);
    _restoreOpacitySetting('cell-outline-opacity-slider', 'cell-outline-opacity-value', savedCellOutlineOpacity);

    // Outline Width
    _restoreInputSetting('cell-outline-width-input', savedCellOutlineWidth);
}

function restoreBoardBgSettings(savedBoardBgColor, savedBoardBgColorOpacity, savedBoardBgImageUrl, savedBoardBgImageOpacity) {
    _restoreColorPickerSetting('board-bg-color-picker', savedBoardBgColor);
    _restoreInputSetting('board-bg-image-url-input', savedBoardBgImageUrl);
    _restoreOpacitySetting('board-bg-color-opacity-slider', 'board-bg-color-opacity-value', savedBoardBgColorOpacity);
    _restoreOpacitySetting('board-bg-image-opacity-slider', 'board-bg-image-opacity-value', savedBoardBgImageOpacity); // NEW
    applyBoardBgStyle(); // Apply loaded style
}

function restoreSavedItems(savedDisplayedItems, savedItemsText, savedOriginalItemsText) {
    // Restore the textarea with the original user input if available (or fallback)
    // Note: If default board was generated, textarea was already set above.
    // This part primarily handles the case where board existed but original items might be missing.
    if (savedDisplayedItems) { // Only run this textarea logic if we didn't just generate default
        if (savedOriginalItemsText) {
            try {
                const originalItemsFromStorage = JSON.parse(savedOriginalItemsText);
                // Only update textarea if it wasn't populated by default gen
                if (document.getElementById('cell-contents').value === '') {
                    document.getElementById('cell-contents').value = originalItemsFromStorage.join('\n');
                }
            } catch (e) {
                showNotification('Error parsing saved original items.', 'error');
                localStorage.removeItem(vars.LS_ORIGINAL_ITEMS);
                // Fallback to cell items if original fails and textarea is empty
                if (savedItemsText && document.getElementById('cell-contents').value === '') {
                    try {
                        document.getElementById('cell-contents').value = JSON.parse(savedItemsText).join('\n');
                    } catch { /* ignore inner error */ }
                }
            }
        } else if (savedItemsText && document.getElementById('cell-contents').value === '') {
            // If no original items saved, use the cell items as fallback for textarea
            try {
                document.getElementById('cell-contents').value = JSON.parse(savedItemsText).join('\n');
            } catch (e) {
                // Already handled loading currentItems above, just ensure textarea is cleared on error
                document.getElementById('cell-contents').value = '';
            }
        }
    }
}

// --- Load State on Page Load ---
function loadFromLocalStorage() {
    const savedSize = localStorage.getItem(vars.LS_BOARD_SIZE); // Keep checking for size first
    const savedItemsText = localStorage.getItem(vars.LS_CELL_ITEMS);
    const savedDisplayedItems = localStorage.getItem(vars.LS_DISPLAYED_ITEMS);
    const savedMarkedIndices = localStorage.getItem(vars.LS_MARKED_INDICES);
    const configIsOpen = localStorage.getItem(vars.LS_CONFIG_OPEN) === "true";
    const savedOriginalItemsText = localStorage.getItem(vars.LS_ORIGINAL_ITEMS);
    // Load header text, applying default ONLY if key is missing
    let savedHeaderText = localStorage.getItem(vars.LS_HEADER_TEXT);
    if (savedHeaderText === null) { // Check if key exists
        savedHeaderText = vars.DEFAULT_HEADER_TEXT; // Apply default only if key missing
    }
    const savedHeaderImageUrl = localStorage.getItem(vars.LS_HEADER_IMAGE_URL);
    if (savedHeaderImageUrl === null) { // Check if key exists in localStorage
        savedHeaderImageUrl = vars.DEFAULT_HEADER_IMAGE_URL; // Apply default ONLY if key is missing
    }
    let savedHeaderTextColor = localStorage.getItem(vars.LS_HEADER_TEXT_COLOR);
    if (savedHeaderTextColor === null) {
        savedHeaderTextColor = vars.DEFAULT_HEADER_TEXT_COLOR;
    }
    const savedHeaderTextOpacity = localStorage.getItem(vars.LS_HEADER_TEXT_COLOR_OPACITY) || vars.DEFAULT_HEADER_TEXT_COLOR_OPACITY;
    const savedHeaderBgColor = localStorage.getItem(vars.LS_HEADER_BG_COLOR) || vars.DEFAULT_HEADER_BG_COLOR;
    const savedHeaderBgOpacity = localStorage.getItem(vars.LS_HEADER_BG_OPACITY) || vars.DEFAULT_HEADER_BG_OPACITY;
    const savedHeaderOutlineColor = localStorage.getItem(vars.LS_HEADER_TEXT_OUTLINE_COLOR) || vars.DEFAULT_HEADER_TEXT_OUTLINE_COLOR;
    const savedHeaderOutlineOpacity = localStorage.getItem(vars.LS_HEADER_TEXT_OUTLINE_OPACITY) || vars.DEFAULT_HEADER_TEXT_OUTLINE_OPACITY;
    const savedHeaderOutlineWidth = localStorage.getItem(vars.LS_HEADER_TEXT_OUTLINE_WIDTH) || vars.DEFAULT_HEADER_TEXT_OUTLINE_WIDTH;
    const savedHeaderFontSize = localStorage.getItem(vars.LS_HEADER_TEXT_FONT_SIZE) || vars.DEFAULT_HEADER_TEXT_FONT_SIZE; // Load font size
    const savedHeaderFontFamily = localStorage.getItem(vars.LS_HEADER_TEXT_FONT_FAMILY) || vars.DEFAULT_HEADER_TEXT_FONT_FAMILY; // Load font family
    const savedMarkedColor = localStorage.getItem(vars.LS_MARKED_COLOR) || vars.DEFAULT_MARKED_COLOR;
    const savedMarkedColorOpacity = localStorage.getItem(vars.LS_MARKED_COLOR_OPACITY) || vars.DEFAULT_MARKED_COLOR_OPACITY;
    const savedMarkedImageUrl = localStorage.getItem(vars.LS_MARKED_IMAGE_URL) || vars.DEFAULT_MARKED_IMAGE_URL;
    const savedMarkedImageOpacity = localStorage.getItem(vars.LS_MARKED_IMAGE_OPACITY) || vars.DEFAULT_MARKED_IMAGE_OPACITY;
    const savedCellBorderColor = localStorage.getItem(vars.LS_CELL_BORDER_COLOR) || vars.DEFAULT_CELL_BORDER_COLOR;
    const savedCellBorderOpacity = localStorage.getItem(vars.LS_CELL_BORDER_OPACITY) || vars.DEFAULT_CELL_BORDER_OPACITY;
    const savedCellBorderWidth = localStorage.getItem(vars.LS_CELL_BORDER_WIDTH) || vars.DEFAULT_CELL_BORDER_WIDTH;
    const savedCellBgColor = localStorage.getItem(vars.LS_CELL_BG_COLOR) || vars.DEFAULT_CELL_BG_COLOR;
    const savedCellBgOpacity = localStorage.getItem(vars.LS_CELL_BG_OPACITY) || vars.DEFAULT_CELL_BG_OPACITY;
    const savedCellBgImageUrl = localStorage.getItem(vars.LS_CELL_BG_IMAGE_URL) || vars.DEFAULT_CELL_BG_IMAGE_URL;
    const savedCellBgImageOpacity = localStorage.getItem(vars.LS_CELL_BG_IMAGE_OPACITY) || vars.DEFAULT_CELL_BG_IMAGE_OPACITY;
    const savedCellTextColor = localStorage.getItem(vars.LS_CELL_TEXT_COLOR) || vars.DEFAULT_CELL_TEXT_COLOR;
    const savedCellTextOpacity = localStorage.getItem(vars.LS_CELL_TEXT_OPACITY) || vars.DEFAULT_CELL_TEXT_OPACITY;
    const savedCellOutlineColor = localStorage.getItem(vars.LS_CELL_OUTLINE_COLOR) || vars.DEFAULT_CELL_OUTLINE_COLOR;
    const savedCellOutlineOpacity = localStorage.getItem(vars.LS_CELL_OUTLINE_OPACITY) || vars.DEFAULT_CELL_OUTLINE_OPACITY;
    const savedCellOutlineWidth = localStorage.getItem(vars.LS_CELL_OUTLINE_WIDTH) || vars.DEFAULT_CELL_OUTLINE_WIDTH;
    const savedMarkedBorderColor = localStorage.getItem(vars.LS_MARKED_BORDER_COLOR) || vars.DEFAULT_MARKED_BORDER_COLOR;
    const savedMarkedBorderOpacity = localStorage.getItem(vars.LS_MARKED_BORDER_OPACITY) || vars.DEFAULT_MARKED_BORDER_OPACITY;
    const savedMarkedBorderWidth = localStorage.getItem(vars.LS_MARKED_BORDER_WIDTH) || vars.DEFAULT_MARKED_BORDER_WIDTH;
    const savedMarkedCellTextColor = localStorage.getItem(vars.LS_MARKED_CELL_TEXT_COLOR) || vars.DEFAULT_MARKED_CELL_TEXT_COLOR;
    const savedMarkedCellTextOpacity = localStorage.getItem(vars.LS_MARKED_CELL_TEXT_OPACITY) || vars.DEFAULT_MARKED_CELL_TEXT_OPACITY;
    const savedMarkedCellOutlineColor = localStorage.getItem(vars.LS_MARKED_CELL_OUTLINE_COLOR) || vars.DEFAULT_MARKED_CELL_OUTLINE_COLOR;
    const savedMarkedCellOutlineOpacity = localStorage.getItem(vars.LS_MARKED_CELL_OUTLINE_OPACITY) || vars.DEFAULT_MARKED_CELL_OUTLINE_OPACITY;
    const savedMarkedCellOutlineWidth = localStorage.getItem(vars.LS_MARKED_CELL_OUTLINE_WIDTH) || vars.DEFAULT_MARKED_CELL_OUTLINE_WIDTH;
    const savedBoardBgColor = localStorage.getItem(vars.LS_BOARD_BG_COLOR) || vars.DEFAULT_BOARD_BG_COLOR;
    const savedBoardBgColorOpacity = localStorage.getItem(vars.LS_BOARD_BG_COLOR_OPACITY) || vars.DEFAULT_BOARD_BG_COLOR_OPACITY;
    const savedBoardBgImageUrl = localStorage.getItem(vars.LS_BOARD_BG_IMAGE_URL) || vars.DEFAULT_BOARD_BG_IMAGE_URL;
    const savedBoardBgImageOpacity = localStorage.getItem(vars.LS_BOARD_BG_IMAGE_OPACITY) || vars.DEFAULT_BOARD_BG_IMAGE_OPACITY; // NEW

    // Restore Config Pane State
    loadPaneState(configIsOpen);

    // Determine board size (use saved, or default 5)
    const size = parseInt(savedSize || "5", 10);
    document.getElementById('board-size').value = size; // Update input regardless of board source

    // Restore Board only if essential data exists
    if (savedDisplayedItems) {
        generateBoardFromSavedState(savedDisplayedItems, savedItemsText, savedMarkedIndices, size);
    } else {
        generateDefaultBoard();
    }

    restoreBackgroundSettings();

    restoreHeaderSettings(
        savedHeaderText, savedHeaderImageUrl, savedHeaderTextColor, savedHeaderTextOpacity,
        savedHeaderBgColor, savedHeaderBgOpacity,
        savedHeaderOutlineColor, savedHeaderOutlineOpacity, savedHeaderOutlineWidth,
        savedHeaderFontSize, // Pass font size
        savedHeaderFontFamily, // Pass font family
        localStorage.getItem(vars.LS_HEADER_TEXT_STYLE_ITALIC) === 'true', // Pass italic style
        localStorage.getItem(vars.LS_HEADER_TEXT_STYLE_BOLD) === 'true' // Pass bold style
    );

    restoreMarkedStyleSettings(
        savedMarkedColor, savedMarkedColorOpacity, savedMarkedImageUrl, savedMarkedImageOpacity,
        savedMarkedBorderColor, savedMarkedBorderOpacity, savedMarkedCellTextColor, savedMarkedCellTextOpacity,
        savedMarkedCellOutlineColor, savedMarkedCellOutlineOpacity, savedMarkedCellOutlineWidth,
        savedMarkedBorderWidth
    );

    restoreCellStyleSettings(
        savedCellBorderColor, savedCellBorderOpacity, savedCellBgColor, savedCellBgOpacity,
        savedCellBgImageUrl, savedCellBgImageOpacity, savedCellTextColor, savedCellTextOpacity,
        savedCellOutlineColor, savedCellOutlineOpacity, savedCellOutlineWidth,
        savedCellBorderWidth
    );

    restoreBoardBgSettings(savedBoardBgColor, savedBoardBgColorOpacity, savedBoardBgImageUrl, savedBoardBgImageOpacity); // Pass new value

    restoreSavedItems(savedDisplayedItems, savedItemsText, savedOriginalItemsText);

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
    const minCellSize = 150; // Minimum width/height for a cell
    let maxWidthNeeded = 0;
    let maxHeightNeeded = 0;

    // 1. Reset grid sizing to allow natural measurement of cell content
    board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`; // Use fractions initially
    board.style.gridAutoRows = "auto"; // Auto height

    // 2. Force reflow to apply the reset styles before measuring
    void board.offsetHeight;

    // 3. First pass: Find the max width and max height based on actual rendered content
    cells.forEach((cell) => {
        // Reset any explicit cell styles (shouldn't be needed, but safe)
        cell.style.width = "";
        cell.style.height = "";

        // Measure the cell's natural dimensions after reflow
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

export function explodeBeans(event) {
    console.log(event);
    let container = event.target.parentElement;
    for (let i = 0; i < 20; i++) {
        const newBean = document.createElement('img');
        newBean.src = '/bean.svg';
        newBean.style.position = 'absolute';
        newBean.style.width = '25px';
        newBean.style.height = '25px';
        newBean.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
        newBean.style.opacity = '0';

        // Initial position at the center of the div container
        newBean.style.transform = 'translate(12px, -50px) scale(0.5)';

        container.appendChild(newBean);

        // Random position around the original bean
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 100 + 50;

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

    // --- Event Listeners Setup using Helpers ---

    // Background Controls
    document.querySelectorAll('input[name="background-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            toggleBackgroundControls();
            setBackground(); // Apply the change visually
            saveBackgroundSettings(); // Save the setting
        });
    });
    setupInputListener('background-color-picker', 'input', saveBackgroundSettings, setBackground);
    setupOpacitySliderListener('background-color-opacity-slider', 'background-color-opacity-value', saveBackgroundSettings, setBackground);
    setupInputListener('gradient-color-1', 'input', saveBackgroundSettings, setBackground);
    setupOpacitySliderListener('gradient-color-1-opacity-slider', 'gradient-color-1-opacity-value', saveBackgroundSettings, setBackground);
    setupInputListener('gradient-color-2', 'input', saveBackgroundSettings, setBackground);
    setupOpacitySliderListener('gradient-color-2-opacity-slider', 'gradient-color-2-opacity-value', saveBackgroundSettings, setBackground);
    setupInputListener('gradient-direction', 'change', saveBackgroundSettings, setBackground);

    // Header Controls
    setupInputListener('header-text-input', 'input', saveHeaderSettings, updateHeaderDisplay);
    setupInputListener('header-image-url-input', 'input', saveHeaderSettings, updateHeaderDisplay);
    setupInputListener('header-text-color-picker', 'input', saveHeaderSettings, updateHeaderDisplay);
    setupOpacitySliderListener('header-text-color-opacity-slider', 'header-text-color-opacity-value', saveHeaderSettings, updateHeaderDisplay);
    setupInputListener('header-text-font-size-input', 'input', saveHeaderSettings, updateHeaderDisplay); // Add listener for font size
    setupInputListener('header-text-font-family-select', 'change', saveHeaderSettings, updateHeaderDisplay); // Add listener for font family
    setupInputListener('header-bg-color-picker', 'input', saveHeaderSettings, applyHeaderBgStyle);
    setupOpacitySliderListener('header-bg-opacity-slider', 'header-bg-opacity-value', saveHeaderSettings, applyHeaderBgStyle);
    // Header Font Style Listeners
    setupInputListener('header-text-style-italic', 'change', saveHeaderSettings, updateHeaderDisplay);
    setupInputListener('header-text-style-bold', 'change', saveHeaderSettings, updateHeaderDisplay);
    // Header Text Outline Listeners
    setupInputListener('header-text-outline-color-picker', 'input', saveHeaderSettings, updateHeaderDisplay);
    setupOpacitySliderListener('header-text-outline-opacity-slider', 'header-text-outline-opacity-value', saveHeaderSettings, updateHeaderDisplay);
    setupInputListener('header-text-outline-width-input', 'input', saveHeaderSettings, updateHeaderDisplay);

    // Marked Style Controls
    setupInputListener('marked-color-picker', 'input', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupOpacitySliderListener('marked-color-opacity-slider', 'marked-color-opacity-value', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupInputListener('marked-image-url-input', 'input', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupOpacitySliderListener('marked-image-opacity-slider', 'marked-image-opacity-value', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupInputListener('marked-border-color-picker', 'input', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupOpacitySliderListener('marked-border-opacity-slider', 'marked-border-opacity-value', saveMarkedStyleSettings, refreshMarkedCellStyles);
    // Marked Text Styles
    setupInputListener('marked-cell-text-color-picker', 'input', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupOpacitySliderListener('marked-cell-text-opacity-slider', 'marked-cell-text-opacity-value', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupInputListener('marked-border-width-input', 'input', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupInputListener('marked-cell-outline-color-picker', 'input', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupOpacitySliderListener('marked-cell-outline-opacity-slider', 'marked-cell-outline-opacity-value', saveMarkedStyleSettings, refreshMarkedCellStyles);
    setupInputListener('marked-cell-outline-width-input', 'input', saveMarkedStyleSettings, refreshMarkedCellStyles);


    // Default Cell Style Controls
    setupInputListener('cell-border-color-picker', 'input', saveCellStyleSettings, refreshCellStyles);
    setupOpacitySliderListener('cell-border-opacity-slider', 'cell-border-opacity-value', saveCellStyleSettings, refreshCellStyles);
    setupInputListener('cell-border-width-input', 'input', saveCellStyleSettings, refreshCellStyles);
    setupInputListener('cell-background-color-picker', 'input', saveCellStyleSettings, refreshCellStyles);
    setupOpacitySliderListener('cell-background-opacity-slider', 'cell-background-opacity-value', saveCellStyleSettings, refreshCellStyles);
    setupInputListener('cell-background-image-url-input', 'input', saveCellStyleSettings, refreshCellStyles);
    setupOpacitySliderListener('cell-background-image-opacity-slider', 'cell-background-image-opacity-value', saveCellStyleSettings, refreshCellStyles);
    // Default Text Styles
    setupInputListener('cell-text-color-picker', 'input', saveCellStyleSettings, refreshCellStyles);
    setupOpacitySliderListener('cell-text-opacity-slider', 'cell-text-opacity-value', saveCellStyleSettings, refreshCellStyles);
    setupInputListener('cell-outline-color-picker', 'input', saveCellStyleSettings, refreshCellStyles);
    setupOpacitySliderListener('cell-outline-opacity-slider', 'cell-outline-opacity-value', saveCellStyleSettings, refreshCellStyles);
    setupInputListener('cell-outline-width-input', 'input', saveCellStyleSettings, refreshCellStyles);

    // Board Background Controls
    setupInputListener('board-bg-color-picker', 'input', saveBoardBgSettings, applyBoardBgStyle);
    setupInputListener('board-bg-image-url-input', 'input', saveBoardBgSettings, applyBoardBgStyle);
    setupOpacitySliderListener('board-bg-color-opacity-slider', 'board-bg-color-opacity-value', saveBoardBgSettings, applyBoardBgStyle);
    setupOpacitySliderListener('board-bg-image-opacity-slider', 'board-bg-image-opacity-value', saveBoardBgSettings, applyBoardBgStyle); // NEW


    // --- Search Listener ---
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const cells = document.querySelectorAll('#bingo-board .bingo-cell');
            const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);

            cells.forEach(cell => {
                const textSpan = cell.querySelector('.bingo-cell-text');
                let isMatch = false;
                if (textSpan && searchWords.length > 0) {
                    const cellText = textSpan.textContent.trim().toLowerCase();
                    isMatch = searchWords.every(word => cellText.includes(word));
                }
                cell.classList.toggle('highlighted', isMatch); // More concise toggle
            });
        });
        clearSearch(); // Clear search on initial load after setting up listener
    }

    // --- Other Listeners ---
    window.addEventListener('resize', equalizeCellSizes);
    equalizeCellSizes(); // <-- MOVED HERE

    clearSearch(); // Clear search highlights and input

    // Apply marked styles *after* all other styles/settings are restored
    refreshMarkedCellStyles(); // <-- Keep here

    // Equalize sizes as the very last step after all content and styles are set
    equalizeCellSizes(); // <-- MOVED HERE
});

// --- Settings Import/Export ---
export function exportSettings() {
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

export function importSettings() {
    // Create a temporary file input element
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.accept = '.json,.txt'; // Accept JSON or text files
    tempInput.style.display = 'none'; // Hide the element

    tempInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) {
            return; // No file selected
        }

        const reader = new FileReader();
        reader.onload = function (e) {
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

        reader.onerror = function () {
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