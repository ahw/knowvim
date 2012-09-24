import random

def quick(ls):
    # Base cases: list of length 1 or 0 is already sorted.
    if (len(ls) == 1 or len(ls) == 0):
        return ls

    pivot = ls[len(ls) - 1] # last element is pivot
    gt = [x for x in ls[:len(ls)-1] if x > pivot]
    lt = [x for x in ls[:len(ls)-1] if x <= pivot]
    return quick(lt) + [pivot] + quick(gt)

# Create a random list.
ls = [random.randint(1, 100) for i in range(0, 30)]
print(ls)

# Get the (quick)sorted list.
ls = quick(ls)
print(ls)
