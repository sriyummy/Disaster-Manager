import pandas as pd
from pymongo import MongoClient
from tableauhyperapi import HyperProcess, Connection, Telemetry, TableDefinition, SqlType, Inserter, TableName, CreateMode
import datetime

CONNECTION_STRING = "mongodb+srv://sriyam2004:1234321@disaster1.hhm2a.mongodb.net/?retryWrites=true&w=majority&appName=Disaster1"

client = MongoClient(CONNECTION_STRING)
db = client['test']
collection = db['disasters']

data = pd.DataFrame(list(collection.find()))

if data.empty:
    print("No data fetched from MongoDB. Exiting...")
    exit()

print(data)

hyper_file = "mongo_data.hyper"
table_name = TableName("Extract", "MongoData")

table_definition = TableDefinition(
    table_name=table_name,
    columns=[
        TableDefinition.Column("_id", SqlType.text()),
        TableDefinition.Column("name", SqlType.text()),
        TableDefinition.Column("value", SqlType.double()),
        TableDefinition.Column("timestamp", SqlType.timestamp())
    ]
)

def create_hyper_file(dataframe):
    with HyperProcess(telemetry=Telemetry.DO_NOT_SEND_USAGE_DATA_TO_TABLEAU) as hyper:
        with Connection(endpoint=hyper.endpoint, database=hyper_file, create_mode=CreateMode.CREATE_AND_REPLACE) as connection:
            connection.catalog.create_schema("Extract")
            connection.catalog.create_table(table_definition)

            with Inserter(connection, table_definition) as inserter:
                for index, row in dataframe.iterrows():
                    inserter.add_row([
                        str(row['_id']),
                        row.get('name', 'Unknown'),
                        row.get('value', 0.0),
                        pd.to_datetime(row.get('timestamp', datetime.datetime.utcnow()))
                    ])
                inserter.execute()

create_hyper_file(data)

print(f"Data exported to {hyper_file}")
