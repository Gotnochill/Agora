import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    nums = list(map(int, data[1 : 1 + n]))
    lo, hi = 0, n - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    print(nums[lo])


main()
