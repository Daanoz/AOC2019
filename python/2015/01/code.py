from utils import filereader

def run(folder, runPart2, file="input"):
    reader = filereader.reader(folder, file)
    data = reader.get()
    level = 0
    firstBasement = None
    for x in range(len(data)):
        if data[x] == "(":
            level = level + 1
        else: 
            level = level - 1
        if level < 0 and firstBasement == None:
            firstBasement = x + 1

    print(f'End level: {level}, first basement {firstBasement}')
