#include <iostream>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  long long n;
  cin >> n;
  long long charge = 0;
  long long resets = 0;
  for (long long i = 0; i < n; ++i) {
    long long e;
    cin >> e;
    charge += e;
    if (charge < 0) {
      charge = 0;
      ++resets;
    }
  }

  cout << charge << ' ' << resets << '\n';
  return 0;
}
