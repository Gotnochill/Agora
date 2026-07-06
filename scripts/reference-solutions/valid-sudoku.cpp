#include <array>
#include <iostream>
#include <string>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  array<string, 9> board;
  for (int r = 0; r < 9; ++r) {
    cin >> board[r];
  }

  bool rows[9][9] = {false};
  bool cols[9][9] = {false};
  bool boxes[9][9] = {false};
  for (int r = 0; r < 9; ++r) {
    for (int c = 0; c < 9; ++c) {
      char ch = board[r][c];
      if (ch == '.') {
        continue;
      }
      int d = ch - '1';
      int b = (r / 3) * 3 + c / 3;
      if (rows[r][d] || cols[c][d] || boxes[b][d]) {
        cout << "false" << '\n';
        return 0;
      }
      rows[r][d] = cols[c][d] = boxes[b][d] = true;
    }
  }

  cout << "true" << '\n';
  return 0;
}
