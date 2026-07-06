import sys


def main():
    tokens = sys.stdin.read().split()
    board = [list(tokens[r]) for r in range(9)]

    rows = [[False] * 10 for _ in range(9)]
    cols = [[False] * 10 for _ in range(9)]
    boxes = [[False] * 10 for _ in range(9)]
    empties = []
    for r in range(9):
        for c in range(9):
            ch = board[r][c]
            if ch == ".":
                empties.append((r, c))
            else:
                d = int(ch)
                rows[r][d] = cols[c][d] = boxes[(r // 3) * 3 + c // 3][d] = True

    def solve(idx):
        if idx == len(empties):
            return True
        r, c = empties[idx]
        b = (r // 3) * 3 + c // 3
        for d in range(1, 10):
            if not rows[r][d] and not cols[c][d] and not boxes[b][d]:
                rows[r][d] = cols[c][d] = boxes[b][d] = True
                board[r][c] = str(d)
                if solve(idx + 1):
                    return True
                rows[r][d] = cols[c][d] = boxes[b][d] = False
                board[r][c] = "."
        return False

    solve(0)
    sys.stdout.write("\n".join("".join(board[r]) for r in range(9)) + "\n")


main()
