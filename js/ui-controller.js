// UI state variables
let startNodeId = 26; // Default start
let endNodeId = 4;   // Default end
let activeAlgorithm = "Dijkstra";
let currentPath = [];
let pathCost = 0;
let zoom = 1;
let panOffset = { x: 0, y: 0 };
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };

// Find paths using all algorithms
function findPaths() {
    // Reset previous results
    algorithmResults.forEach(result => {
        result.visitedNodes = [];
    });
    
    // Execute each algorithm
    dijkstra(startNodeId, endNodeId);
    aStar(startNodeId, endNodeId);
    bellmanFord(startNodeId, endNodeId);
    floydWarshall(startNodeId, endNodeId);
    
    // Display results
    displayResults();
    
    // Redraw graph with new paths
    drawGraph();
}

// Improved position calculation for nodes using Fruchterman-Reingold algorithm
function calculateNodePositions() {
    const nodePositions = {};
    const nodeCount = Object.keys(nodeNames).length;
    
    // Calculate optimal distance between nodes based on available space
    const width = window.innerWidth - 350; // Subtract sidebar width
    const height = window.innerHeight;
    const area = width * height;
    const k = Math.sqrt(area / nodeCount) * 0.8;
    
    // Initial positions in a grid pattern
    const cols = Math.ceil(Math.sqrt(nodeCount));
    const rows = Math.ceil(nodeCount / cols);
    
    Object.keys(nodeNames).forEach((id, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        const x = (col + 0.5) * (width / cols);
        const y = (row + 0.5) * (height / rows);
        
        nodePositions[id] = { x, y };
    });
    
    // Apply force-directed layout algorithm
    const iterations = 150;
    const temperature = 0.1 * Math.min(width, height);
    const coolingFactor = 0.95;
    
    let temp = temperature;
    
    for (let iter = 0; iter < iterations; iter++) {
        // Calculate forces
        const forces = {};
        Object.keys(nodePositions).forEach(id => {
            forces[id] = { x: 0, y: 0 };
        });
        
        // Repulsive forces between all nodes
        Object.keys(nodePositions).forEach(id1 => {
            Object.keys(nodePositions).forEach(id2 => {
                if (id1 !== id2) {
                    const pos1 = nodePositions[id1];
                    const pos2 = nodePositions[id2];
                    
                    const dx = pos1.x - pos2.x;
                    const dy = pos1.y - pos2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
                    
                    // Repulsive force
                    const force = (k * k) / distance;
                    
                    forces[id1].x += (dx / distance) * force;
                    forces[id1].y += (dy / distance) * force;
                }
            });
        });
        
        // Attractive forces between connected nodes
        Object.keys(graph).forEach(id1 => {
            const pos1 = nodePositions[id1];
            
            graph[id1].forEach(edge => {
                const id2 = edge.to.toString();
                const pos2 = nodePositions[id2];
                
                const dx = pos1.x - pos2.x;
                const dy = pos1.y - pos2.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
                
                // Attractive force
                const force = (distance * distance) / k;
                
                forces[id1].x -= (dx / distance) * force;
                forces[id1].y -= (dy / distance) * force;
            });
        });
        
        // Apply forces with temperature limiting maximum movement
        Object.keys(nodePositions).forEach(id => {
            const pos = nodePositions[id];
            const force = forces[id];
            
            // Limit movement to temperature
            const forceMagnitude = Math.sqrt(force.x * force.x + force.y * force.y) || 0.1;
            const scale = Math.min(forceMagnitude, temp) / forceMagnitude;
            
            pos.x += force.x * scale;
            pos.y += force.y * scale;
            
            // Keep nodes within bounds with margins
            const margin = 50;
            pos.x = Math.max(margin, Math.min(width - margin, pos.x));
            pos.y = Math.max(margin, Math.min(height - margin, pos.y));
        });
        
        // Cool temperature
        temp *= coolingFactor;
    }
    
    return nodePositions;
}

