#include <cstdlib>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int zones;
  cin >> zones;
  vector<long long> current(zones);
  vector<long long> target(zones);
  for (long long& drivers : current) cin >> drivers;
  for (long long& drivers : target) cin >> drivers;

  long long imbalance = 0;
  long long cost = 0;
  for (int index = 0; index + 1 < zones; ++index) {
    imbalance += current[index] - target[index];
    cost += llabs(imbalance);
  }

  cout << cost << '\n';
  return 0;
}