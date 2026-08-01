#include <iostream>
#include <utility>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int intersections;
  cin >> intersections;
  vector<vector<pair<int, long long>>> graph(intersections);
  for (int edge = 0; edge + 1 < intersections; ++edge) {
    int first, second;
    long long weight;
    cin >> first >> second >> weight;
    graph[first].push_back({second, weight});
    graph[second].push_back({first, weight});
  }

  vector<int> parent(intersections, -1);
  vector<int> subtreeSize(intersections, 1);
  vector<long long> parentWeight(intersections, 0);
  vector<long long> distance(intersections, 0);
  vector<int> order = {0};
  for (size_t index = 0; index < order.size(); ++index) {
    int node = order[index];
    for (auto [neighbor, weight] : graph[node]) {
      if (neighbor == parent[node]) continue;
      parent[neighbor] = node;
      parentWeight[neighbor] = weight;
      distance[neighbor] = distance[node] + weight;
      order.push_back(neighbor);
    }
  }

  long long rootCost = 0;
  for (long long value : distance) rootCost += value;
  for (int index = intersections - 1; index > 0; --index) {
    int node = order[index];
    subtreeSize[parent[node]] += subtreeSize[node];
  }

  vector<long long> cost(intersections, 0);
  cost[0] = rootCost;
  for (size_t index = 1; index < order.size(); ++index) {
    int node = order[index];
    long long outside = intersections - subtreeSize[node];
    cost[node] =
        cost[parent[node]] + (outside - subtreeSize[node]) * parentWeight[node];
  }

  for (int node = 0; node < intersections; ++node) {
    if (node > 0) cout << ' ';
    cout << cost[node];
  }
  cout << '\n';
  return 0;
}