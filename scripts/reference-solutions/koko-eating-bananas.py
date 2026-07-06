import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    h = int(data[1])
    piles = list(map(int, data[2 : 2 + n]))

    def hours(k):
        return sum((p + k - 1) // k for p in piles)

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours(mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    print(lo)


main()
