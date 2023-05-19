
document.addEventListener('DOMContentLoaded', function() {
    const steps = document.querySelectorAll('.step');
    const topsisCalculationButton = document.getElementById('topsis-caculation-button');
    const topsisBackButton = document.getElementById('topsis-back-button');

    topsisBackButton.addEventListener('click', function() {
        steps[4].style.display = 'none';
        steps[3].style.display = 'block';
    });

    function displayCriteriaTable() {
        // Retrieve the entered criteria from localStorage
        const enteredCriteria = JSON.parse(localStorage.getItem('criteria')) || [];

        // Clear the content of the criteria-table-container
        const criteriaTableContainer = document.getElementById('criteria-table-real');
        criteriaTableContainer.innerHTML = '';
        createCriteriaTable(enteredCriteria);
    }

    function createCriteriaTable(criteriaList) {
        const criteriaTableContainer = document.getElementById('criteria-table-real');
        const criteriaTable = document.createElement('table');
        criteriaTable.setAttribute('id', 'criteria-table');
      
        const headerRow = document.createElement('tr');
        const headers = ['Criteria Name', 'Type', 'l', 'm', 'u'];
        for (const header of headers) {
          const th = document.createElement('th');
          th.textContent = header;
          headerRow.appendChild(th);
        }
        criteriaTable.appendChild(headerRow);
      
        for (const crit of criteriaList) {
          const tr = document.createElement('tr');
          const nameTd = document.createElement('td');
          nameTd.textContent = crit.name;
          tr.appendChild(nameTd);
      
          const typeTd = document.createElement('td');
          typeTd.textContent = crit.type;
          tr.appendChild(typeTd);
      
          const lTd = document.createElement('td');
          lTd.textContent = crit.l;
          tr.appendChild(lTd);
      
          const mTd = document.createElement('td');
          mTd.textContent = crit.m;
          tr.appendChild(mTd);
      
          const uTd = document.createElement('td');
          uTd.textContent = crit.u;
          tr.appendChild(uTd);
      
          criteriaTable.appendChild(tr);
        }
        criteriaTableContainer.appendChild(criteriaTable);
    }

    function displayFuzzyScaleTable(scale) {
        const fuzzyScaleTableReal = document.getElementById('fuzzy-scale-tabe-real');
        fuzzyScaleTableReal.innerHTML = '';

        let scaleData = [];
        if (scale === '3') {
            scaleData = [
                { term: 'Low', l: 0, m: 0, u: 0.5 },
                { term: 'Medium', l: 0, m: 0.5, u: 1 },
                { term: 'High', l: 0.5, m: 1, u: 1 },
            ];
        } else if (scale === '5') {
            scaleData = [
                { term: 'Very Low', l: 0, m: 0, u: 0.25 },
                { term: 'Low', l: 0, m: 0.25, u: 0.5 },
                { term: 'Medium', l: 0.25, m: 0.5, u: 0.75 },
                { term: 'High', l: 0.5, m: 0.75, u: 1 },
                { term: 'Very High', l: 0.75, m: 1, u: 1 },
            ];
        } else if (scale === '7') {
            scaleData = [
                { term: 'Extremely Low', l: 0, m: 0, u: 0.15 },
                { term: 'Very Low', l: 0, m: 0.15, u: 0.3 },
                { term: 'Low', l: 0.15, m: 0.3, u: 0.45 },
                { term: 'Medium', l: 0.3, m: 0.45, u: 0.6 },
                { term: 'High', l: 0.45, m: 0.6, u: 0.75 },
                { term: 'Very High', l: 0.6, m: 0.75, u: 0.9 },
                { term: 'Extremely High', l: 0.75, m: 0.9, u: 1 },
            ];
        }

        createFuzzyScaleTable(scaleData);
    }

    function createFuzzyScaleTable(scaleData) {
        const fuzzyScaleTableReal = document.getElementById('fuzzy-scale-tabe-real');
        const scaleTable = document.createElement('table');
        scaleTable.setAttribute('id', 'fuzzy-scale-table');

        const headerRow = document.createElement('tr');
        const headers = ['Term', 'l', 'm', 'u'];
        for (const header of headers) {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        }
        scaleTable.appendChild(headerRow);

        for (const scale of scaleData) {
            const tr = document.createElement('tr');
            const termTd = document.createElement('td');
            termTd.textContent = scale.term;
            tr.appendChild(termTd);

            const lTd = document.createElement('td');
            lTd.textContent = scale.l;
            tr.appendChild(lTd);

            const mTd = document.createElement('td');
            mTd.textContent = scale.m;
            tr.appendChild(mTd);

            const uTd = document.createElement('td');
            uTd.textContent = scale.u;
            tr.appendChild(uTd);

            scaleTable.appendChild(tr);
        }
        fuzzyScaleTableReal.appendChild(scaleTable);
    }

    topsisCalculationButton.addEventListener('click', async function() {    
        displayCriteriaTable();

        const scale = localStorage.getItem('scale');
        console.log("Scale value:", scale)
        displayFuzzyScaleTable(scale);

        await getMeanOfExperts();
        const meanValues = JSON.parse(localStorage.getItem('meanValues'));
        displayMeanValues(meanValues);

        await getNormalizedDecisionMatrix();
        const normalizedDecisionMatrix = JSON.parse(localStorage.getItem('normalizedDecisionMatrix'));
        const weightedNormalizedDecisionMatrix = JSON.parse(localStorage.getItem('weightedNormalizedDecisionMatrix'));
        const distanceToBest = JSON.parse(localStorage.getItem('distanceToBest'));
        const distanceToWorst = JSON.parse(localStorage.getItem('distanceToWorst'));
        const relativeCloseness = JSON.parse(localStorage.getItem('relativeCloseness'));
        const sortedCloseness = [...relativeCloseness].sort((a, b) => b - a);
        const ranks = relativeCloseness.map((value) => sortedCloseness.indexOf(value) + 1)

        const distanceValues = [distanceToBest, distanceToWorst];

        displayWeightedNormalizedDecisionMatrix(weightedNormalizedDecisionMatrix);
        displayNormalizedDecisionMatrix(normalizedDecisionMatrix);
        displayFPISandFNIS();
        displayDistanceTable(distanceValues);
        displayRank(relativeCloseness, ranks);
    
        steps[4].style.display = 'block';
        steps[3].style.display = 'none';
    });

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
            localStorage.setItem('meanValues', JSON.stringify(meanValues)); 
        } else {
            console.error('Failed to get mean values from backend:', response.statusText);
        }
    }

    function getCriteriaTypes() {
        const criteriaJSON = localStorage.getItem('criteria');
        if (criteriaJSON) {
            const criteria = JSON.parse(criteriaJSON);
            console.log("Get criteria type:", criteria); //test
            const criteriaTypes = criteria.map(criterion => criterion.type);
            //return criteria.map(criterion => criterion.type);
            console.log("Extracted criteria types:", criteriaTypes);
            return criteriaTypes;
        }
        return [];
    }

    function getCriterionWeights() {
        const criteriaJSON = localStorage.getItem('criteria');
        if (criteriaJSON) {
            const criteria = JSON.parse(criteriaJSON);
            console.log("Get criterion weights:", criteria); //test
            return criteria.map(criterion => ({l: criterion.l, m: criterion.m, u: criterion.u}));
        }
        return [];
    }
    

    async function getNormalizedDecisionMatrix() {
        const expertSelect = document.getElementById('expert-select');
        const expertNames = Array.from(expertSelect.options).map(option => option.value);
        const criteriaTypes = getCriteriaTypes();
        console.log("Criteria types before sending:", criteriaTypes); //test
        const criterionWeights = getCriterionWeights();
    
        const response = await fetch('http://127.0.0.1:8000/topsis/normalize-decision-matrix/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ expert_names: expertNames, criteria_types: criteriaTypes, criterion_weights: criterionWeights }),
        });
    
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('JSON response:', jsonResponse);
            const normalizedDecisionMatrix = jsonResponse.normalized_decision_matrix;
            localStorage.setItem('normalizedDecisionMatrix', JSON.stringify(normalizedDecisionMatrix));

            const weightedNormalizedDecisionMatrix = jsonResponse.weighted_normalized_decision_matrix;
            localStorage.setItem('weightedNormalizedDecisionMatrix', JSON.stringify(weightedNormalizedDecisionMatrix));

            const fpis = jsonResponse.fpis;
            localStorage.setItem('fpis', JSON.stringify(fpis));

            const fnis = jsonResponse.fnis;
            localStorage.setItem('fnis', JSON.stringify(fnis));

            const distanceToBest = jsonResponse.distance_to_best;
            localStorage.setItem('distanceToBest', JSON.stringify(distanceToBest));

            const distanceToWorst = jsonResponse.distance_to_worst;
            localStorage.setItem('distanceToWorst', JSON.stringify(distanceToWorst));

            const relativeCloseness = jsonResponse.relative_closeness;
            localStorage.setItem('relativeCloseness', JSON.stringify(relativeCloseness));
            
        } else {
            console.error('Failed to get normalized decision matrix from backend:', response.statusText);
        }
    }

    function createFuzzyScaleTable(scaleData) {
        const fuzzyScaleTableReal = document.getElementById('fuzzy-scale-tabe-real');
        const scaleTable = document.createElement('table');
        scaleTable.setAttribute('id', 'fuzzy-scale-table');

        const headerRow = document.createElement('tr');
        const headers = ['Term', 'l', 'm', 'u'];
        for (const header of headers) {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        }
        scaleTable.appendChild(headerRow);

        for (const scale of scaleData) {
            const tr = document.createElement('tr');
            const termTd = document.createElement('td');
            termTd.textContent = scale.term;
            tr.appendChild(termTd);

            const lTd = document.createElement('td');
            lTd.textContent = scale.l;
            tr.appendChild(lTd);

            const mTd = document.createElement('td');
            mTd.textContent = scale.m;
            tr.appendChild(mTd);

            const uTd = document.createElement('td');
            uTd.textContent = scale.u;
            tr.appendChild(uTd);

            scaleTable.appendChild(tr);
        }
        fuzzyScaleTableReal.appendChild(scaleTable);
    }

    function createDecisionMatrixTable(alternativesList, criteriaList, values = [], isMeanTable = false, isNormalizedMatrix = false, isWeightedNormalizedMatrix = false, isDistanceTable = false, containerId) {
        const decisionMatrixContainer = document.getElementById(containerId);
        const table = document.createElement('table');
        table.setAttribute('id', 'calculate-decision-matrix-table')
    
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
                    td.textContent = `(${values[i][j]?.l?.toFixed(3)}, ${values[i][j]?.m?.toFixed(3)}, ${values[i][j]?.u?.toFixed(3)})`;
                }
                if (isNormalizedMatrix && values[i] && values[i][j]) {
                    td.textContent = `(${values[i][j][0]?.toFixed(3)}, ${values[i][j][1]?.toFixed(3)}, ${values[i][j][2]?.toFixed(3)})`;
                }
                if (isWeightedNormalizedMatrix && values[i] && values[i][j]) {
                    td.textContent = `(${values[i][j][0]?.toFixed(3)}, ${values[i][j][1]?.toFixed(3)}, ${values[i][j][2]?.toFixed(3)})`;
                }
                if (isDistanceTable && values[0] && values[0][i]) {
                    td.textContent = `${values[j][i]?.toFixed(3)}`;
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        });
        table.appendChild(tbody)
    
        // Append the table to the decision-matrix-table container
        decisionMatrixContainer.appendChild(table);
    }

    function displayMeanValues(meanValues) {
        console.log('Mean values:', meanValues);
        // Get the decision-matrix-container element
        const decisionMatrixContainer = document.getElementById('decision-matrix-table-real');
        decisionMatrixContainer.innerHTML = '';

        const alternativesList = getAlternatives();
        const criteriaList = getCriteria();
    
        // Display the mean values
        createDecisionMatrixTable(alternativesList, criteriaList, meanValues, true, false, false, false, 'decision-matrix-table-real'); 
    }

    function displayNormalizedDecisionMatrix(normalizedDecisionMatrix) {
        const decisionMatrixContainer = document.getElementById('normalize-table-real');
        decisionMatrixContainer.innerHTML = '';

        const alternativesList = getAlternatives();
        const criteriaList = getCriteria();
    
        createDecisionMatrixTable(alternativesList, criteriaList, normalizedDecisionMatrix, false, true, false, false, 'normalize-table-real');
    }
    
    function displayWeightedNormalizedDecisionMatrix(weightedNormalizedDecisionMatrix) {
        const decisionMatrixContainer = document.getElementById('weighted-normalize-table-real');
        decisionMatrixContainer.innerHTML = '';

        const alternativesList = getAlternatives();
        const criteriaList = getCriteria();
    
        createDecisionMatrixTable(alternativesList, criteriaList, weightedNormalizedDecisionMatrix, false, false, true, false, 'weighted-normalize-table-real');
    }

    function displayDistanceTable(distanceValues) {
        const decisionMatrixContainer = document.getElementById('distance-ideal-solution-table-real');
        decisionMatrixContainer.innerHTML = '';

        const alternativesList = getAlternatives();
        const criteriaList = [
            { name: "Distance from Positive Ideal" },
            { name: "Distance from Negative Ideal" }
        ];
        createDecisionMatrixTable(alternativesList, criteriaList, distanceValues, false, false, false, true, "distance-ideal-solution-table-real");
    }
    
    
    function displayFPISandFNIS() {
        const decisionMatrixContainer = document.getElementById('ideal-solution-table-real');
        decisionMatrixContainer.innerHTML = '';

        const fpis = JSON.parse(localStorage.getItem('fpis'));
        const fnis = JSON.parse(localStorage.getItem('fnis'));
        const criteria = getCriteria();
    
        const table = document.createElement('table');
        table.setAttribute('id', 'fpis-fnis-table');
        table.setAttribute('class', 'table');
    
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
    
        const thCriteria = document.createElement('th');
        thCriteria.textContent = 'Criteria';
        tr.appendChild(thCriteria);
    
        const thPositiveIdeal = document.createElement('th');
        thPositiveIdeal.textContent = 'Positive Ideal';
        tr.appendChild(thPositiveIdeal);
    
        const thNegativeIdeal = document.createElement('th');
        thNegativeIdeal.textContent = 'Negative Ideal';
        tr.appendChild(thNegativeIdeal);
    
        thead.appendChild(tr);
        table.appendChild(thead);
    
        const tbody = document.createElement('tbody');
    
        for (let i = 0; i < fpis.length; i++) {
            const tr = document.createElement('tr');
    
            const tdCriteria = document.createElement('td');
            tdCriteria.textContent = criteria[i].name;
            tr.appendChild(tdCriteria);
    
            const tdPositiveIdeal = document.createElement('td');
            tdPositiveIdeal.textContent = `(${fpis[i][0].toFixed(3)}, ${fpis[i][1].toFixed(3)}, ${fpis[i][2].toFixed(3)})`;
            tr.appendChild(tdPositiveIdeal);
    
            const tdNegativeIdeal = document.createElement('td');
            tdNegativeIdeal.textContent = `(${fnis[i][0].toFixed(3)}, ${fnis[i][1].toFixed(3)}, ${fnis[i][2].toFixed(3)})`;
            tr.appendChild(tdNegativeIdeal);
    
            tbody.appendChild(tr);
        }
    
        table.appendChild(tbody);
    
        const container = document.getElementById('ideal-solution-table-real');
        container.appendChild(table);
    }
    
    function displayRank(closenessValues, ranks) {
        const decisionMatrixContainer = document.getElementById('rank-table-real');
        decisionMatrixContainer.innerHTML = '';

        const rankTableReal = document.getElementById('rank-table-real');
        const table = document.createElement('table');
    
        const alternativesList = getAlternatives();
        // Create header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Alternative', 'Closeness', 'Rank'].forEach((header) => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        // Create table body
        const tbody = document.createElement('tbody');
        alternativesList.forEach((alternative, i) => {
            const tr = document.createElement('tr');
            const alternativeCell = document.createElement('td');
            alternativeCell.textContent = alternative;
            tr.appendChild(alternativeCell);
    
            const closenessCell = document.createElement('td');
            closenessCell.textContent = closenessValues[i].toFixed(3);
            tr.appendChild(closenessCell);
    
            const rankCell = document.createElement('td');
            rankCell.textContent = ranks[i];
            tr.appendChild(rankCell);
    
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    
        rankTableReal.appendChild(table);
    }
    
    function downloadTableAsExcel(table, filename) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(table);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, filename);
    }
    
    document.getElementById('download-excel').addEventListener('click', function () {
        const table = document.querySelector('#rank-table-real table');
        downloadTableAsExcel(table, 'RankTable.xlsx');
    });
});
