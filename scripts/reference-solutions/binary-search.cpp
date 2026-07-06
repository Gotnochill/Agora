#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  long long target;
  cin >> n >> target;
  vector<long long> nums(n);
  for (int i = 0; i < n; ++i) {
    cin >> nums[i];
  }

  int lo = 0, hi = n - 1, ans = -1;
  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) {
      ans = mid;
      break;
    }
    if (nums[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  cout << ans << '\n';
  return 0;
}
