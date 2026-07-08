#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  long long n, d, c;
  cin >> n >> d >> c;
  vector<long long> skills(n);
  for (long long& value : skills) {
    cin >> value;
  }
  sort(skills.begin(), skills.end());

  long long batches = 0;
  long long i = 0;
  while (i < n) {
    ++batches;
    long long start = skills[i];
    long long size = 0;
    while (i < n && skills[i] - start <= d && size < c) {
      ++i;
      ++size;
    }
  }

  cout << batches << '\n';
  return 0;
}
