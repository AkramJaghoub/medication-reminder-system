document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('medicationForm');
    if (!form) {
        console.error('Form not found');
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission
        const medDto = {
            medicationName: document.getElementById('medicationName').value,
            medicationTime: document.getElementById('medicationTime').value,
        };

        fetch('/rms/patient/dashboard/add-medication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medDto)
        })
            .then(response => {
                const status = response.status;  // Get the HTTP status code
                return response.json().then(json => ({ json, status }));  // Return both JSON and status
            })
            .then(({ json, status }) => {
                if (status === 201) {
                    $('#medicationModal').modal('hide');
                    displaySuccess(json.message);  // Display success message from JSON response
                    fetchAndDisplayMedications();  // Refresh the medication list
                } else {
                    displayError('medicationName', json.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                displayError('medicationForm', error.message);
            });

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
    });

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

    document.getElementById('medicationName').addEventListener('change', clearError);
    function clearError() {
        const field = document.getElementById('medicationName');
        let errorDiv = field.nextElementSibling;

        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.style.display = 'none';
        }
    }

    document.body.addEventListener('click', function(event) {
        if (event.target.matches('.menu-icon, .menu-icon *')) {
            const medId = event.target.closest('.menu-icon').getAttribute('data-med-id');
            const menuDropdown = document.getElementById('menu-dropdown-' + medId);
            menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
        } else {
            // Close all open menus
            document.querySelectorAll('.menu-container').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
});

function fetchAndDisplayMedications() {
    fetch('/rms/patient/dashboard/get-medications')
        .then(response => response.json())
        .then(medications => {
            const articlesContainer = document.querySelector('.articles');
            articlesContainer.innerHTML = ''; // Clear existing content

            medications.forEach(med => {
                const medWidget = createMedicationWidget(med, med.id);
                articlesContainer.appendChild(medWidget);
            });
        })
        .catch(error => console.error('Error fetching medications:', error));
}

function formatMedicationPostDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function createMedicationWidget(med, id) {
    const formattedPostDate = med.postDate ? formatMedicationPostDate(med.postDate) : 'Not specified';

    const medWidget = document.createElement('div');
    medWidget.classList.add('med-widget');
    medWidget.setAttribute('data-med-id', id);
    medWidget.innerHTML = `
        <div id="menu-icon-${id}" class="menu-icon" data-med-id="${id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
            </svg>
        </div>
        <div id="menu-dropdown-${id}" class="menu-container" style="display: none;">
            <a class="dropdown-item update-option" href="#" data-med-id="${id}">Update</a>
            <a class="dropdown-item view-adherence" href="#" data-med-id="${id}">View Adherence</a>
            <a class="dropdown-item side-effects-option" href="#" data-med-id="${id}">Side Effects</a>
        </div>
        <h4 style="margin-bottom: 1.5rem;">${med.medicationName}</h4>
        <p><strong>Frequency:</strong> Every ${med.medicationTime} hours</p>
        <br>
        <p><strong>Added:</strong> ${formattedPostDate}</p>    
`;
    return medWidget;
}