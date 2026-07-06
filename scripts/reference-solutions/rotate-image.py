import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    vals = list(map(int, data[1 : 1 + n * n]))
    grid = [vals[r * n : (r + 1) * n] for r in range(n)]
    # Rotated 90 degrees clockwise: result[i][j] = grid[n - 1 - j][i].
    out = []
    for i in range(n):
        row = [str(grid[n - 1 - j][i]) for j in range(n)]
        out.append(" ".join(row))
    sys.stdout.write("\n".join(out) + "\n")


main()
