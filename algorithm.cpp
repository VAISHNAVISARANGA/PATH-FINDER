#include "algorithm.h"
#include <iostream>
#include <queue>
#include <limits>
#include <chrono>
#include <algorithm>

// Declare global graph structures
extern unordered_map<int, string> nodeNames;
extern unordered_map<int, vector<Edge>> graph;

// Floyd-Warshall helper matrices
unordered_map<int, unordered_map<int, double>> fwMatrix;
unordered_map<int, unordered_map<int, int>> fwNext;

AlgorithmResult DijkstraGraph(int start, int end) {
    AlgorithmResult result;
    auto startTime = chrono::high_resolution_clock::now();

    unordered_map<int, double> dist;
    unordered_map<int, int> parent;
    priority_queue<pair<double, int>, vector<pair<double, int>>, greater<>> pq;

    for (auto& it : graph)
        dist[it.first] = numeric_limits<double>::max();
    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [cost, u] = pq.top();
        pq.pop();
        if (u == end) break;

        for (const auto& edge : graph[u]) {
            int v = edge.to;
            double weight = edge.weight;
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    vector<int> path;
    for (int at = end; at != start && parent.count(at); at = parent[at])
        path.push_back(at);
    if (start == end || !path.empty()) {
        path.push_back(start);
        reverse(path.begin(), path.end());
    }

    result.path = path;
    result.cost = dist[end];
    result.time = chrono::duration<double>(chrono::high_resolution_clock::now() - startTime).count();
    return result;
}

AlgorithmResult AStarGraph(int start, int end) {
    return DijkstraGraph(start, end); // Simplified to Dijkstra
}

AlgorithmResult BellmanFordGraph(int start, int end) {
    AlgorithmResult result;
    auto startTime = chrono::high_resolution_clock::now();

    unordered_map<int, double> dist;
    unordered_map<int, int> parent;
    for (auto& it : graph)
        dist[it.first] = numeric_limits<double>::max();
    dist[start] = 0;

    int N = graph.size();
    for (int i = 1; i < N; ++i) {
        for (const auto& it : graph) {
            int u = it.first;
            for (const auto& edge : it.second) {
                int v = edge.to;
                double w = edge.weight;
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    parent[v] = u;
                }
            }
        }
    }

    vector<int> path;
    for (int at = end; at != start && parent.count(at); at = parent[at])
        path.push_back(at);
    if (start == end || !path.empty()) {
        path.push_back(start);
        reverse(path.begin(), path.end());
    }

    result.path = path;
    result.cost = dist[end];
    result.time = chrono::duration<double>(chrono::high_resolution_clock::now() - startTime).count();
    return result;
}

vector<int> reconstructFWPath(int start, int end) {
    vector<int> path;
    if (!fwNext.count(start) || !fwNext[start].count(end)) return path;
    if (fwMatrix[start][end] == numeric_limits<double>::max()) return path;

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

    for (const auto& u_it : graph) {
        int u = u_it.first;
        for (const auto& v_it : graph) {
            int v = v_it.first;
            fwMatrix[u][v] = numeric_limits<double>::max();
        }
        fwMatrix[u][u] = 0;
        fwNext[u][u] = u;

        for (const auto& edge : u_it.second) {
            int v = edge.to;
            fwMatrix[u][v] = edge.weight;
            fwNext[u][v] = v;
        }
    }

    for (const auto& k_it : graph) {
        int k = k_it.first;
        for (const auto& i_it : graph) {
            int i = i_it.first;
            for (const auto& j_it : graph) {
                int j = j_it.first;
                if (fwMatrix[i][k] != numeric_limits<double>::max() &&
                    fwMatrix[k][j] != numeric_limits<double>::max() &&
                    fwMatrix[i][j] > fwMatrix[i][k] + fwMatrix[k][j]) {
                    fwMatrix[i][j] = fwMatrix[i][k] + fwMatrix[k][j];
                    fwNext[i][j] = fwNext[i][k];
                }
            }
        }
    }

    result.path = reconstructFWPath(start, end);
    result.cost = fwMatrix[start][end];
    result.time = chrono::duration<double>(chrono::high_resolution_clock::now() - startTime).count();
    return result;
}