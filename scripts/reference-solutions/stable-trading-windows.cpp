#include <deque>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  long long n, k;
  cin >> n >> k;
  vector<long long> prices(n);
  for (long long& value : prices) {
    cin >> value;
  }

  deque<long long> maxDq;  // decreasing: front is window max
  deque<long long> minDq;  // increasing: front is window min
  long long left = 0;
  long long ans = 0;
  for (long long right = 0; right < n; ++right) {
    long long value = prices[right];
    while (!maxDq.empty() && prices[maxDq.back()] <= value) {
      maxDq.pop_back();
    }
    maxDq.push_back(right);
    while (!minDq.empty() && prices[minDq.back()] >= value) {
      minDq.pop_back();
    }
    minDq.push_back(right);

    while (prices[maxDq.front()] - prices[minDq.front()] > k) {
      ++left;
      if (maxDq.front() < left) {
        maxDq.pop_front();
      }
      if (minDq.front() < left) {
        minDq.pop_front();
      }
    }

    ans += right - left + 1;
  }

  cout << ans << '\n';
  return 0;
}
