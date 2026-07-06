#include <algorithm>
#include <array>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  vector<array<long long, 3>> jobs(n);  // {end, start, profit}
  for (int i = 0; i < n; ++i) {
    long long start, end, profit;
    cin >> start >> end >> profit;
    jobs[i] = {end, start, profit};
  }
  sort(jobs.begin(), jobs.end());  // sort by end time

  vector<long long> ends(n);
  vector<long long> best(n);  // best[i] = max profit using the first i + 1 jobs
  long long running = 0;
  for (int i = 0; i < n; ++i) {
    long long end = jobs[i][0];
    long long start = jobs[i][1];
    long long profit = jobs[i][2];
    // Largest index whose end time <= start (jobs that finish before this one starts).
    int lo = 0, hi = i - 1, pos = -1;
    while (lo <= hi) {
      int mid = lo + (hi - lo) / 2;
      if (ends[mid] <= start) {
        pos = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    long long prev = pos >= 0 ? best[pos] : 0;
    long long candidate = prev + profit;
    running = max(running, candidate);
    ends[i] = end;
    best[i] = running;
  }

  cout << running << '\n';
  return 0;
}
