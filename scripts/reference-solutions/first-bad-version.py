import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    b = int(data[1])

    def is_bad(version):
        return version >= b

    lo, hi = 1, n
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if is_bad(mid):
            hi = mid
        else:
            lo = mid + 1
    print(lo)


main()
