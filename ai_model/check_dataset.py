import os

dataset_path = "dataset/archive/plantvillage dataset/color"

classes = os.listdir(dataset_path)

print("Total classes:", len(classes))

for c in classes:
    print(c)