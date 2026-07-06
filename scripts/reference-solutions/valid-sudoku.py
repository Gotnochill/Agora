import sys


def main():
    tokens = sys.stdin.read().split()
    board = tokens[:9]
    seen = set()
    for r in range(9):
        for c in range(9):
            ch = board[r][c]
            if ch == ".":
                continue
            keys = (("r", r, ch), ("c", c, ch), ("b", r // 3, c // 3, ch))
            for key in keys:
                if key in seen:
                    print("false")
                    return
                seen.add(key)
    print("true")


main()
