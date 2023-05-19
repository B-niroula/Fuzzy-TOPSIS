document.addEventListener('DOMContentLoaded', function() {
    const steps = document.querySelectorAll('.step');
    const backButton = document.getElementById('back-button');
    const createTablesButton = document.getElementById('create-tables-button');
    const toScaleSelectionButton = document.getElementById('to-scale-selection-button');

    backButton.addEventListener('click', function() {
        steps[1].style.display = 'none';
        steps[0].style.display = 'block';
    });

    createTablesButton.addEventListener('click', function() {
        const numAlternatives = document.getElementById('num-alternatives').value;
        const numCriteria = document.getElementById('num-criteria').value;
        const tablesContainer = document.getElementById('tables-container');
        tablesContainer.innerHTML = ''; // Clear the container

        if (numAlternatives && numCriteria) {
            // Create table for alternatives
            const alternativesTable = document.createElement('table');
            alternativesTable.setAttribute('border', '1');
            const alternativesHeaderRow = alternativesTable.insertRow();
            alternativesHeaderRow.insertCell().textContent = 'No.';
            alternativesHeaderRow.insertCell().textContent = 'Alternative';

            for (let i = 0; i < numAlternatives; i++) {
                const row = alternativesTable.insertRow();
                row.insertCell().textContent = i + 1;
                const cell = row.insertCell();
                const input = document.createElement('input');
                input.type = 'text';
                input.name = `alternative_${i}`;
                cell.appendChild(input);
            }

            // Create table for criteria
            const criteriaTable = document.createElement('table');
            criteriaTable.setAttribute('border', '1');
            const criteriaHeaderRow = criteriaTable.insertRow();
            criteriaHeaderRow.insertCell().textContent = 'No.';
            criteriaHeaderRow.insertCell().textContent = 'Criterion';
            criteriaHeaderRow.insertCell().textContent = 'Type';
            criteriaHeaderRow.insertCell().textContent = 'L';
            criteriaHeaderRow.insertCell().textContent = 'M';
            criteriaHeaderRow.insertCell().textContent = 'U';

            for (let i = 0; i < numCriteria; i++) {
                const row = criteriaTable.insertRow();
                row.insertCell().textContent = i + 1;
                row.insertCell().innerHTML = `<input type="text" name="criterion_${i}_name">`;
                row.insertCell().innerHTML = ` <select name="criterion_${i}_type"> <option value="+">+</option>
                                                    <option value="-">-</option>
                                                </select>`;
                row.insertCell().innerHTML = `<input type="number" step="1.00" name="criterion_${i}_l">`;
                row.insertCell().innerHTML = `<input type="number" step="1.00" name="criterion_${i}_m">`;
                row.insertCell().innerHTML = `<input type="number" step="1.00" name="criterion_${i}_u">`;
            }

            // Append the tables to the container
            tablesContainer.appendChild(alternativesTable);
            tablesContainer.appendChild(document.createElement('br'));
            tablesContainer.appendChild(criteriaTable);
        } else {
            alert('Please enter the number of alternatives and criteria.');
        }
        // Show the "Next" button after tables are created
        toScaleSelectionButton.style.display = 'block';
    }); // Add this closing bracket for the click event listener

    function saveAlternativesAndCriteria() {
        const numAlternatives = document.getElementById('num-alternatives').value;
        const numCriteria = document.getElementById('num-criteria').value;
        const alternatives = [];
        const criteria = [];

        for (let i = 0; i < numAlternatives; i++) {
            const alternativeInput = document.querySelector(`input[name="alternative_${i}"]`);
            if (alternativeInput && alternativeInput.value) {
                alternatives.push(alternativeInput.value);
            }
        }

        for (let i = 0; i < numCriteria; i++) {
            const criterionInput = document.querySelector(`input[name="criterion_${i}_name"]`);
            const criterionTypeSelect = document.querySelector(`select[name="criterion_${i}_type"]`);
            const criterionLInput = document.querySelector(`input[name="criterion_${i}_l"]`);
            const criterionMInput = document.querySelector(`input[name="criterion_${i}_m"]`);
            const criterionUInput = document.querySelector(`input[name="criterion_${i}_u"]`);

            if (criterionInput && criterionInput.value && criterionTypeSelect && criterionLInput && criterionMInput && criterionUInput) {
                criteria.push({
                    name: criterionInput.value,
                    type: criterionTypeSelect.value,
                    l: parseFloat(criterionLInput.value),
                    m: parseFloat(criterionMInput.value),
                    u: parseFloat(criterionUInput.value)
                });
            }
        }

        console.log('Saving alternatives:', alternatives); 
        console.log('Saving criteria:', criteria); 

        localStorage.setItem('alternatives', JSON.stringify(alternatives));
        localStorage.setItem('criteria', JSON.stringify(criteria));

        // Send the data to the backend
        sendData({
            alternatives: alternatives,
            criteria: criteria
        });
    }
    
    async function sendData(data) {
        const response = await fetch('http://127.0.0.1:8000/topsis/receive-page2-data/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });
    
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('Response from backend:', jsonResponse);
        } else {
            console.error('Failed to send data to backend:', response.statusText);
        }
    }

    // Add click event listener for the "to-scale-selection-button"
    toScaleSelectionButton.addEventListener('click', function() {
        saveAlternativesAndCriteria();
        steps[1].style.display = 'none';
        steps[2].style.display = 'block';
    });
});