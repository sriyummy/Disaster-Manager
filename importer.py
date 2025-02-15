import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objs as go
import pandas as pd
from pymongo import MongoClient
import time

CONNECTION_STRING = "mongodb+srv://sriyam2004:1234321@disaster1.hhm2a.mongodb.net/?retryWrites=true&w=majority&appName=Disaster1"

client = MongoClient(CONNECTION_STRING)
db = client['test']
collection = db['disasters']

def fetch_data():
    data = pd.DataFrame(list(collection.find()))
    return data

app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("Real-Time Disaster Data Visualization"),
    
    dcc.Graph(id='live-graph'),

    dcc.Graph(id='map-graph'),

    dcc.Interval(
        id='graph-update',
        interval=60*1000,
        n_intervals=0
    )
])

@app.callback(
    Output('live-graph', 'figure'),
    [Input('graph-update', 'n_intervals')]
)
def update_graph(n):
    data = fetch_data()
    
    if data.empty:
        return {
            'data': [],
            'layout': go.Layout(title='No data found')
        }

    data['startDate'] = pd.to_datetime(data['startDate'])

    trace = go.Scatter(
        x=data['startDate'],
        y=data['severity'],
        mode='lines+markers',
        marker=dict(color='red'),
        name='Severity'
    )

    layout = go.Layout(
        title='Disaster Severity Over Time',
        xaxis=dict(title='Date'),
        yaxis=dict(title='Severity')
    )

    return {'data': [trace], 'layout': layout}

@app.callback(
    Output('map-graph', 'figure'),
    [Input('graph-update', 'n_intervals')]
)
def update_map(n):
    data = fetch_data()
    
    if data.empty:
        return {'data': [], 'layout': go.Layout(title='No data found')}

    latitudes = data['location'].apply(lambda x: x['coordinates'][1])
    longitudes = data['location'].apply(lambda x: x['coordinates'][0])

    trace = go.Scattermapbox(
        lat=latitudes,
        lon=longitudes,
        mode='markers',
        marker=dict(size=9, color='red'),
        text=data['name'],
    )

    layout = go.Layout(
        title='Disaster Locations',
        autosize=True,
        hovermode='closest',
        mapbox=dict(
            accesstoken='pk.eyJ1Ijoic3JpeXVteXVtIiwiYSI6ImNtNzZscTZpaDB1a3Uya3NnMDM3NWRmOGgifQ.lbSKt2WSw8W-eNnW-AEVIA',  # Replace with your Mapbox token
            bearing=0,
            center=dict(lat=21.2514, lon=81.6296),
            pitch=0,
            zoom=5
        ),
    )

    return {'data': [trace], 'layout': layout}

if __name__ == '__main__':
    app.run_server(debug=True)
