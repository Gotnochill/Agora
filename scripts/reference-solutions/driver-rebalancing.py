import sys


def main():
    data = list(map(int, sys.stdin.buffer.read().split()))
    zones = data[0]
    current = data[1 : zones + 1]
    target = data[zones + 1 : 2 * zones + 1]

    imbalance = 0
    cost = 0
    for index in range(zones - 1):
        imbalance += current[index] - target[index]
        cost += abs(imbalance)

    print(cost)


main()