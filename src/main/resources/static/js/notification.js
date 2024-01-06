document.addEventListener('DOMContentLoaded', function () {
    const medications = document.querySelectorAll('.med-widget');
    medications.forEach(function (med) {
        const medicationName = med.dataset.medicationName;
        const medicationTime = parseInt(med.dataset.medicationTime, 10);

        console.log('Medication Name:', medicationName, 'Medication Time:', medicationTime);

        if (!isNaN(medicationTime)) {
            scheduleNextReminder(medicationName, medicationTime);
        } else {
            console.error('Invalid medication time for', medicationName);
        }
    });

    function scheduleNextReminder(medicationName, intervalHours) {
        const now = new Date();
        let nextReminderTime = new Date(now.getTime() + intervalHours * 60 * 60 * 1000); // change to * 1000 when testing
        console.log('Next reminder time:', nextReminderTime);

        // Function to check and show reminder
        function checkAndShowReminder() {
            const currentTime = new Date();
            if (currentTime >= nextReminderTime) {
                showMedicationModal(medicationName);
                nextReminderTime = new Date(currentTime.getTime() + intervalHours * 60 * 60 * 1000); // change to * 1000 when testing
            }
            // Check again after 10 seconds
            setTimeout(checkAndShowReminder, nextReminderTime);
        }

        checkAndShowReminder();
    }

    function showMedicationModal(medicationName) {
        const medWidgets = document.querySelectorAll('.med-widget');
        let medicationId;

        // Find the medication ID
        medWidgets.forEach(widget => {
            if (widget.dataset.medicationName === medicationName) {
                medicationId = widget.getAttribute('data-med-id'); // or med.dataset.medId;
                console.log(medicationId);
            }
        });

        // Update modal content
        document.getElementById('medicationNameModal').textContent = medicationName;

        // Set event listeners for buttons
        document.getElementById('takenButton').onclick = function () {
            trackMedicationStatus('taken', medicationId);
        };
        document.getElementById('missedButton').onclick = function () {
            trackMedicationStatus('missed', medicationId);
        };

        $('#medicationReminderModal').modal('show');
    }

    function trackMedicationStatus(status, medicationId) {
        fetch(`/rms/patient/dashboard/medication-tracker/${status}?medicationId=${medicationId}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                console.log('Tracking response:', data);
                $('#medicationReminderModal').modal('hide');
                // Handle response

                // Update times taken or times missed data attribute based on the status
                const medWidget = document.querySelector(`.med-widget[data-med-id="${medicationId}"]`);
                if (medWidget) {
                    if (status === 'taken') {
                        const timesTaken = parseInt(medWidget.getAttribute('data-times-taken')) + 1;
                        medWidget.setAttribute('data-times-taken', timesTaken.toString());
                    } else if (status === 'missed') {
                        const timesMissed = parseInt(medWidget.getAttribute('data-times-missed')) + 1;
                        medWidget.setAttribute('data-times-missed', timesMissed.toString());
                    }
                }
            })
            .catch(error => {
                console.error('Error tracking medication:', error);
            });
    }
});