#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int q;
  cin >> q;

  vector<long long> stack;
  vector<long long> mins;
  string op;
  string out;
  for (int i = 0; i < q; ++i) {
    cin >> op;
    if (op == "push") {
      long long x;
      cin >> x;
      stack.push_back(x);
      mins.push_back(mins.empty() || x <= mins.back() ? x : mins.back());
    } else if (op == "pop") {
      stack.pop_back();
      mins.pop_back();
    } else if (op == "top") {
      out += to_string(stack.back());
      out += '\n';
    } else {  // getMin
      out += to_string(mins.back());
      out += '\n';
    }
  }

  cout << out;
  return 0;
}
