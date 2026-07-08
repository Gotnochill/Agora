import sys
from collections import deque


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    k = int(data[1])
    prices = list(map(int, data[2 : 2 + n]))

    max_dq = deque()  # decreasing: front is window max
    min_dq = deque()  # increasing: front is window min
    left = 0
    ans = 0
    for right in range(n):
        value = prices[right]
        while max_dq and prices[max_dq[-1]] <= value:
            max_dq.pop()
        max_dq.append(right)
        while min_dq and prices[min_dq[-1]] >= value:
            min_dq.pop()
        min_dq.append(right)

        while prices[max_dq[0]] - prices[min_dq[0]] > k:
            left += 1
            if max_dq[0] < left:
                max_dq.popleft()
            if min_dq[0] < left:
                min_dq.popleft()

        ans += right - left + 1
    print(ans)


main()
