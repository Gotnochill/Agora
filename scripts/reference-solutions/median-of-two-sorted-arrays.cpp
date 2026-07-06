#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int m, n;
  cin >> m >> n;
  vector<long long> a(m), b(n);
  for (int i = 0; i < m; ++i) cin >> a[i];
  for (int i = 0; i < n; ++i) cin >> b[i];
  if (a.size() > b.size()) {
    swap(a, b);
  }
  int p = static_cast<int>(a.size());
  int q = static_cast<int>(b.size());

  const long long INF = 4000000000000000000LL;
  int total = p + q;
  int half = (total + 1) / 2;
  int lo = 0, hi = p;
  while (lo <= hi) {
    int i = lo + (hi - lo) / 2;
    int j = half - i;
    long long aLeft = i > 0 ? a[i - 1] : -INF;
    long long aRight = i < p ? a[i] : INF;
    long long bLeft = j > 0 ? b[j - 1] : -INF;
    long long bRight = j < q ? b[j] : INF;
    if (aLeft <= bRight && bLeft <= aRight) {
      if (total % 2 == 1) {
        cout << max(aLeft, bLeft) << '\n';
      } else {
        long long loV = max(aLeft, bLeft);
        long long hiV = min(aRight, bRight);
        long long s = loV + hiV;
        if (s % 2 == 0) {
          cout << s / 2 << '\n';
        } else {
          string sign = s < 0 ? "-" : "";
          cout << sign << (llabs(s) / 2) << ".5" << '\n';
        }
      }
      return 0;
    }
    if (aLeft > bRight) {
      hi = i - 1;
    } else {
      lo = i + 1;
    }
  }
  return 0;
}
