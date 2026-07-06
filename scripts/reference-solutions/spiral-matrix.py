import sys


def main():
    data = sys.stdin.buffer.read().split()
    m = int(data[0])
    n = int(data[1])
    vals = list(map(int, data[2 : 2 + m * n]))
    grid = [vals[r * n : (r + 1) * n] for r in range(m)]

    top, bottom, left, right = 0, m - 1, 0, n - 1
    res = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            res.append(grid[top][c])
        top += 1
        for r in range(top, bottom + 1):
            res.append(grid[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(grid[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(grid[r][left])
            left += 1

    sys.stdout.write(" ".join(map(str, res)) + "\n")


main()