// Draw the graph visualization
function drawGraph() {
    const container = document.getElementById('graph-container');
    container.innerHTML = '';
    
    const nodePositions = calculateNodePositions();
    
    // Get the active algorithm details
    const activeAlgoDetails = algorithmResults.find(algo => algo.name === activeAlgorithm);
    const activeAlgoClass = activeAlgoDetails ? activeAlgoDetails.cssClass : 'dijkstra';
    
    // Create edge map for path checking
    const pathEdges = new Map();
    for (let i = 0; i < currentPath.length - 1; i++) {
        const from = currentPath[i];
        const to = currentPath[i + 1];
        pathEdges.set(`${from}-${to}`, true);
        pathEdges.set(`${to}-${from}`, true);
    }
    
    // Draw edges first
    Object.keys(graph).forEach(from => {
        const fromId = parseInt(from);
        graph[from].forEach(edge => {
            const toId = edge.to;
            
            // Only draw edges once (for undirected graph)
            if (fromId < toId) {
                const to = toId.toString();
                const fromPos = nodePositions[from];
                const toPos = nodePositions[to];
                
                if (fromPos && toPos) {
                    const dx = toPos.x - fromPos.x;
                    const dy = toPos.y - fromPos.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    
                    const edgeEl = document.createElement('div');
                    edgeEl.className = 'edge';
                    if (pathEdges.has(`${from}-${to}`)) {
                        edgeEl.classList.add('path', activeAlgoClass);
                    }
                    
                    edgeEl.style.width = `${length}px`;
                    edgeEl.style.left = `${fromPos.x}px`;
                    edgeEl.style.top = `${fromPos.y}px`;
                    edgeEl.style.transform = `rotate(${angle}deg)`;
                    
                    container.appendChild(edgeEl);
                }
            }
        });
    });
    
    // Draw nodes
    Object.keys(nodePositions).forEach(id => {
        const pos = nodePositions[id];
        const nodeId = parseInt(id);
        
        // Create node element
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.dataset.id = id;
        
        // Special styling for start and end nodes
        if (nodeId === startNodeId) {
            nodeEl.classList.add('start');
        } else if (nodeId === endNodeId) {
            nodeEl.classList.add('end');
        } else if (currentPath.includes(nodeId)) {
            nodeEl.classList.add('path', activeAlgoClass);
        }
        
        nodeEl.style.left = `${pos.x}px`;
        nodeEl.style.top = `${pos.y}px`;
        
        // Add node label
        const labelEl = document.createElement('div');
        labelEl.className = 'node-label';
        labelEl.textContent = nodeNames[id];
        
        container.appendChild(nodeEl);
        container.appendChild(labelEl);
        
        // Position label near node
        labelEl.style.left = `${pos.x}px`;
        labelEl.style.top = `${pos.y - 20}px`;
        
        // Add event listeners for node interaction
        nodeEl.addEventListener('click', () => {
            handleNodeClick(nodeId);
        });
    });
}

// Handle node click - toggle between start and end nodes
function handleNodeClick(nodeId) {
    if (nodeId === startNodeId) {
        return; // No change if clicking current start node
    } else if (nodeId === endNodeId) {
        // Swap start and end nodes
        const temp = startNodeId;
        startNodeId = endNodeId;
        endNodeId = temp;
    } else {
        // Set as new end node
        endNodeId = nodeId;
    }
    
    // Update UI dropdowns
    document.getElementById('start-select').value = startNodeId;
    document.getElementById('end-select').value = endNodeId;
    
    // Recalculate paths with new start/end
    findPaths();
}

// Display algorithm results in sidebar
function displayResults() {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    
    // Sort algorithms by execution time
    const sortedResults = [...algorithmResults].sort((a, b) => a.time - b.time);
    const fastestAlgorithm = sortedResults[0];
    
    // Display result for each algorithm
    sortedResults.forEach((result, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = `algorithm-results ${result.name === activeAlgorithm ? 'active' : ''} ${result.cssClass}`;
        
        resultDiv.innerHTML = `
            <div class="algorithm-name ${result.cssClass}">${result.name}</div>
            <div class="info-line">Time: ${result.time.toFixed(6)} ms</div>
            <div class="info-line">Distance: ${result.pathCost.toFixed(1)}</div>
            <div class="info-line">Path length: ${result.path.length} nodes</div>
        `;
        
        // Highlight fastest algorithm
        if (index === 0) {
            resultDiv.innerHTML += `
                <div class="info-line" style="font-weight: bold; color: #27ae60;">Fastest algorithm</div>
            `;
        }
        
        // Add click handler to switch active algorithm
        resultDiv.addEventListener('click', () => {
            activeAlgorithm = result.name;
            currentPath = result.path;
            pathCost = result.pathCost;
            
            // Update UI
            updateActiveAlgorithm(result.name);
            drawGraph();
            displayPathInfo();
        });
        
        resultsContainer.appendChild(resultDiv);
    });
    
    // Also update the path display
    displayPathInfo();
}

