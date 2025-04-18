#include <iostream>
#include <fstream>
#include <sstream>
#include <unordered_map>
#include <string>
#include <limits>  // Added this include for numeric_limits
#include "algorithm.h"  // Changed from algorithm.cpp to algorithm.h

using namespace std;

// Global declarations
unordered_map<int, string> nodeNames;
unordered_map<int, vector<Edge>> graph;

void loadMapGraphData() {
    ifstream nodeFile("cpp_nodes.txt");
    string line;
    while (getline(nodeFile, line)) {
        size_t comma = line.find(',');
        int id = stoi(line.substr(0, comma));
        nodeNames[id] = line.substr(comma + 1);
    }

    ifstream edgeFile("cpp_edges.txt");
    while (getline(edgeFile, line)) {
        stringstream ss(line);
        string fromStr, toStr, weightStr;
        getline(ss, fromStr, ',');
        getline(ss, toStr, ',');
        getline(ss, weightStr);
        int from = stoi(fromStr), to = stoi(toStr);
        double weight = stod(weightStr);
        graph[from].push_back({to, weight});
        graph[to].push_back({from, weight});
    }
}

double calculatePathDistance(const vector<int>& path) {
    double total = 0.0;
    for (size_t i = 0; i + 1 < path.size(); ++i) {
        for (const auto& edge : graph[path[i]]) {
            if (edge.to == path[i + 1]) {
                total += edge.weight;
                break;
            }
        }
    }
    return total;
}

void printResults(const vector<AlgorithmResult>& results) {
    const string names[4] = {"Dijkstra", "A*", "Bellman-Ford", "Floyd-Warshall"};
    cout << "\nAlgorithm Results:\n";
    cout << "--------------------------------------------------------\n";
    for (size_t i = 0; i < results.size(); ++i) {
        cout << names[i] << ":\n";
        cout << "  Time: " << results[i].time << "s\n";
        cout << "  Cost: " << (results[i].cost == numeric_limits<double>::max() ? -1 : results[i].cost) << "\n";
        cout << "  Path: ";
        if (!results[i].path.empty()) {
            for (size_t j = 0; j < results[i].path.size(); ++j) {
                cout << nodeNames[results[i].path[j]];
                if (j != results[i].path.size() - 1) cout << " -> ";
            }
            cout << "\n  Total Distance: " << calculatePathDistance(results[i].path);
        } else {
            cout << "No path found";
        }
        cout << "\n--------------------------------------------------------\n";
    }

    int bestIndex = -1;
    double minTime = numeric_limits<double>::max();
    for (size_t i = 0; i < results.size(); ++i) {
        if (results[i].time < minTime && results[i].cost != -1 && !results[i].path.empty()) {
            minTime = results[i].time;
            bestIndex = static_cast<int>(i);
        }
    }
    if (bestIndex != -1) {
        cout << "\nBest Algorithm: " << names[bestIndex]
             << " (Time: " << results[bestIndex].time << "s, Cost: "
             << results[bestIndex].cost << ")\n";
    } else {
        cout << "\nNo valid path found by any algorithm.\n";
    }
}

int main() {
    loadMapGraphData();

    string startName, endName;
    cout << "Enter start place: ";
    getline(cin, startName);
    cout << "Enter end place: ";
    getline(cin, endName);

    int startID = -1, endID = -1;
    for (const auto& it : nodeNames) {
        if (it.second == startName) startID = it.first;
        if (it.second == endName) endID = it.first;
    }

    if (startID == -1 || endID == -1) {
        cout << "Invalid locations!\n";
        return 1;
    }

    vector<AlgorithmResult> results(4);
    results[0] = DijkstraGraph(startID, endID);
    results[1] = AStarGraph(startID, endID);
    results[2] = BellmanFordGraph(startID, endID);
    results[3] = FloydWarshallGraph(startID, endID);

    printResults(results);
    return 0;
}