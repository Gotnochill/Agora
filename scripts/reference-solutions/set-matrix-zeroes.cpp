#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int m, n;
  cin >> m >> n;
  vector<vector<long long>> grid(m, vector<long long>(n));
  vector<char> zeroRow(m, 0);
  vector<char> zeroCol(n, 0);
  for (int r = 0; r < m; ++r) {
    for (int c = 0; c < n; ++c) {
      cin >> grid[r][c];
      if (grid[r][c] == 0) {
        zeroRow[r] = 1;
        zeroCol[c] = 1;
      }
    }
  }

  for (int r = 0; r < m; ++r) {
    for (int c = 0; c < n; ++c) {
      if (c > 0) {
        cout << ' ';
      }
      cout << (zeroRow[r] || zeroCol[c] ? 0 : grid[r][c]);
    }
    cout << '\n';
  }
  return 0;
}
