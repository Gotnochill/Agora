import sys


def main():
    data = sys.stdin.buffer.read().split()
    m = int(data[0])
    n = int(data[1])
    a = list(map(int, data[2 : 2 + m]))
    b = list(map(int, data[2 + m : 2 + m + n]))
    # Ensure a is the shorter array.
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)

    total = m + n
    half = (total + 1) // 2
    inf = float("inf")
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_left = a[i - 1] if i > 0 else -inf
        a_right = a[i] if i < m else inf
        b_left = b[j - 1] if j > 0 else -inf
        b_right = b[j] if j < n else inf
        if a_left <= b_right and b_left <= a_right:
            if total % 2 == 1:
                print(int(max(a_left, b_left)))
            else:
                lo_v = int(max(a_left, b_left))
                hi_v = int(min(a_right, b_right))
                s = lo_v + hi_v
                if s % 2 == 0:
                    print(s // 2)
                else:
                    sign = "-" if s < 0 else ""
                    print(f"{sign}{abs(s) // 2}.5")
            return
        if a_left > b_right:
            hi = i - 1
        else:
            lo = i + 1


main()
