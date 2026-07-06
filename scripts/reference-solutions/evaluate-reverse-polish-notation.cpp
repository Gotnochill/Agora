#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;

  vector<long long> stack;
  for (int i = 0; i < n; ++i) {
    string tok;
    cin >> tok;
    bool isOperator =
        tok.size() == 1 && (tok[0] == '+' || tok[0] == '-' || tok[0] == '*' || tok[0] == '/');
    if (isOperator) {
      long long b = stack.back();
      stack.pop_back();
      long long a = stack.back();
      stack.pop_back();
      long long r = 0;
      switch (tok[0]) {
        case '+':
          r = a + b;
          break;
        case '-':
          r = a - b;
          break;
        case '*':
          r = a * b;
          break;
        default:
          r = a / b;  // integer division truncates toward zero in C++
          break;
      }
      stack.push_back(r);
    } else {
      stack.push_back(stoll(tok));
    }
  }

  cout << stack.back() << '\n';
  return 0;
}
