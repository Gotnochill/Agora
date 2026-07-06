import sys


def main():
    data = sys.stdin.buffer.read().split()
    m = int(data[0])
    n = int(data[1])
    vals = list(map(int, data[2 : 2 + m * n]))
    grid = [vals[r * n : (r + 1) * n] for r in range(m)]

    zero_rows = set()
    zero_cols = set()
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 0:
                zero_rows.add(r)
                zero_cols.add(c)

    out = []
    for r in range(m):
        row = []
        for c in range(n):
            if r in zero_rows or c in zero_cols:
                row.append("0")
            else:
                row.append(str(grid[r][c]))
        out.append(" ".join(row))
    sys.stdout.write("\n".join(out) + "\n")


main()
