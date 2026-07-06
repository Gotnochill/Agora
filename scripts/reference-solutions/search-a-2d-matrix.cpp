#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int m, n;
  long long target;
  cin >> m >> n >> target;
  int total = m * n;
  vector<long long> vals(total);
  for (int i = 0; i < total; ++i) {
    cin >> vals[i];
  }

  // The matrix flattened in row-major order is fully sorted ascending.
  int lo = 0, hi = total - 1;
  bool found = false;
  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (vals[mid] == target) {
      found = true;
      break;
    }
    if (vals[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  cout << (found ? "true" : "false") << '\n';
  return 0;
}
