import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    temps = list(map(int, data[1 : 1 + n]))
    res = [0] * n
    stack = []  # indices of days awaiting a warmer temperature
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            res[j] = i - j
        stack.append(i)
    sys.stdout.write(" ".join(map(str, res)) + "\n")


main()
