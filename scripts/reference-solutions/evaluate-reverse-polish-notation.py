import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    tokens = data[1 : 1 + n]
    operators = {b"+", b"-", b"*", b"/"}
    stack = []
    for tok in tokens:
        if tok in operators:
            b = stack.pop()
            a = stack.pop()
            if tok == b"+":
                stack.append(a + b)
            elif tok == b"-":
                stack.append(a - b)
            elif tok == b"*":
                stack.append(a * b)
            else:
                quotient = abs(a) // abs(b)
                if (a < 0) != (b < 0):
                    quotient = -quotient
                stack.append(quotient)
        else:
            stack.append(int(tok))
    print(stack[-1])


main()
