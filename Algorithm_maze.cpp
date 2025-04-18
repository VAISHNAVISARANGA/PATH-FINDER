#include <iostream>
#include <vector>
#include <unordered_map>
#include <queue>
#include <limits>
#include <algorithm>
#include <chrono>

using namespace std;

struct Edge {
    int to;
    double weight;
};

struct AlgorithmResult {
    vector<int> path;
    double cost;
    double time;
};

int rows, cols;
vector<vector<int>> maze;
unordered_map<int, vector<Edge>> graph;
unordered_map<int, unordered_map<int, double>> fwMatrix;
unordered_map<int, unordered_map<int, int>> fwNext;

int coordToId(int x, int y) {
    return x * cols + y;
}

pair<int, int> idToCoord(int id) {
    return {id / cols, id % cols};
}

bool isValid(int x, int y) {
    return x >= 0 && x < rows && y >= 0 && y < cols && maze[x][y] == 0;
}

void buildGraphFromMaze() {
    graph.clear();
    vector<pair<int, int>> directions = {{-1,0},{1,0},{0,-1},{0,1}};
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
            if (maze[i][j] == 1) continue; // wall
            int u = coordToId(i, j);
            for (auto [dx, dy] : directions) {
                int ni = i + dx, nj = j + dy;
                if (isValid(ni, nj)) {
                    int v = coordToId(ni, nj);
                    graph[u].push_back({v, 1.0});
                }
            }
        }
    }
}

vector<int> reconstructPath(int start, int end, unordered_map<int, int>& parent) {
    vector<int> path;
    for (int at = end; at != start && parent.count(at); at = parent[at])
        path.push_back(at);
    if (start == end || !path.empty()) {
        path.push_back(start);
        reverse(path.begin(), path.end());
    }
    return path;
}

AlgorithmResult DijkstraGraph(int start, int end) {
    AlgorithmResult result;
    auto startTime = chrono::high_resolution_clock::now();
    unordered_map<int, double> dist;
    unordered_map<int, int> parent;
    priority_queue<pair<double, int>, vector<pair<double, int>>, greater<>> pq;

    for (auto& [node, _] : graph)
        dist[node] = numeric_limits<double>::max();
    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (u == end) break;
        for (auto& e : graph[u]) {
            if (dist[u] + e.weight < dist[e.to]) {
                dist[e.to] = dist[u] + e.weight;
                parent[e.to] = u;
                pq.push({dist[e.to], e.to});
            }
        }
    }

    result.path = reconstructPath(start, end, parent);
    result.cost = result.path.empty() ? numeric_limits<double>::max() : dist[end];
    result.time = chrono::duration<double>(chrono::high_resolution_clock::now() - startTime).count();
    return result;
}

AlgorithmResult AStarGraph(int start, int end) {
    return DijkstraGraph(start, end); // No heuristic used here
}

AlgorithmResult BellmanFordGraph(int start, int end) {
    AlgorithmResult result;
    auto startTime = chrono::high_resolution_clock::now();
    unordered_map<int, double> dist;
    unordered_map<int, int> parent;

    for (auto& [node, _] : graph)
        dist[node] = numeric_limits<double>::max();
    dist[start] = 0;

    int V = graph.size();
    for (int i = 1; i < V; ++i) {
        for (auto& [u, edges] : graph) {
            for (auto& e : edges) {
                if (dist[u] + e.weight < dist[e.to]) {
                    dist[e.to] = dist[u] + e.weight;
                    parent[e.to] = u;
                }
            }
        }
    }

    result.path = reconstructPath(start, end, parent);
    result.cost = result.path.empty() ? numeric_limits<double>::max() : dist[end];
    result.time = chrono::duration<double>(chrono::high_resolution_clock::now() - startTime).count();
    return result;
}

vector<int> reconstructFWPath(int start, int end) {
    vector<int> path;
    if (!fwNext.count(start) || !fwNext[start].count(end)) return path;
    path.push_back(start);
    while (start != end) {
        start = fwNext[start][end];
        path.push_back(start);
    }
    return path;
}

AlgorithmResult FloydWarshallGraph(int start, int end) {
    AlgorithmResult result;
    auto startTime = chrono::high_resolution_clock::now();
    fwMatrix.clear();
    fwNext.clear();

    for (auto& [u, edges] : graph) {
        for (auto& [v, _] : graph)
            fwMatrix[u][v] = numeric_limits<double>::max();
        fwMatrix[u][u] = 0;
        fwNext[u][u] = u;
        for (auto& e : edges) {
            fwMatrix[u][e.to] = e.weight;
            fwNext[u][e.to] = e.to;
        }
    }

    for (auto& [k, _] : graph)
        for (auto& [i, _] : graph)
            for (auto& [j, _] : graph)
                if (fwMatrix[i][k] != numeric_limits<double>::max() &&
                    fwMatrix[k][j] != numeric_limits<double>::max() &&
                    fwMatrix[i][j] > fwMatrix[i][k] + fwMatrix[k][j]) {
                    fwMatrix[i][j] = fwMatrix[i][k] + fwMatrix[k][j];
                    fwNext[i][j] = fwNext[i][k];
                }

    result.path = reconstructFWPath(start, end);
    result.cost = result.path.empty() ? numeric_limits<double>::max() : fwMatrix[start][end];
    result.time = chrono::duration<double>(chrono::high_resolution_clock::now() - startTime).count();
    return result;
}

void printResults(const vector<AlgorithmResult>& results) {
    const string names[4] = {"Dijkstra", "A*", "Bellman-Ford", "Floyd-Warshall"};
    cout << "\nAlgorithm Results:\n";
    for (int i = 0; i < 4; ++i) {
        cout << names[i] << ":\n";
        cout << "  Time: " << results[i].time << "s\n";
        if (results[i].cost == numeric_limits<double>::max())
            cout << "  Cost: -1 (No path)\n";
        else
            cout << "  Cost: " << results[i].cost << "\n";

        if (!results[i].path.empty()) {
            cout << "  Path: ";
            for (auto id : results[i].path) {
                auto [x, y] = idToCoord(id);
                cout << "(" << x << "," << y << ") ";
            }
            cout << "\n";
        } else {
            cout << "  Path: No path found\n";
        }
        cout << "--------------------------\n";
    }
}

int main() {
    cout << "Enter maze size (rows cols): ";
    cin >> rows >> cols;

    maze.assign(rows, vector<int>(cols));
    cout << "Enter maze (0 = path, 1 = wall):\n";
    for (int i = 0; i < rows; ++i)
        for (int j = 0; j < cols; ++j)
            cin >> maze[i][j];

    int sx, sy, ex, ey;
    cout << "Enter start position (row col): ";
    cin >> sx >> sy;
    cout << "Enter end position (row col): ";
    cin >> ex >> ey;

    if (!isValid(sx, sy) || !isValid(ex, ey)) {
        cout << "Invalid start or end position.\n";
        return 1;
    }

    buildGraphFromMaze();

    int start = coordToId(sx, sy);
    int end = coordToId(ex, ey);

    vector<AlgorithmResult> results(4);
    results[0] = DijkstraGraph(start, end);
    results[1] = AStarGraph(start, end);
    results[2] = BellmanFordGraph(start, end);
    results[3] = FloydWarshallGraph(start, end);

    printResults(results);
    return 0;
}