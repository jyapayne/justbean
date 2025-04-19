let notificationTimeout = null; // To manage hiding notifications
// --- Notification Function ---
export function showNotification(message, type = 'info', duration = 3000) {
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
export function hexToRgba(hex, opacityPercent = 100) {
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

// --- Event Listener Helper Functions --- START

// Helper function for standard input/select elements
export function setupInputListener(elementId, eventType, saveFn, refreshFn) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, () => {
            if (saveFn) saveFn();
            if (refreshFn) refreshFn();
        });
    } else {
        console.warn(`Element with ID ${elementId} not found for listener setup.`);
    }
}

// Helper function for opacity sliders with value display
export function setupOpacitySliderListener(sliderId, valueSpanId, saveFn, refreshFn) {
    const slider = document.getElementById(sliderId);
    const valueSpan = document.getElementById(valueSpanId);
    if (slider) {
        slider.addEventListener('input', (e) => {
            if (valueSpan) valueSpan.textContent = e.target.value;
            if (saveFn) saveFn();
            if (refreshFn) refreshFn();
        });
    } else {
        console.warn(`Element with ID ${sliderId} not found for listener setup.`);
    }
}

// --- Event Listener Helper Functions --- END

// Helper function to restore a checkbox state
export function _restoreCheckboxSetting(checkboxId, savedValue) {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
        checkbox.checked = savedValue; // savedValue should be boolean
    }
}
// Helper function to restore opacity slider and value display
export function _restoreOpacitySetting(sliderId, valueSpanId, savedOpacityValue) {
    const slider = document.getElementById(sliderId);
    const valueSpan = document.getElementById(valueSpanId);
    if (slider) {
        slider.value = savedOpacityValue;
    }
    if (valueSpan) {
        valueSpan.textContent = savedOpacityValue;
    }
}

// Helper function to restore a color picker value
export function _restoreColorPickerSetting(pickerId, savedColorValue) {
    const picker = document.getElementById(pickerId);
    if (picker) {
        picker.value = savedColorValue;
    }
}

// Helper function to restore a generic input value
export function _restoreInputSetting(inputId, savedValue) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = savedValue;
    }
}
