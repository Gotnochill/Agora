#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int q;
  cin >> q;

  unordered_map<string, vector<pair<long long, string>>> store;
  string out;
  for (int i = 0; i < q; ++i) {
    string op;
    cin >> op;
    if (op == "set") {
      string key, value;
      long long timestamp;
      cin >> key >> value >> timestamp;
      store[key].push_back({timestamp, value});
    } else {  // get
      string key;
      long long timestamp;
      cin >> key >> timestamp;
      auto it = store.find(key);
      if (it == store.end()) {
        out += "EMPTY";
        out += '\n';
        continue;
      }
      const auto& entries = it->second;
      // Timestamps are strictly increasing per key, so binary search works.
      int lo = 0, hi = static_cast<int>(entries.size()) - 1, best = -1;
      while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (entries[mid].first <= timestamp) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      if (best == -1) {
        out += "EMPTY";
      } else {
        out += entries[best].second;
      }
      out += '\n';
    }
  }

  cout << out;
  return 0;
}
