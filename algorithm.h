#ifndef ALGORITHM_H
#define ALGORITHM_H

#include <vector>
#include <unordered_map>
#include <string>
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

// Declare algorithm functions
AlgorithmResult DijkstraGraph(int start, int end);
AlgorithmResult AStarGraph(int start, int end);
AlgorithmResult BellmanFordGraph(int start, int end);
AlgorithmResult FloydWarshallGraph(int start, int end);

#endif // ALGORITHM_H
