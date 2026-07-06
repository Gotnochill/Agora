#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  vector<long long> temps(n);
  for (int i = 0; i < n; ++i) {
    cin >> temps[i];
  }

  vector<int> res(n, 0);
  vector<int> stack;  // indices of days awaiting a warmer temperature
  for (int i = 0; i < n; ++i) {
    while (!stack.empty() && temps[stack.back()] < temps[i]) {
      int j = stack.back();
      stack.pop_back();
      res[j] = i - j;
    }
    stack.push_back(i);
  }

  for (int i = 0; i < n; ++i) {
    cout << res[i];
    if (i + 1 < n) {
      cout << ' ';
    }
  }
  cout << '\n';
  return 0;
}
