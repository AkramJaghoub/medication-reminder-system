document.addEventListener('DOMContentLoaded', function () {
    // Function to close all open menus
    function closeAllMenus() {
        document.querySelectorAll('.menu-container').forEach(function (menu) {
            menu.style.display = 'none';
        });
    }

    // Function to show side effects modal
    function showSideEffectsModal(sideEffectsDescription) {
        clearMessages(); // Clear messages before showing the modal
        const modalBody = document.querySelector('#sideEffectsModal .modal-body');
        modalBody.textContent = sideEffectsDescription || 'No side effects description available.';
        const sideEffectsModal = new bootstrap.Modal(document.getElementById('sideEffectsModal'));
        sideEffectsModal.show();
    }

    function showAdherenceAnalysis(medWidget) {
        clearMessages(); // Clear messages before showing the modal
        const medId = medWidget.getAttribute('data-med-id');
        const medicationName = medWidget.getAttribute('data-medication-name');
        const medicationTime = parseInt(medWidget.getAttribute('data-medication-time')); // Parse as an integer
        const sideEffectsDescription = medWidget.getAttribute('data-side-effects');
        const timesTaken = parseInt(medWidget.getAttribute('data-times-taken')); // Parse times taken
        const timesMissed = parseInt(medWidget.getAttribute('data-times-missed')); // Parse times missed

        // Create a canvas element for the chart
        const chartCanvas = document.createElement('canvas');
        chartCanvas.id = 'adherenceChart';
        chartCanvas.style.width = '100%';
        chartCanvas.style.height = '300px'; // Adjust the height as needed

        // Insert the chart canvas into the modal
        const chartModalBody = document.getElementById('adherenceModalBody');
        chartModalBody.innerHTML = ''; // Clear existing content
        chartModalBody.appendChild(chartCanvas);

        // Initialize Chart.js with real data
        const ctx = chartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'line', data: {
                labels: ['Times Taken', 'Times Missed'], datasets: [{
                    label: 'Frequency',
                    data: [timesTaken, timesMissed],
                    backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 2,
                }]
            }, options: {
                scales: {
                    y: {
                        beginAtZero: true, title: {
                            display: true, text: 'Frequency'
                        }
                    }
                }
            }
        });

        const adherenceModal = new bootstrap.Modal(document.getElementById('adherenceModal'));
        adherenceModal.show();
    }

    function showUpdateForm(medWidget) {
        clearMessages(); // Clear messages before showing the modal
        const medId = medWidget.getAttribute('data-med-id');
        const medicationName = medWidget.getAttribute('data-medication-name');
        const medicationTime = medWidget.getAttribute('data-medication-time');
        let sideEffectsDescription = medWidget.getAttribute('data-side-effects');


        document.getElementById('updateMedicationName').value = medicationName;
        document.getElementById('updateMedicationTime').value = medicationTime;

        // Update the modal content with side effects description
        const sideEffectsModalBody = document.querySelector('.modal.fade#sideEffectsModal .modal-body');
        if (sideEffectsModalBody) {
            sideEffectsModalBody.textContent = sideEffectsDescription;
        }

        const updateMedicationModal = new bootstrap.Modal(document.getElementById('updateMedicationModal'));
        updateMedicationModal.show();

        // Attach an event listener to the form submission
        const updateMedicationForm = document.getElementById('updateMedicationForm');
        updateMedicationForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent the default form submission

            const updatedMedicationName = document.getElementById('updateMedicationName').value;
            const updatedMedicationTime = document.getElementById('updateMedicationTime').value;

            switch (updatedMedicationName.toLowerCase()) {
                case 'digoxin':
                    sideEffectsDescription = "Common side effects of digoxin include nausea, vomiting, loss of appetite, blurred or yellow vision, confusion, irregular heartbeat, dizziness, fatigue, and potential electrolyte imbalances. Serious side effects may occur, and it's crucial to report any unusual symptoms to a healthcare provider promptly.";
                    break;
                case 'exforge hct':
                    sideEffectsDescription = "Common side effects of Exforge HCT include dizziness, headache, and swelling. Serious side effects can include low blood pressure, electrolyte imbalances, and kidney problems.";
                    break;
                case 'metformin':
                    sideEffectsDescription = "Common side effects of metformin include gastrointestinal issues such as nausea, diarrhea, and abdominal discomfort. Rarely, it may lead to lactic acidosis, a serious condition requiring immediate medical attention.";
                    break;
                case 'vastor':
                    sideEffectsDescription = "Vastor may commonly cause muscle pain, weakness, and digestive issues like nausea. Rare but serious side effects can include liver problems and an increased risk of diabetes.";
                    break;
                default:
                    // Handle the case where the medication name is not recognized
                    sideEffectsDescription = "Side effects for this medication are not available.";
                    break;
            }

            // Send an HTTP PUT request to update the medication
            fetch('/rms/patient/dashboard/update-medication/' + medId, { // Include medId in the URL
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    medicationName: updatedMedicationName,
                    medicationTime: updatedMedicationTime
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'OK') {
                        updateMedicationModal.hide();
                        updateMedicationWidget(medId, updatedMedicationName, updatedMedicationTime, sideEffectsDescription);
                        displaySuccess(data.message);
                    } else {
                        displayError('updateMedicationName', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }

    function updateMedicationWidget(medId, updatedMedicationName, updatedMedicationTime, updatedSideEffectsDescription) {

        console.log(updatedSideEffectsDescription);
        // Get the specific medication widget based on medId
        const medWidgets = document.querySelectorAll(`.med-widget[data-med-id="${medId}"]`);

        if (medWidgets.length > 0) {
            // Update each matching widget
            medWidgets.forEach(medWidget => {
                // Update the widget's data attributes
                medWidget.setAttribute('data-medication-name', updatedMedicationName);
                medWidget.setAttribute('data-medication-time', updatedMedicationTime);
                medWidget.setAttribute('data-side-effects', updatedSideEffectsDescription);

                const medNameElement = medWidget.querySelector('.med-name');
                const medTimeElement = medWidget.querySelector('.med-time');
                const sideEffectsSpan = document.querySelector(`#side-effects-data-${medId}`);

                if (medNameElement && medTimeElement && sideEffectsSpan) {
                    medNameElement.textContent = updatedMedicationName;
                    medTimeElement.textContent = `Every ${updatedMedicationTime} hours`;
                    sideEffectsSpan.textContent = updatedSideEffectsDescription;
                }
            });
        }
    }


    function displayError(fieldId, message) {
        const field = document.getElementById(fieldId);
        let errorDiv = field.nextElementSibling;
        // Create the error div if it doesn't exist
        if (!errorDiv || !errorDiv.classList.contains('error-message')) {
            errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function displaySuccess(message) {
        const alertBox = document.getElementById('successAlert');
        const messageParagraph = document.getElementById('successMessage');

        messageParagraph.textContent = message;

        alertBox.style.display = 'flex'; // Change display to flex to make it visible
        alertBox.style.opacity = 1;

        // Wait 4 seconds before starting to fade out
        setTimeout(() => {
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    alertBox.style.display = 'none'; // Hide it again after fade out
                } else {
                    opacity -= 0.05; // Decrease the opacity
                    alertBox.style.opacity = opacity;
                }
            }, 50); // Adjust the interval to control the speed of the fade-out
        }, 5000);
    }


    // Event listener for menu icons
    const menuIcons = document.querySelectorAll('.menu-icon');
    menuIcons.forEach(icon => {
        icon.addEventListener('click', function (event) {
            event.stopPropagation();
            clearMessages(); // Clear messages before showing the dropdown
            const medId = this.getAttribute('data-med-id');
            const menuDropdown = document.getElementById('menu-dropdown-' + medId);
            menuDropdown.style.display = (menuDropdown.style.display === 'none' || !menuDropdown.style.display) ? 'block' : 'none';
        });
    });

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('side-effects-option')) {
            event.preventDefault();
            const medWidget = event.target.closest('.med-widget');
            const sideEffectsDescription = medWidget.getAttribute('data-side-effects');
            showSideEffectsModal(sideEffectsDescription);
        } else if (event.target.classList.contains('update-option')) {
            event.preventDefault();
            const medWidget = event.target.closest('.med-widget');
            showUpdateForm(medWidget);
        } else if (event.target.classList.contains('adherence-option')) {
            event.preventDefault();
            const medWidget = event.target.closest('.med-widget');
            showAdherenceAnalysis(medWidget);
        } else {
            closeAllMenus();
        }
    });
});

function clearMessages() {
    // Clear error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(errorDiv => {
        errorDiv.style.display = 'none';
    });

    // Clear success messages
    const successAlert = document.getElementById('successAlert');
    if (successAlert) {
        successAlert.style.display = 'none';
    }
}