#include <array>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

array<string, 9> board;
bool rowsUsed[9][10];
bool colsUsed[9][10];
bool boxUsed[9][10];
vector<pair<int, int>> empties;

bool solve(int idx) {
  if (idx == static_cast<int>(empties.size())) {
    return true;
  }
  int r = empties[idx].first;
  int c = empties[idx].second;
  int b = (r / 3) * 3 + c / 3;
  for (int d = 1; d <= 9; ++d) {
    if (!rowsUsed[r][d] && !colsUsed[c][d] && !boxUsed[b][d]) {
      rowsUsed[r][d] = colsUsed[c][d] = boxUsed[b][d] = true;
      board[r][c] = static_cast<char>('0' + d);
      if (solve(idx + 1)) {
        return true;
      }
      rowsUsed[r][d] = colsUsed[c][d] = boxUsed[b][d] = false;
      board[r][c] = '.';
    }
  }
  return false;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  for (int r = 0; r < 9; ++r) {
    cin >> board[r];
  }
  for (int r = 0; r < 9; ++r) {
    for (int c = 0; c < 9; ++c) {
      char ch = board[r][c];
      if (ch == '.') {
        empties.push_back({r, c});
      } else {
        int d = ch - '0';
        rowsUsed[r][d] = colsUsed[c][d] = boxUsed[(r / 3) * 3 + c / 3][d] = true;
      }
    }
  }

  solve(0);

  for (int r = 0; r < 9; ++r) {
    cout << board[r] << '\n';
  }
  return 0;
}
