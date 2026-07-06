#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int m, n;
  cin >> m >> n;
  vector<vector<long long>> grid(m, vector<long long>(n));
  for (int r = 0; r < m; ++r) {
    for (int c = 0; c < n; ++c) {
      cin >> grid[r][c];
    }
  }

  int top = 0, bottom = m - 1, left = 0, right = n - 1;
  bool first = true;
  while (top <= bottom && left <= right) {
    for (int c = left; c <= right; ++c) {
      if (!first) cout << ' ';
      first = false;
      cout << grid[top][c];
    }
    ++top;
    for (int r = top; r <= bottom; ++r) {
      if (!first) cout << ' ';
      first = false;
      cout << grid[r][right];
    }
    --right;
    if (top <= bottom) {
      for (int c = right; c >= left; --c) {
        if (!first) cout << ' ';
        first = false;
        cout << grid[bottom][c];
      }
      --bottom;
    }
    if (left <= right) {
      for (int r = bottom; r >= top; --r) {
        if (!first) cout << ' ';
        first = false;
        cout << grid[r][left];
      }
      ++left;
    }
  }
  cout << '\n';
  return 0;
}
