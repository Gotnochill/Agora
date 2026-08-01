import sys


def main():
    data = sys.stdin.buffer.read().split()
    services = int(data[0])
    entries = int(data[1])

    exclusive = [0] * services
    call_stack = []
    previous = 0

    for index in range(entries):
        raw_id, action, raw_timestamp = data[2 + index].split(b":")
        service_id = int(raw_id)
        timestamp = int(raw_timestamp)

        if action == b"start":
            # The caller pauses here, so it only owns the units before this start.
            if call_stack:
                exclusive[call_stack[-1]] += timestamp - previous
            call_stack.append(service_id)
            previous = timestamp
        else:
            # An end timestamp is inclusive, hence the +1.
            exclusive[call_stack.pop()] += timestamp - previous + 1
            previous = timestamp + 1

    print(*exclusive)


main()
