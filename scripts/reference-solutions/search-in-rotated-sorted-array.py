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
        if nums[lo] <= nums[mid]:  # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:  # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    print(-1)


main()
