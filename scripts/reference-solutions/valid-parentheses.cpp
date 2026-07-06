#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  string s;
  cin >> s;

  vector<char> stack;
  bool ok = true;
  for (char ch : s) {
    if (ch == '(' || ch == '[' || ch == '{') {
      stack.push_back(ch);
    } else {
      char need = ch == ')' ? '(' : (ch == ']' ? '[' : '{');
      if (stack.empty() || stack.back() != need) {
        ok = false;
        break;
      }
      stack.pop_back();
    }
  }

  cout << ((ok && stack.empty()) ? "true" : "false") << '\n';
  return 0;
}
