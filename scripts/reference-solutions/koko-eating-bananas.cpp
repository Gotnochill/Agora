#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  long long h;
  cin >> n >> h;
  vector<long long> piles(n);
  long long hi = 1;
  for (int i = 0; i < n; ++i) {
    cin >> piles[i];
    hi = max(hi, piles[i]);
  }

  long long lo = 1;
  while (lo < hi) {
    long long mid = lo + (hi - lo) / 2;
    long long hours = 0;
    for (long long p : piles) {
      hours += (p + mid - 1) / mid;
      if (hours > h) {
        break;
      }
    }
    if (hours <= h) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  cout << lo << '\n';
  return 0;
}
