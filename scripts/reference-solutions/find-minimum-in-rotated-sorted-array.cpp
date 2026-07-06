#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  vector<long long> nums(n);
  for (int i = 0; i < n; ++i) {
    cin >> nums[i];
  }

  int lo = 0, hi = n - 1;
  while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] > nums[hi]) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  cout << nums[lo] << '\n';
  return 0;
}
