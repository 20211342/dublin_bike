from flask import Flask, jsonify, render_template, request
import requests
import pymysql.cursors
import datetime
from datetime import date
import calendar
import pickle


# Load the train machine learning model
with open('final_prediction.pickle', 'rb') as handle:
    model = pickle.load(handle)

with open('final_prediction_bike_stands.pickle', 'rb') as handle:
    model = pickle.load(handle)

app = Flask(__name__, template_folder='templates')


def connect_to_database():
    connection = pymysql.connect(host='dbbikes.cnehrlobjbfz.us-east-1.rds.amazonaws.com',
                                 port=3306,
                                 user='tianjiangzhang',
                                 password='bohuicheng',
                                 db='dbbikes',
                                 charset='utf8',
                                 cursorclass=pymysql.cursors.DictCursor)
    return connection


@app.route('/')
def login():
    return render_template("home.html")


@app.route('/index')
def index():
    return render_template("index.html")


@app.route('/station')
def get_station():
    conn = connect_to_database();
    cursor = conn.cursor()
    sql = "select * from stationInfo"
    cursor.execute(sql)
    rows = cursor.fetchall()
    return jsonify(stations=[dict(row.items()) for row in rows])


@app.route('/weather')
def get_weather():
    con = connect_to_database();
    cursor = con.cursor()
    sql = "select * from weatherInfo order by currentTime desc limit 1"
    cursor.execute(sql)
    data = cursor.fetchall()
    return jsonify(weather=[dict(datas.items()) for datas in data])


@app.route('/occupancy')
def get_occ():
    co = connect_to_database();
    cursor = co.cursor()
    sql = "select * from occupancyInfo order by last_update desc limit 110"
    cursor.execute(sql)
    status = cursor.fetchall()
    return jsonify(occupancy=[dict(statu.items()) for statu in status])


@app.route('/weather_predict')
def get_weather_predict():
    url = "http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=d6e328f404504a98d4be6d3942d42e9e"
    r = requests.get(url, headers={'User-Agent': 'Chrome/100.0.4896.75'})
    data = r.json()
    return data


def get_mins():
    return datetime.datetime.now().minute


def get_hours():
    return datetime.datetime.now().hour


def get_day():
    date_ = date.today()
    return calendar.day_name[date_.weekday()]


def get_date():
    return datetime.datetime.now().date()


@app.route('/predict')
def predict(X_test):
    result = model.predict(X_test)
    return jsonify(result)

@app.route('/predictInfo')
def get_pre():
    con_pre = connect_to_database();
    cursor = con_pre.cursor()
    sql = "select * from predictInfo order by predictTime desc limit 1"
    cursor.execute(sql)
    pres = cursor.fetchall()
    return jsonify(predictInfo=[dict(pre.items()) for pre in pres])


if __name__ == '__main__':
    app.run(debug=True)












