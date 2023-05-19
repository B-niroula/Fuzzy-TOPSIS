document.addEventListener('DOMContentLoaded', function() {
    const steps = document.querySelectorAll('.step');
    const scaleBackButton = document.getElementById('scale-back-button');
    const contextMenu = document.getElementById('context-menu');
    const insertRowAbove = document.getElementById('insert-row-above');
    const insertRowBelow = document.getElementById('insert-row-below');
    const deleteRow = document.getElementById('delete-row');
    const scaleNextButton = document.getElementById('scale-next-button');


    let clickedRow;

    // Add the event listener for the scale-back-button
    scaleBackButton.addEventListener('click', function () {
        steps[2].style.display = 'none';
        steps[1].style.display = 'block';
        saveTables();
    });

    const scaleTableContainer = document.getElementById('scale-table-container');

    function createScaleTable(scaleData) {
        // Create an h4 element for the heading
        const heading = document.createElement('h4');
        heading.textContent = 'Scale Table';

        // Create the table
        const table = document.createElement('table');
        table.setAttribute('border', '1');

        // Add table header
        const headerRow = table.insertRow();
        headerRow.innerHTML = `<th>Code</th><th>Linguistic Terms</th><th>L</th><th>M</th><th>U</th>`;

        // Add table rows
        scaleData.forEach((item, index) => {
            const row = table.insertRow();
            row.innerHTML = `<td>${index + 1}</td><td>${item.term}</td><td>${item.l}</td><td>${item.m}</td><td>${item.u}</td>`;
        });

        // Clear the container and append the heading and table
        scaleTableContainer.innerHTML = '';
        scaleTableContainer.appendChild(heading);
        scaleTableContainer.appendChild(table);
    }

    // Default scale table for the 3-point scale
    createScaleTable([
        { term: 'Low', l: 0, m: 0, u: 0.5 },
        { term: 'Medium', l: 0, m: 0.5, u: 1 },
        { term: 'High', l: 0.5, m: 1, u: 1 },
    ]);

    const scaleSelect = document.getElementById('scale-select');
    scaleSelect.addEventListener('change', function() {
        localStorage.setItem('scale', scaleSelect.value);
    });

    scaleSelect.addEventListener('change', function () {
        let scaleData = [];
        if (scaleSelect.value === '3') {
            createScaleTable([
                { term: 'Low', l: 0, m: 0, u: 0.5 },
                { term: 'Medium', l: 0, m: 0.5, u: 1 },
                { term: 'High', l: 0.5, m: 1, u: 1 },
            ]);
        } else if (scaleSelect.value === '5') {
            createScaleTable([
                { term: 'Very Low', l: 0, m: 0, u: 0.25 },
                { term: 'Low', l: 0, m: 0.25, u: 0.5 },
                { term: 'Medium', l: 0.25, m: 0.5, u: 0.75 },
                { term: 'High', l: 0.5, m: 0.75, u: 1 },
                { term: 'Very High', l: 0.75, m: 1, u: 1 },
            ]);
        } else if (scaleSelect.value === '7') {
            createScaleTable([
                { term: 'Extremely Low', l: 0, m: 0, u: 0.167 },
                { term: 'Very Low', l: 0, m: 0.167, u: 0.333 },
                { term: 'Low', l: 0.167, m: 0.333, u: 0.5 },
                { term: 'Medium', l: 0.333, m: 0.5, u: 0.667 },
            { term: 'High', l: 0.5, m: 0.667, u: 0.833 },
            { term: 'Very High', l: 0.667, m: 0.833, u: 1 },
            { term: 'Extremely High', l: 0.833, m: 1, u: 1 },
        ]);
    } else if (scaleSelect.value === 'custom') {
        console.log('Custom scale selected'); //checking
        // Add custom scale table creation logic here
        const customScaleTable = document.createElement('table');
        customScaleTable.setAttribute('border', '1');
        customScaleTable.setAttribute('id', 'custom-scale-table');
        //customScaleTable.setAttribute('class', 'custom-table');
        customScaleTable.style.marginTop = '150px';
        //customScaleTable.style.marginLeft = '180px';
        scaleTableContainer.style.marginTop = '50px';
        const customScaleHeaderRow = customScaleTable.insertRow();
        customScaleHeaderRow.innerHTML = `<th>Code</th><th>Linguistic Terms</th><th>L</th><th>M</th><th>U</th>`;

        for (let i = 0; i < 3; i++) {
            const row = customScaleTable.insertRow();
            row.innerHTML = `<td>${i + 1}</td><td><input type="text"></td><td><input type="number" step="0.01"></td><td><input type="number" step="0.01"></td><td><input type="number" step="0.01"></td>`;
        }

        scaleTableContainer.innerHTML = '';
        scaleTableContainer.appendChild(customScaleTable);
        const customScaleValues = scaleData.map(item => item.m);
        localStorage.setItem('customScaleValues', JSON.stringify(customScaleValues));
        console.log('scaleTableContainer:', customScaleValues); // chekcing
        customScaleTable.addEventListener('contextmenu', function (event) {
            clickedRow = event.target.parentNode;
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${event.pageX}px`;
            contextMenu.style.top = `${event.pageY}px`;
        });

        document.addEventListener('click', function () {
            contextMenu.style.display = 'none';
        });
    } else {
        scaleTableContainer.innerHTML = '';
    }
    });

    insertRowAbove.addEventListener('click', function () {
    const newRow = clickedRow.parentNode.insertRow(clickedRow.rowIndex);
    newRow.innerHTML = `<td></td><td><input type="text"></td><td><input type="number" step="0.01"></td><td><input type="number" step="0.01"></td><td><input type="number" step="0.01"></td>`;
    updateRowNumbers();
    contextMenu.style.display = 'none';
    });

    insertRowBelow.addEventListener('click', function () {
    const newRow = clickedRow.parentNode.insertRow(clickedRow.rowIndex + 1);
    newRow.innerHTML = '<td></td><td><input type="text"></td><td><input type="number" step="0.01"></td><td><input type="number" step="0.01"></td><td><input type="number" step="0.01"></td>';
    updateRowNumbers();
    contextMenu.style.display = 'none';
    });

    deleteRow.addEventListener('click', function () {
    if (clickedRow.rowIndex > 0) {
        clickedRow.parentNode.deleteRow(clickedRow.rowIndex);
        updateRowNumbers();
    }
    contextMenu.style.display = 'none';
    });

    function updateRowNumbers() {
    const customScaleTable = document.getElementById('custom-scale-table');
    for (let i = 1; i < customScaleTable.rows.length; i++) {
        customScaleTable.rows[i].cells[0].textContent = i;
    }
    }

    // Add click event listener for the "scale-next-button"
    scaleNextButton.addEventListener('click', function () {
    console.log('Next button clicked');
    steps[2].style.display = 'none';
    steps[3].style.display = 'block';
    });

    // Add this function after your existing event listeners and functions
    function saveTables() {
        const tablesContainer = document.getElementById('tables-container');
        const alternativesTable = tablesContainer.querySelector('.alternatives-table');
        const criteriaTable = tablesContainer.querySelector('.criteria-table');

        // Save the alternatives and criteria as arrays
        const alternatives = Array.from(alternativesTable.querySelectorAll('input[type="text"]')).map(input => input.value);
        const criteria = Array.from(criteriaTable.querySelectorAll('input[type="text"]')).map(input => input.value);

        // Save the alternatives and criteria in the localStorage
        localStorage.setItem('alternatives', JSON.stringify(alternatives));
        localStorage.setItem('criteria', JSON.stringify(criteria));
    }
    

});