#include <iostream>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  long long n, b;
  cin >> n >> b;

  auto isBad = [&](long long version) { return version >= b; };

  long long lo = 1, hi = n;
  while (lo < hi) {
    long long mid = lo + (hi - lo) / 2;
    if (isBad(mid)) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  cout << lo << '\n';
  return 0;
}
