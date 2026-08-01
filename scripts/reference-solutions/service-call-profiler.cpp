#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int services, entries;
  cin >> services >> entries;

  vector<long long> exclusive(services, 0);
  vector<int> callStack;
  callStack.reserve(entries);
  long long previous = 0;
  string entry;

  for (int index = 0; index < entries; ++index) {
    cin >> entry;
    const size_t firstColon = entry.find(':');
    const size_t lastColon = entry.rfind(':');
    const int serviceId = stoi(entry.substr(0, firstColon));
    const long long timestamp = stoll(entry.substr(lastColon + 1));

    if (entry[firstColon + 1] == 's') {
      // The caller pauses here, so it only owns the units before this start.
      if (!callStack.empty()) exclusive[callStack.back()] += timestamp - previous;
      callStack.push_back(serviceId);
      previous = timestamp;
    } else {
      // An end timestamp is inclusive, hence the +1.
      exclusive[callStack.back()] += timestamp - previous + 1;
      callStack.pop_back();
      previous = timestamp + 1;
    }
  }

  for (int index = 0; index < services; ++index) {
    if (index > 0) cout << ' ';
    cout << exclusive[index];
  }
  cout << '\n';
  return 0;
}
