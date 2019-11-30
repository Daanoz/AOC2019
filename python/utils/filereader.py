
class reader:
    def __init__(self, folder, filename):
        self.path = folder + filename
        self.rawContents = None

    def get(self):
        if (self.rawContents != None):
            return self.rawContents
        self.rawContents = open(self.path, "r").read()
        return self.rawContents