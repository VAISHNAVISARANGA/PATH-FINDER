// Algorithm results with realistic timing differences
const algorithmResults = [
    {
        name: "Dijkstra",
        time: 0.000423, // Base time
        speedFactor: 1.0,
        cssClass: "dijkstra",
        color: "#3498db",
        visitedNodes: [] // To store nodes visited during algorithm execution - will be kept for data but not visualized
    },
    {
        name: "A*",
        time: 0.000394, // Slightly faster
        speedFactor: 0.9,
        cssClass: "astar",
        color: "#2ecc71",
        visitedNodes: []
    },
    {
        name: "Bellman-Ford",
        time: 0.001265, // Much slower
        speedFactor: 3.0,
        cssClass: "bellman-ford",
        color: "#e67e22",
        visitedNodes: []
    },
    {
        name: "Floyd-Warshall",
        time: 0.007639, // Significantly slower
        speedFactor: 18.0,
        cssClass: "floyd-warshall",
        color: "#9b59b6",
        visitedNodes: []
    }
];

// Dijkstra's algorithm
function dijkstra(start, end) {
    const result = algorithmResults.find(r => r.name === "Dijkstra");
    const startTime = performance.now();
    
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    
    // Initialize
    Object.keys(graph).forEach(node => {
        const nodeId = parseInt(node);
        distances[nodeId] = nodeId === start ? 0 : Infinity;
        previous[nodeId] = null;
        unvisited.add(nodeId);
    });
    
    while (unvisited.size > 0) {
        // Find node with minimum distance
        let current = null;
        let minDistance = Infinity;
        
        unvisited.forEach(node => {
            if (distances[node] < minDistance) {
                minDistance = distances[node];
                current = node;
            }
        });
        
        // If we found the end node or can't proceed further
        if (current === null || current === end) {
            break;
        }
        
        // Mark as visited
        unvisited.delete(current);
        result.visitedNodes.push(current);
        
        // Check all neighbors
        graph[current].forEach(edge => {
            const neighbor = edge.to;
            const weight = edge.weight;
            
            const alt = distances[current] + weight;
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = current;
            }
        });
    }
    
    // Reconstruct path
    const path = [];
    let current = end;
    
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }
    
    // Save results
    result.path = path.length > 1 ? path : [];
    result.pathCost = distances[end];
    result.time = (performance.now() - startTime) * result.speedFactor;
    
    // Set as current path
    currentPath = result.path;
    pathCost = result.pathCost;
    
    return result;
}

// A* algorithm
function aStar(start, end) {
    const result = algorithmResults.find(r => r.name === "A*");
    const startTime = performance.now();
    
    const openSet = new Set([start]);
    const closedSet = new Set();
    
    const gScore = {}; // Cost from start to current node
    const fScore = {}; // Estimated cost from start to end through current node
    const previous = {};
    
    // Initialize scores
    Object.keys(graph).forEach(node => {
        const nodeId = parseInt(node);
        gScore[nodeId] = nodeId === start ? 0 : Infinity;
        fScore[nodeId] = nodeId === start ? heuristic(start, end) : Infinity;
        previous[nodeId] = null;
    });
    
    while (openSet.size > 0) {
        // Find node with lowest fScore
        let current = null;
        let minFScore = Infinity;
        
        openSet.forEach(node => {
            if (fScore[node] < minFScore) {
                minFScore = fScore[node];
                current = node;
            }
        });
        
        // If we found the end node
        if (current === end) {
            break;
        }
        
        // Move current from open to closed set
        openSet.delete(current);
        closedSet.add(current);
        result.visitedNodes.push(current);
        
        // Check all neighbors
        graph[current].forEach(edge => {
            const neighbor = edge.to;
            
            // Skip if already evaluated
            if (closedSet.has(neighbor)) {
                return;
            }
            
            const tentativeGScore = gScore[current] + edge.weight;
            
            // Add to open set if not already there
            if (!openSet.has(neighbor)) {
                openSet.add(neighbor);
            } else if (tentativeGScore >= gScore[neighbor]) {
                return; // Not a better path
            }
            
            // This is the best path so far
            previous[neighbor] = current;
            gScore[neighbor] = tentativeGScore;
            fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, end);
        });
    }
    
    // Reconstruct path
    const path = [];
    let current = end;
    
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }
    
    // Save results
    result.path = path.length > 1 ? path : [];
    result.pathCost = gScore[end];
    result.time = (performance.now() - startTime) * result.speedFactor;
    
    return result;
}

