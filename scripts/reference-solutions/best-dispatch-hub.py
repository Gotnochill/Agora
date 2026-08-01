import sys


def main():
    data = list(map(int, sys.stdin.buffer.read().split()))
    intersections = data[0]
    graph = [[] for _ in range(intersections)]
    for index in range(1, len(data), 3):
        first, second, weight = data[index : index + 3]
        graph[first].append((second, weight))
        graph[second].append((first, weight))

    parent = [-1] * intersections
    parent_weight = [0] * intersections
    distance = [0] * intersections
    order = [0]
    for node in order:
        for neighbor, weight in graph[node]:
            if neighbor == parent[node]:
                continue
            parent[neighbor] = node
            parent_weight[neighbor] = weight
            distance[neighbor] = distance[node] + weight
            order.append(neighbor)

    subtree_size = [1] * intersections
    for node in reversed(order[1:]):
        subtree_size[parent[node]] += subtree_size[node]

    cost = [0] * intersections
    cost[0] = sum(distance)
    for node in order[1:]:
        outside = intersections - subtree_size[node]
        cost[node] = cost[parent[node]] + (outside - subtree_size[node]) * parent_weight[node]

    print(*cost)


main()