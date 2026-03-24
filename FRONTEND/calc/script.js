// Get the display element
const display = document.getElementById('display');

// Function to append numbers and operators to display
function appendToDisplay(value) {
    if (display.value === '0' || display.value === 'Error') {
        display.value = value;
    } else {
        display.value += value;
    }
}

// Function to clear the display
function clearDisplay() {
    display.value = '';
}

// Function to delete the last character
function deleteLast() {
    display.value = display.value.slice(0, -1);
}

// Function to calculate the result
function calculate() {
    try {
        // Evaluate the expression
        const result = eval(display.value);
        display.value = result;
    } catch (error) {
        // Show error if calculation fails
        display.value = 'Error';
    }
}

// Keyboard support (optional but cool!)
document.addEventListener('keydown', function(event) {
    // Numbers and operators
    if (event.key >= '0' && event.key <= '9') {
        appendToDisplay(event.key);
    } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
        appendToDisplay(event.key);
    } else if (event.key === '.') {
        appendToDisplay('.');
    } else if (event.key === 'Enter') {
        calculate();
    } else if (event.key === 'Backspace') {
        deleteLast();
    } else if (event.key === 'Escape') {
        clearDisplay();
    }
});