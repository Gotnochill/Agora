import sys


def main():
    data = sys.stdin.buffer.read().split()
    m = int(data[0])
    n = int(data[1])
    target = int(data[2])
    total = m * n
    vals = list(map(int, data[3 : 3 + total]))
    # The matrix flattened in row-major order is fully sorted ascending.
    lo, hi = 0, total - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if vals[mid] == target:
            print("true")
            return
        if vals[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    print("false")


main()
