// Graph nodes and edges data
const nodeNames = {
    1: "Milk Shop", 2: "Apartment A", 3: "School", 4: "Park", 5: "Bus Stop",
    6: "Grocery Store", 7: "Temple", 8: "Library", 9: "Post Office", 10: "Police Station",
    11: "Hospital", 12: "Bakery", 13: "Cafe", 14: "ATM", 15: "Clothing Store",
    16: "Vegetable Market", 17: "Apartment B", 18: "Petrol Pump", 19: "Hardware Store", 20: "Apartment C",
    21: "Book Store", 22: "Movie Theater", 23: "Mobile Shop", 24: "Clinic", 25: "Water Tank",
    26: "Street Light", 27: "Tailor", 28: "Bus Depot", 29: "Subway Entrance", 30: "Fire Station",
    31: "Sweet Shop", 32: "Medical Store", 33: "Garage", 34: "Electricity Office", 35: "Footwear Shop",
    36: "Public Toilet", 37: "Jewelry Store", 38: "Pet Shop", 39: "Railway Station", 40: "Construction Site",
    41: "Garden", 42: "Apartment D", 43: "Watch Repair", 44: "Roadside Tea Stall", 45: "Meat Shop",
    46: "Flower Shop", 47: "Temple Gate", 48: "Well", 49: "Recycling Point", 50: "Security Booth"
};

// Sample graph - edges will be populated from raw edge data
const graph = {};

// Sample raw edge data (from the cpp_edges.txt)
const rawEdges = `26,30,131.0
26,7,95.0
26,10,69.0
26,2,156.0
26,5,97.0
26,24,153.0
26,48,80.0
26,43,140.0
26,29,187.0
26,38,92.0
26,8,159.0
26,33,98.0
26,42,191.0
26,11,126.0
26,46,110.0
26,22,90.0
26,32,155.0
26,14,167.0
26,25,180.0
26,6,113.0
26,9,55.0
26,1,84.0
26,20,165.0
26,41,65.0
26,50,150.0
26,23,108.0
26,27,66.0
26,36,155.0
26,45,191.0
26,4,103.0
26,31,180.0
26,49,179.0
26,35,168.0
30,18,199.0
30,10,111.0
30,29,131.0
30,2,174.0
30,21,181.0
30,46,126.0
30,5,160.0
30,50,168.0
30,24,96.0
30,45,175.0
30,16,120.0
30,40,159.0
30,49,156.0
30,27,50.0
30,44,196.0
30,8,85.0
30,11,141.0
30,22,97.0
30,14,182.0
30,3,55.0
30,17,87.0
30,28,109.0
30,39,104.0
30,1,200.0
30,38,183.0
30,47,157.0
30,23,101.0
30,12,155.0
30,37,172.0
30,32,194.0
30,25,142.0
7,12,136.0
7,21,130.0
7,11,189.0
7,2,69.0
7,5,133.0
7,44,184.0
7,39,176.0
7,20,137.0
7,29,147.0
7,42,179.0
7,10,97.0
7,28,74.0
7,14,131.0
7,46,99.0
7,1,193.0
7,32,62.0
7,41,73.0
7,50,115.0
7,18,117.0
7,45,133.0
7,22,93.0
7,40,186.0
7,4,64.0`.split('\n');

// Function to build the graph
function initializeGraph() {
    // Initialize the graph with all nodes
    Object.keys(nodeNames).forEach(id => {
        graph[id] = [];
    });
    
    // Parse edges and build the graph
    rawEdges.forEach(line => {
        const [from, to, weight] = line.split(',');
        
        const fromId = parseInt(from);
        const toId = parseInt(to);
        const edgeWeight = parseFloat(weight);
        
        // Add edges in both directions (undirected graph)
        addEdge(fromId, toId, edgeWeight);
    });
    
    // Add more edges to ensure all nodes are connected
    ensureAllNodesConnected();
}

function addEdge(from, to, weight) {
    // Don't add duplicate edges
    if (!graph[from].some(edge => edge.to === to)) {
        graph[from].push({ to: to, weight: weight });
    }
    
    if (!graph[to].some(edge => edge.to === from)) {
        graph[to].push({ to: from, weight: weight });
    }
}

function ensureAllNodesConnected() {
    // Make sure all nodes have at least 3 connections for better visualization
    Object.keys(nodeNames).forEach(id => {
        const numId = parseInt(id);
        
        // If node has less than 3 connections, add more
        if (graph[id].length < 3) {
            // Find nodes to connect to
            const possibleConnections = Object.keys(nodeNames)
                .map(nId => parseInt(nId))
                .filter(nId => 
                    nId !== numId && 
                    !graph[id].some(edge => edge.to === nId)
                );
            
            // Randomly select nodes to connect to
            while (graph[id].length < 3 && possibleConnections.length > 0) {
                const randIndex = Math.floor(Math.random() * possibleConnections.length);
                const targetId = possibleConnections[randIndex];
                
                // Random weight between 50 and 200
                const weight = Math.floor(Math.random() * 150) + 50;
                
                addEdge(numId, targetId, weight);
                
                // Remove the connected node from possible connections
                possibleConnections.splice(randIndex, 1);
            }
        }
    });
}