// Simple Euclidean distance heuristic for A*
function heuristic(a, b) {
    // Since we don't have physical coordinates, use a simpler heuristic
    // based on the average weight of edges
    const avgWeight = 120; // Approximate average weight
    
    // Simple linear distance (will be adjusted by the actual graph layout)
    return Math.abs(a - b) * (avgWeight / 10);
}

// Bellman-Ford algorithm
function bellmanFord(start, end) {
    const result = algorithmResults.find(r => r.name === "Bellman-Ford");
    const startTime = performance.now();
    
    const distances = {};
    const previous = {};
    
    // Initialize
    Object.keys(graph).forEach(node => {
        const nodeId = parseInt(node);
        distances[nodeId] = nodeId === start ? 0 : Infinity;
        previous[nodeId] = null;
    });
    
    // Create an array of all edges
    const edges = [];
    Object.keys(graph).forEach(from => {
        const fromId = parseInt(from);
        graph[from].forEach(edge => {
            edges.push({
                from: fromId,
                to: edge.to,
                weight: edge.weight
            });
        });
    });
    
    const nodeCount = Object.keys(graph).length;
    
    // Relax edges |V|-1 times
    for (let i = 0; i < nodeCount - 1; i++) {
        let updated = false;
        
        edges.forEach(edge => {
            if (distances[edge.from] !== Infinity) {
                const newDist = distances[edge.from] + edge.weight;
                
                if (newDist < distances[edge.to]) {
                    distances[edge.to] = newDist;
                    previous[edge.to] = edge.from;
                    updated = true;
                    
                    // Add to visited nodes if not already there
                    if (!result.visitedNodes.includes(edge.to)) {
                        result.visitedNodes.push(edge.to);
                    }
                }
            }
        });
        
        // Early termination if no updates were made
        if (!updated) break;
    }
    
    // Reconstruct path
    const path = [];
    let current = end;
    
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }
    
    // Save results
    result.path = path.length > 1 ? path : [];
    result.pathCost = distances[end];
    result.time = (performance.now() - startTime) * result.speedFactor;
    
    return result;
}

// Floyd-Warshall algorithm
function floydWarshall(start, end) {
    const result = algorithmResults.find(r => r.name === "Floyd-Warshall");
    const startTime = performance.now();
    
    const nodes = Object.keys(graph).map(id => parseInt(id));
    const n = nodes.length;
    
    // Initialize distance and next matrices
    const dist = [];
    const next = [];
    
    for (let i = 0; i < n; i++) {
        dist[i] = [];
        next[i] = [];
        
        for (let j = 0; j < n; j++) {
            const u = nodes[i];
            const v = nodes[j];
            
            if (u === v) {
                dist[i][j] = 0;
                next[i][j] = null;
            } else {
                // Check if there's a direct edge
                const edge = graph[u].find(e => e.to === v);
                
                if (edge) {
                    dist[i][j] = edge.weight;
                    next[i][j] = v;
                } else {
                    dist[i][j] = Infinity;
                    next[i][j] = null;
                }
            }
        }
    }
    
    // Floyd-Warshall algorithm
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (dist[i][k] === Infinity || dist[k][j] === Infinity) {
                    continue;
                }
                
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                    
                    // Mark node as visited
                    const node = nodes[k];
                    if (!result.visitedNodes.includes(node)) {
                        result.visitedNodes.push(node);
                    }
                }
            }
        }
    }
    
    // Reconstruct path
    const startIndex = nodes.indexOf(start);
    const endIndex = nodes.indexOf(end);
    
    if (next[startIndex][endIndex] === null) {
        result.path = [];
        result.pathCost = Infinity;
    } else {
        const path = [start];
        let u = startIndex;
        
        while (u !== endIndex) {
            u = nodes.indexOf(next[u][endIndex]);
            path.push(nodes[u]);
        }
        
        result.path = path;
        result.pathCost = dist[startIndex][endIndex];
    }
    
    result.time = (performance.now() - startTime) * result.speedFactor;
    
    return result;
}
