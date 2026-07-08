import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    d = int(data[1])
    c = int(data[2])
    skills = list(map(int, data[3 : 3 + n]))
    skills.sort()

    batches = 0
    i = 0
    while i < n:
        batches += 1
        start = skills[i]
        size = 0
        while i < n and skills[i] - start <= d and size < c:
            i += 1
            size += 1
    print(batches)


main()
