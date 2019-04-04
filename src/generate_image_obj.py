import os

imports = []
items = []

for fname_raw in os.listdir("./res"):
    if fname_raw[-3:] in ["jpg", "png"]:
        fname = fname_raw[:-4]
        imports.append("import {} from './res/{}';".format(fname, fname_raw))
        items.append("{}: {},".format(fname, fname))

with open ("Images.js", "w") as f:
    f.write("\n".join(imports))
    f.write("\nexport var Images = {\n")
    f.write("\n".join(items))
    f.write("};")
