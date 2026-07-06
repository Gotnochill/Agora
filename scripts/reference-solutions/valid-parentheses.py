import sys


def main():
    s = sys.stdin.readline().strip()
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        else:
            if not stack or stack[-1] != pairs[ch]:
                print("false")
                return
            stack.pop()
    print("true" if not stack else "false")


main()
