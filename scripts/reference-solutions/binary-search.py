import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    target = int(data[1])
    nums = list(map(int, data[2 : 2 + n]))
    lo, hi = 0, n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            print(mid)
            return
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    print(-1)


main()
