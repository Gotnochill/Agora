import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    charge = 0
    resets = 0
    for i in range(n):
        charge += int(data[1 + i])
        if charge < 0:
            charge = 0
            resets += 1
    print(charge, resets)


main()
