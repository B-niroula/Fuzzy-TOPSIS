document.addEventListener('DOMContentLoaded', function() {
    
    const steps = document.querySelectorAll('.step');
    const createScaleBackButton = document.getElementById('create-scale-back-button');
    const expertsData = new Map();


    // Add click event listener for the "create-scale-back-button"
    createScaleBackButton.addEventListener('click', function () {
        steps[3].style.display = 'none';
        steps[2].style.display = 'block';
    });

    function displayDecisionMatrixTable(expertName) {
        const expertData = expertsData.get(expertName);

        if (!expertData) {
            return;
        }

        // Remove the existing decision matrix table if there's any
        const existingTable = document.getElementById('decision-matrix-table');
        if (existingTable) {
            existingTable.remove();
        }

        // Remove the existing decision matrix table and mean values table if there's any
        const existingMeanValuesTable = document.getElementById('mean-values-table');
        if (existingMeanValuesTable) {
            existingMeanValuesTable.remove();
        }


        // Get the alternatives and criteria data
        const alternativesList = getAlternatives();
        const criteriaList = getCriteria();

        const decisionMatrixContainer = document.getElementById('decision-matrix-container');
        const decisionMatrixTable = createDecisionMatrixTable(alternativesList, criteriaList, expertData.values);
        decisionMatrixContainer.appendChild(decisionMatrixTable);
    }

    function getAlternatives() {
        const alternativesJSON = localStorage.getItem('alternatives');
        if (alternativesJSON) {
            return JSON.parse(alternativesJSON);
        }
        return [];
    }
    
    function getCriteria() {
        const criteriaJSON = localStorage.getItem('criteria');
        if (criteriaJSON) {
            return JSON.parse(criteriaJSON);
        }
        return [];
    }
    
    function addExpert() {
        const expertSelect = document.getElementById('expert-select');
        const newExpertName = prompt('Enter the expert name:');
        if (newExpertName && !expertsData.has(newExpertName)) {
            // Get the alternatives and criteria data
            const alternativesList = getAlternatives();
            const criteriaList = getCriteria();

            // Save the initial data for the new expert
            expertsData.set(newExpertName, {
                alternatives: alternativesList,
                criteria: criteriaList,
                values: []
            });

            //expertsData.set(newExpertName, {});
            const option = document.createElement('option');
            option.value = newExpertName;
            option.textContent = newExpertName;
            expertSelect.appendChild(option);
            expertSelect.value = newExpertName;

            // Call displayDecisionMatrixTable with the new expert name
            displayDecisionMatrixTable(newExpertName);
        
        }
    }

    // Add an event listener for the expert dropdown
    const expertSelect = document.getElementById('expert-select');
    expertSelect.addEventListener('change', function () {
        const selectedExpert = expertSelect.value;
        displayDecisionMatrixTable(selectedExpert);
    });

    document.getElementById('add-expert-button').addEventListener('click', addExpert);
    document.getElementById('save-expert-button').addEventListener('click', saveExpert);
    document.getElementById('delete-expert-button').addEventListener('click', deleteExpert);

    function validateDecisionMatrixInput(inputElement) {
        const scale = document.getElementById('scale-select').value;
        const inputValue = parseInt(inputElement.value, 10);

        let validValues;

        switch (scale) {
            case '3':
                validValues = [1, 2, 3];
                break;
            case '5':
                validValues = [1, 2, 3, 4, 5];
                break;
            case '7':
                validValues = [1, 2, 3, 4, 5, 6, 7];
                break;
            case 'custom':
                // Get valid values from the custom scale table
                // Implement this logic according to your custom scale table structure
                console.log("Before vals");
                const customScaleValues = JSON.parse(localStorage.getItem('customScaleValues')) || [];
                validValues = customScaleValues;
                console.log("valid values", validValues);
                break;
            default:
                validValues = [];
                break;
        }

        if (!validValues.includes(inputValue)) {
            alert(`Invalid value entered. Allowed values for this scale: ${validValues.join(', ')}`);
            inputElement.value = ''; // Clear the invalid input
        }
    }

    function createDecisionMatrixTable(alternativesList, criteriaList, values = [], isMeanTable = false) {
        const table = document.createElement('table');
        table.setAttribute('id', 'decision-matrix-table');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
    
        // Creating header row
        headerRow.appendChild(document.createElement('th')); // Empty cell for the upper-left corner
        criteriaList.forEach(criterion => {
            const th = document.createElement('th');
            th.textContent = criterion.name;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        const tbody = document.createElement('tbody');
        alternativesList.forEach((alternative, i) => {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = alternative;
            tr.appendChild(th);
    
            for (let j = 0; j < criteriaList.length; j++) {
                const td = document.createElement('td');
                if (isMeanTable && values[i] && values[i][j]) {
                    td.textContent = `(${values[i][j].l.toFixed(2)}, ${values[i][j].m.toFixed(2)}, ${values[i][j].u.toFixed(2)})`;
                } else {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'text');

                    // Set the input value to the saved value if it exists
                    if (values[i] && values[i][j] !== undefined) {
                        input.value = values[i][j];
                    }

                    input.addEventListener('input', function() {
                        validateDecisionMatrixInput(input);
                    });

                    td.appendChild(input);
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    
        return table;
    }
    
    function saveExpert() {
        const expertName = document.getElementById('expert-select').value;
        if (!expertName) {
            alert('No expert selected.');
            return;
        }
        const decisionMatrixTable = document.getElementById('decision-matrix-table');
        if (!decisionMatrixTable) {
            alert('No decision matrix table created.');
            return;
        }
        const decisionMatrixData = {
            alternatives: [],
            criteria: [],
            values: [],
            scale: ''
        };
        
        const tbody = decisionMatrixTable.querySelector('tbody');
        for (let i = 0; i < tbody.children.length; i++) {
            const row = tbody.children[i];
            const alternative = row.querySelector('th').textContent;
            decisionMatrixData.alternatives.push(alternative);
            decisionMatrixData.values[i] = [];
            for (let j = 0; j < row.children.length - 1; j++) {
                const input = row.children[j + 1].querySelector('input');
                decisionMatrixData.values[i][j] = parseInt(input.value, 10) || null;
            }
        }
        
        const thead = decisionMatrixTable.querySelector('thead');
        const headerRow = thead.querySelector('tr');
        for (let i = 1; i < headerRow.children.length; i++) {
            const criterion = headerRow.children[i].textContent;
            decisionMatrixData.criteria.push(criterion);
        }

        // Add the 'scale' value to the decisionMatrixData object
        const scale = document.getElementById('scale-select').value;
        decisionMatrixData.scale = scale;
        
        // Save decision matrix data from the table
        // Implement this logic according to your table structure
        expertsData.set(expertName, decisionMatrixData);
        console.log(`Expert data for "${expertName}" saved:`, decisionMatrixData);
        alert('Expert data saved.');
        sendData({expert_name: expertName, decision_matrix_data: decisionMatrixData});

        // Submit the form
       // document.getElementById("frontend-form").submit();
    }

    async function sendData(data) {
        const response = await fetch('http://127.0.0.1:8000/topsis/receive-data/', {
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

    async function deleteExpert() {
        const expertSelect = document.getElementById('expert-select');
        const expertName = expertSelect.value;
        if (!expertName) {
            alert('No expert selected.');
            return;
        }
        if (confirm(`Are you sure you want to delete expert "${expertName}"?`)) {
            // Delete expert from the frontend
            expertsData.delete(expertName);
            expertSelect.removeChild(expertSelect.selectedOptions[0]);
    
            // Delete expert from the backend
            const response = await fetch('http://127.0.0.1:8000/topsis/delete-expert/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ expert_name: expertName }),
            });
    
            if (response.ok) {
                const jsonResponse = await response.json();
                console.log('Response from backend:', jsonResponse);
            } else {
                console.error('Failed to delete expert from backend:', response.statusText);
            }
        }
    }

    async function getMeanOfExperts() {
        const expertSelect = document.getElementById('expert-select');
        const expertNames = Array.from(expertSelect.options).map(option => option.value);
    
        const response = await fetch('http://127.0.0.1:8000/topsis/mean-of-experts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ expert_names: expertNames }),
        });
    
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('JSON response:', jsonResponse); // test
            const meanValues = jsonResponse.mean_values;
            displayMeanValues(meanValues);
        } else {
            console.error('Failed to get mean values from backend:', response.statusText);
        }
    }
    
    function displayMeanValues(meanValues) {
        console.log('Mean values:', meanValues);
        // Get the decision-matrix-container element
        const decisionMatrixContainer = document.getElementById('decision-matrix-container');
        
        // Remove the existing decision matrix table if there's any
        const existingTable = document.getElementById('decision-matrix-table');
        if (existingTable) {
            existingTable.remove();
        }

        const existingMeanValuesTable = document.getElementById('mean-values-table');
        if (existingMeanValuesTable) {
            existingMeanValuesTable.remove();
        }

        const alternativesList = getAlternatives();
        const criteriaList = getCriteria();
    
        // Display the mean values
        const meanValuesTable = createDecisionMatrixTable(alternativesList, criteriaList, meanValues, true);
        decisionMatrixContainer.appendChild(meanValuesTable);
    }
    
    // Add an event listener for the "Mean of Experts" button
    const meanOfExpertsButton = document.getElementById('mean-of-experts-button');
    meanOfExpertsButton.addEventListener('click', getMeanOfExperts);


});