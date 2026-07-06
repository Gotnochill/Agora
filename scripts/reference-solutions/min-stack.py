import sys


def main():
    data = sys.stdin.buffer.read().split()
    idx = 0
    q = int(data[idx])
    idx += 1
    stack = []
    mins = []
    out = []
    for _ in range(q):
        op = data[idx]
        idx += 1
        if op == b"push":
            x = int(data[idx])
            idx += 1
            stack.append(x)
            mins.append(x if not mins or x <= mins[-1] else mins[-1])
        elif op == b"pop":
            stack.pop()
            mins.pop()
        elif op == b"top":
            out.append(str(stack[-1]))
        else:  # getMin
            out.append(str(mins[-1]))
    sys.stdout.write("\n".join(out))
    if out:
        sys.stdout.write("\n")


main()
