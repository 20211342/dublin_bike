#This is a python file which is used to scratch data from JCDecaux

import requests
import time
import sqlalchemy as sqla 
from sqlalchemy import create_engine 
import pandas as pd
import traceback 
import os 
import json  

def main():   
    #create connectio to the database
    engine = create_sql_connector()
    #create static table and dynamic table framework
    create_table(engine)
    #insert static data
    stations_to_db(engine)
    try:
        while True:
            occupancy_to_db(engine)
            weather_to_db(engine)
            time.sleep(4 * 24 * 60 * 60)
    except:
        print("Scratch Data Error")
        engine.close()
        return 

def create_sql_connector():
    """This function is used to create engine and connect to the database, the engine created
    will be returned"""
    """
    HOST = "localhost"
    USERNAME = "root"
    PASSWORD = "root"
    DATABASE = "localbikes"
    PORT = "3306"
    """
    HOST = "dbbikes.cnehrlobjbfz.us-east-1.rds.amazonaws.com"
    USERNAME = "tianjiangzhang"
    PASSWORD = "bohuicheng"
    DATABASE = "dbbikes"
    PORT = "3306"
    engine = create_engine("mysql://{}:{}@{}:{}/{}".format(USERNAME, PASSWORD, HOST, PORT, DATABASE), echo=True)
    connection = engine.connect()
    return connection

def create_table(engine):
    """This function is used to create static table and dynamic table"""
    #create static station table
    sql = """
    CREATE TABLE IF NOT EXISTS stationInfo(
        stationNo int,
        stationName varchar(45),
        stationAddress varchar(45),
        latitude float,
        longitude float
    );"""
    engine.execute(sql)
    #create dynamic station table(occupancy info table)
    sql = """
    CREATE TABLE IF NOT EXISTS occupancyInfo(
        last_update float,
        latitude float,
        longitude float,
        stationNo int,
        stationName varchar(45),
        status varchar(10),
        banking tinyint(1),
        bonus tinyint(1),
        bike_stands int,
        avaiable_bike_stands int,
        avaiable_bikes int
    );"""
    engine.execute(sql)
    #create weather table
    # attention: the use of reservered keywords
    sql = """
    CREATE TABLE IF NOT EXISTS weatherInfo(
        currentTime int,
        temperature float,
        feelslikeTemp float,
        humidity int,
        uvi float,
        cloud int,
        visibility int,
        windSpeed float,
        windDegree int,
        weather varchar(10)
    );"""
    engine.execute(sql)
    #create predict table
    sql = """
    CREATE TABLE IF NOT EXISTS predictInfo(
        predictTime int,
        temperature float,
        feelslikeTemp float,
        humidity int,
        visibility int,
        windSpeed float,
        weather varchar(10)
    );"""
    engine.execute(sql)

#read static info from json file and insert the data into the database
def stations_to_db(engine):
    #read static json file from website
    url = "https://developer.jcdecaux.com/rest/vls/stations/dublin.json"
    r = requests.get(url)
    stations = r.json()
    #read table data using pandas
    df = pd.read_sql_table("stationInfo", engine)    
    if(df.shape[0] == 0):#df.shape[0]: rows
        for station in stations:
            #access each station's data separately        
            vals = (station.get('number'), station.get('name'), 
                    station.get('address'), station.get('latitude'), 
                    station.get('longitude'))
            #insert the data into the database
            #needed to check if the static table is empty
            engine.execute("insert into stationInfo \
            values(%s, %s, %s, %s, %s)", vals)

# url = "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=a960843e0524f58cfd52c711af79365031a6e4a9"

STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
APIKEY = "a960843e0524f58cfd52c711af79365031a6e4a9"
CONTRACT = "dublin"

def get_occupancy_data():
    """This function is used to get realtime occupancy data from JCDecaux"""
    r = requests.get(STATIONS, params={"apiKey": APIKEY, "contract": CONTRACT})
    data = r.json()
    return data

def occupancy_to_db(engine):
    """This function is used to insert dynamic data into database"""
    data = get_occupancy_data()
    #insert data into database
    for station in data:
        #access each station's data separately        
        vals = (station.get('last_update') / 1000,
                station.get('position').get('lat'),
                station.get('position').get('lng'),
                station.get('number'), station.get('name'),
                station.get('status'),station.get('banking'), 
                station.get('bonus'), station.get('bike_stands'), 
                station.get('available_bike_stands'), 
                station.get('available_bikes'))
        engine.execute("insert into occupancyInfo values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", vals)

def get_weather_info():
    """This function is used to get weather info with API provided by 'Weather API'"""
    url = "https://api.openweathermap.org/data/2.5/onecall?lat=53.344&lon=-6.2672&units=metric&exclude=minutely,daily&appid=d6e328f404504a98d4be6d3942d42e9e"
    r = requests.get(url)
    data = r.json()
    return data
  
def weather_to_db(engine):
    """This function is used to insert weather data into the database"""
    weathers = get_weather_info()
    #insert data into database
    weather = weathers.get('current')
    vals = (weather.get('dt'),
            weather.get('temp'),
            weather.get('feels_like'),
            weather.get('humidity'),
            weather.get('uvi'),
            weather.get('clouds'),
            weather.get('visibility'),
            weather.get('wind_speed'),
            weather.get('wind_deg'),
            weather.get('weather')[0].get('main'))
    engine.execute("insert into weatherInfo values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", vals)                 

def get_predict_info():
    """This function is used to get weather info with API provided by 'Weather API'"""
    url = "http://api.openweathermap.org/data/2.5/forecast?id=524901&lat=53.344&lon=-6.2672&units=metric&appid=d6e328f404504a98d4be6d3942d42e9e"
    r = requests.get(url)
    data = r.json()
    return data 

def predict_to_db(engine):
    """This function is used to insert predict weather data into the database"""
    weathers = get_predict_info()
    #insert data into database
    weatherList = weathers.get('list')
    for weather in weatherList:
        vals = (weather.get('dt'),
                weather.get('main').get('temp'),
                weather.get('main').get('feels_like'),
                weather.get('main').get('humidity'),
                weather.get('visibility'),
                weather.get('wind').get('speed'),
                weather.get('weather')[0].get('main'))
        engine.execute("insert into predictInfo values(%s, %s, %s, %s, %s, %s, %s)", vals)    


main()
