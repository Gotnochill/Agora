#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  vector<vector<long long>> grid(n, vector<long long>(n));
  for (int r = 0; r < n; ++r) {
    for (int c = 0; c < n; ++c) {
      cin >> grid[r][c];
    }
  }

  // Rotated 90 degrees clockwise: result[i][j] = grid[n - 1 - j][i].
  for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
      if (j > 0) {
        cout << ' ';
      }
      cout << grid[n - 1 - j][i];
    }
    cout << '\n';
  }
  return 0;
}
