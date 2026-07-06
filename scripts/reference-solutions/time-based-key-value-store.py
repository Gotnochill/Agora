import sys
from bisect import bisect_right


def main():
    data = sys.stdin.buffer.read().split()
    idx = 0
    q = int(data[idx])
    idx += 1
    store = {}  # key -> (list of timestamps, list of values), timestamps increasing
    out = []
    for _ in range(q):
        op = data[idx]
        idx += 1
        if op == b"set":
            key = data[idx]
            value = data[idx + 1]
            timestamp = int(data[idx + 2])
            idx += 3
            if key not in store:
                store[key] = ([], [])
            times, values = store[key]
            times.append(timestamp)
            values.append(value)
        else:  # get
            key = data[idx]
            timestamp = int(data[idx + 1])
            idx += 2
            if key not in store:
                out.append("EMPTY")
                continue
            times, values = store[key]
            pos = bisect_right(times, timestamp)
            if pos == 0:
                out.append("EMPTY")
            else:
                out.append(values[pos - 1].decode())
    sys.stdout.write("\n".join(out))
    if out:
        sys.stdout.write("\n")


main()