// Display path information
function displayPathInfo() {
    const pathDisplay = document.getElementById('path-display');
    const distanceDisplay = document.getElementById('distance-display');
    const algorithmNameDisplay = document.getElementById('active-algorithm-name');
    
    // Clear previous content
    pathDisplay.textContent = '';
    
    // Get active algorithm info
    const algo = algorithmResults.find(a => a.name === activeAlgorithm);
    
    if (!algo || !algo.path || algo.path.length === 0) {
        algorithmNameDisplay.textContent = "Shortest Path";
        distanceDisplay.textContent = 'Distance: N/A';
        return;
    }
    
    // Create path text with node names
    const pathText = algo.path.map(nodeId => nodeNames[nodeId]).join(' → ');
    
    pathDisplay.textContent = pathText;
    distanceDisplay.textContent = `Total distance: ${algo.pathCost.toFixed(1)}`;
    algorithmNameDisplay.textContent = "Shortest Path";
    algorithmNameDisplay.className = `algorithm-name ${algo.cssClass}`;
}

// Update active algorithm selection
function updateActiveAlgorithm(algorithm) {
    // Update button styles
    document.querySelectorAll('.controls button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Update algorithm results styles
    document.querySelectorAll('.algorithm-results').forEach(div => {
        div.classList.remove('active');
    });
    
    // Get active algorithm elements
    const algoButton = document.getElementById(`${algorithm.toLowerCase().replace('-', '')}-btn`);
    const algoResults = document.querySelector(`.algorithm-results.${algorithm.toLowerCase().replace('-', '')}`);
    
    if (algoButton) algoButton.classList.add('active');
    if (algoResults) algoResults.classList.add('active');
}

// Initialize the demo
function initDemo() {
    initializeGraph();
    
    // Populate node selection dropdowns
    const startSelect = document.getElementById('start-select');
    const endSelect = document.getElementById('end-select');
    
    Object.keys(nodeNames).forEach(id => {
        const option1 = document.createElement('option');
        option1.value = id;
        option1.textContent = nodeNames[id];
        
        const option2 = document.createElement('option');
        option2.value = id;
        option2.textContent = nodeNames[id];
        
        startSelect.appendChild(option1);
        endSelect.appendChild(option2);
    });
    
    // Set default values
    startSelect.value = startNodeId;
    endSelect.value = endNodeId;
    
    // Add event listeners
    document.getElementById('find-path-btn').addEventListener('click', () => {
        startNodeId = parseInt(startSelect.value);
        endNodeId = parseInt(endSelect.value);
        findPaths();
    });
    
    // Algorithm selection buttons
    document.getElementById('dijkstra-btn').addEventListener('click', () => {
        activeAlgorithm = "Dijkstra";
        updateActiveAlgorithm(activeAlgorithm);
        const result = algorithmResults.find(r => r.name === activeAlgorithm);
        currentPath = result.path;
        pathCost = result.pathCost;
        drawGraph();
        displayPathInfo();
    });
    
    document.getElementById('astar-btn').addEventListener('click', () => {
        activeAlgorithm = "A*";
        updateActiveAlgorithm(activeAlgorithm);
        const result = algorithmResults.find(r => r.name === activeAlgorithm);
        currentPath = result.path;
        pathCost = result.pathCost;
        drawGraph();
        displayPathInfo();
    });
    
    document.getElementById('bellman-btn').addEventListener('click', () => {
        activeAlgorithm = "Bellman-Ford";
        updateActiveAlgorithm(activeAlgorithm);
        const result = algorithmResults.find(r => r.name === activeAlgorithm);
        currentPath = result.path;
        pathCost = result.pathCost;
        drawGraph();
        displayPathInfo();
    });
    
    document.getElementById('floyd-btn').addEventListener('click', () => {
        activeAlgorithm = "Floyd-Warshall";
        updateActiveAlgorithm(activeAlgorithm);
        const result = algorithmResults.find(r => r.name === activeAlgorithm);
        currentPath = result.path;
        pathCost = result.pathCost;
        drawGraph();
        displayPathInfo();
    });
    
    document.getElementById('reset-view-btn').addEventListener('click', () => {
        zoom = 1;
        panOffset = { x: 0, y: 0 };
        drawGraph();
    });
    
    // Enable graph pan & zoom
    const graphContainer = document.getElementById('graph-container');
    
    graphContainer.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left click
            isDragging = true;
            lastMousePos = { x: e.clientX, y: e.clientY };
        }
    });
    
    graphContainer.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            
            panOffset.x += dx;
            panOffset.y += dy;
            
            lastMousePos = { x: e.clientX, y: e.clientY };
            
            // Apply transform
            graphContainer.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`;
        }
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    graphContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoom = Math.max(0.5, Math.min(2, zoom + delta));
        
        // Apply transform
        graphContainer.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`;
    });
    
    // Initial calculations
    findPaths();
    drawGraph();
}

// Start the demo when page is loaded
window.addEventListener('load', initDemo);
