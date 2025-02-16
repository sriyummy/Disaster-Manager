import pandas as pd
from pymongo import MongoClient

CONNECTION_STRING = "mongodb+srv://sriyam2004:1234321@disaster1.hhm2a.mongodb.net/?retryWrites=true&w=majority&appName=Disaster1"

client = MongoClient(CONNECTION_STRING)

db = client['test']
collection = db['disasters']

data = pd.DataFrame(list(collection.find()))

print(data)
