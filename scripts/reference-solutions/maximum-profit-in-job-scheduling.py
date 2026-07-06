import sys
from bisect import bisect_right


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    jobs = []
    idx = 1
    for _ in range(n):
        start = int(data[idx])
        end = int(data[idx + 1])
        profit = int(data[idx + 2])
        idx += 3
        jobs.append((end, start, profit))
    jobs.sort()  # sort by end time

    ends = []
    best = []  # best[i] = max profit achievable using the first i + 1 jobs by end time
    running = 0
    for end, start, profit in jobs:
        pos = bisect_right(ends, start) - 1
        prev = best[pos] if pos >= 0 else 0
        candidate = prev + profit
        if candidate > running:
            running = candidate
        ends.append(end)
        best.append(running)

    print(running)


main()
